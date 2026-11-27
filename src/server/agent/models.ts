import { spawn } from 'node:child_process';

import type { Provider } from '#src/core/agent-state.ts';

export type ModelOption = {
  id: string;
  label: string;
};

const CLAUDE_MODELS: ModelOption[] = [
  { id: 'opus', label: 'Claude Opus' },
  { id: 'sonnet', label: 'Claude Sonnet' },
  { id: 'haiku', label: 'Claude Haiku' },
];

const CACHE_TTL_MS = 5 * 60 * 1000;
const LIST_TIMEOUT_MS = 8000;

const parseAgyModels = (stdout: string): ModelOption[] | null => {
  const trimmed = stdout.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const json: unknown = JSON.parse(trimmed);
    if (Array.isArray(json)) {
      const list = json
        .map((item): ModelOption | null => {
          if (typeof item === 'string') {
            return { id: item, label: item };
          }
          if (item && typeof item === 'object' && 'id' in item && typeof item.id === 'string') {
            const label = 'label' in item && typeof item.label === 'string' ? item.label : item.id;
            return { id: item.id, label };
          }
          return null;
        })
        .filter((x): x is ModelOption => {
          return x !== null;
        });
      return list.length > 0 ? list : null;
    }
  } catch {
    // Fall back to line-based parsing
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => {
      return line.trim();
    })
    .filter((line) => {
      return line.length > 0 && !line.startsWith('Available') && !line.startsWith('---');
    });

  const options: ModelOption[] = [];
  for (const line of lines) {
    const parts = line.split(/\s{2,}|\t/);
    const token = parts[0]?.trim().split(/\s+/)[0];
    if (token && /^[a-z0-9._:/-]+$/i.test(token)) {
      const restLabel = parts.slice(1).join(' ').trim();
      const label =
        restLabel ||
        token.replace(/[-_]+/g, ' ').replace(/\b\w/g, (ch) => {
          return ch.toUpperCase();
        });
      options.push({ id: token, label });
    }
  }

  return options.length > 0 ? options : null;
};

const runAgyModels = (command: string): Promise<ModelOption[] | null> => {
  return new Promise((resolve) => {
    let stdout = '';
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const done = (value: ModelOption[] | null): void => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(value);
      }
    };

    try {
      const child = spawn(command, ['models'], { windowsHide: true });
      timer = setTimeout(() => {
        child.kill();
        done(null);
      }, LIST_TIMEOUT_MS);

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString('utf8');
      });
      child.on('error', () => {
        done(null);
      });
      child.on('close', (code) => {
        done(code === 0 ? parseAgyModels(stdout) : null);
      });
    } catch {
      done(null);
    }
  });
};

export const createModelCatalog = (
  resolveCommand: (provider: Provider) => string,
): ((provider: Provider) => Promise<ModelOption[] | null>) => {
  let cachedAgy: { at: number; models: ModelOption[] | null } | null = null;

  return async (provider: Provider): Promise<ModelOption[] | null> => {
    if (provider === 'claude') {
      return CLAUDE_MODELS;
    }

    const now = Date.now();
    if (cachedAgy && now - cachedAgy.at < CACHE_TTL_MS) {
      return cachedAgy.models;
    }

    const models = await runAgyModels(resolveCommand('antigravity'));
    cachedAgy = { at: now, models };
    return models;
  };
};
