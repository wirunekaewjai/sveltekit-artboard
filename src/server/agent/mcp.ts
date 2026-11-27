import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { McpServerOption, Provider } from '#src/core/agent-state.ts';

type Json = Record<string, unknown>;

const asRecord = (value: unknown): Json | null => {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : null;
};

const readJsonFile = async (filePath: string): Promise<Json | null> => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return asRecord(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
};

const collectServerKeys = (
  record: Json | null,
  source: string,
  target: Map<string, McpServerOption>,
): void => {
  const servers = asRecord(record?.mcpServers);
  if (!servers) {
    return;
  }
  for (const name of Object.keys(servers)) {
    const trimmed = name.trim();
    if (trimmed && !target.has(trimmed)) {
      target.set(trimmed, { name: trimmed, source });
    }
  }
};

const collectDirNames = async (
  dirPath: string,
  source: string,
  target: Map<string, McpServerOption>,
): Promise<void> => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.trim() && !target.has(entry.name)) {
        target.set(entry.name, { name: entry.name, source });
      }
    }
  } catch {
    // Missing directory is fine
  }
};

const normalizeFsPath = (value: string): string => {
  const resolved = path.resolve(value).replaceAll('\\', '/');
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
};

export const discoverMcpServers = async (
  provider: Provider,
  root: string,
): Promise<McpServerOption[]> => {
  const home = os.homedir();
  const found = new Map<string, McpServerOption>();

  if (provider === 'antigravity') {
    const configCandidates: Array<{ file: string; source: string }> = [
      { file: path.join(root, '.agents', 'mcp_config.json'), source: 'project' },
      { file: path.join(home, '.gemini', 'antigravity-cli', 'mcp_config.json'), source: 'cli' },
      { file: path.join(home, '.gemini', 'antigravity', 'mcp_config.json'), source: 'global' },
      { file: path.join(home, '.gemini', 'config', 'mcp_config.json'), source: 'global' },
    ];

    for (const candidate of configCandidates) {
      const json = await readJsonFile(candidate.file);
      collectServerKeys(json, candidate.source, found);
    }

    await collectDirNames(path.join(home, '.gemini', 'antigravity-cli', 'mcp'), 'cli', found);
    await collectDirNames(path.join(home, '.gemini', 'antigravity', 'mcp'), 'global', found);
  } else {
    const projectMcp = await readJsonFile(path.join(root, '.mcp.json'));
    collectServerKeys(projectMcp, 'project', found);

    const claudeJson = await readJsonFile(path.join(home, '.claude.json'));
    const projects = asRecord(claudeJson?.projects);
    if (projects) {
      const normalizedRoot = normalizeFsPath(root);
      for (const [projPath, projConfig] of Object.entries(projects)) {
        if (normalizeFsPath(projPath) === normalizedRoot) {
          collectServerKeys(asRecord(projConfig), 'project', found);
        }
      }
    }
    collectServerKeys(claudeJson, 'global', found);

    const claudeSettings = await readJsonFile(path.join(home, '.claude', 'settings.json'));
    collectServerKeys(claudeSettings, 'global', found);
  }

  return [...found.values()].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
};
