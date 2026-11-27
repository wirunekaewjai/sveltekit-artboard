import type { ChildProcessWithoutNullStreams } from 'node:child_process';

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createWriteStream, promises as fs, mkdirSync } from 'node:fs';
import path from 'node:path';

import { v7 as uuidv7 } from 'uuid';
import * as v from 'valibot';

import type {
  AgentInfo,
  AgentSettings,
  AgentSettingsPatch,
  AgentState,
  CommentRun,
  McpServerOption,
  Provider,
} from '#src/core/agent-state.ts';
import type { Result } from '#src/core/result.ts';
import type { CommentStore } from '#src/core/store.ts';
import type { ModelOption } from '#src/server/agent/models.ts';
import type {
  AgentPolicy,
  Invocation,
  InvokeContext,
  ParsedEvent,
} from '#src/server/agent/providers.ts';
import type { SettingsStore } from '#src/server/agent/settings.ts';

import { AgentStateSchema, emptyAgentState, PROVIDERS } from '#src/core/agent-state.ts';
import { writeFileAtomic } from '#src/core/atomic-write.ts';
import { err, ok } from '#src/core/result.ts';
import { COMMENT_ID_PATTERN } from '#src/core/schema.ts';
import { discoverMcpServers } from '#src/server/agent/mcp.ts';
import { createModelCatalog } from '#src/server/agent/models.ts';
import { buildInvocation, parseLine, resolveCommand } from '#src/server/agent/providers.ts';

export type RunRejection = { id: string; reason: 'not_found' | 'not_open' | 'busy' };

export type RunFailure = {
  code: 'disabled' | 'paused' | 'provider_unavailable' | 'no_eligible';
  rejected: RunRejection[];
};

export type RunAccepted = { runId: string; accepted: string[]; rejected: RunRejection[] };

export type AgentRunnerOptions = {
  root: string;
  dir: string;
  store: CommentStore;
  settings: SettingsStore;
  policy: AgentPolicy;
  onChange: () => void;
  onLog?: (runId: string) => void;
  warn?: (message: string) => void;
  now?: () => string;
  invoke?: (context: InvokeContext) => Invocation;
  isAvailable?: (provider: Provider) => Promise<boolean>;
  models?: (provider: Provider) => Promise<ModelOption[] | null>;
  mcpServers?: (provider: Provider) => Promise<McpServerOption[]>;
};

export type AgentRunner = {
  init: () => Promise<void>;
  info: () => Promise<AgentInfo>;
  models: (provider: Provider) => Promise<ModelOption[] | null>;
  mcpServers: (provider: Provider) => Promise<McpServerOption[]>;
  readLog: (runId: string) => Promise<{ raw: string; active: boolean } | null>;
  run: (ids: string[]) => Promise<Result<RunAccepted, RunFailure>>;
  cancel: () => Promise<void>;
  resume: () => Promise<Result<null, 'not_paused' | 'disabled'>>;
  updateSettings: (patch: AgentSettingsPatch) => Promise<AgentSettings>;
  reconcile: () => Promise<void>;
  forget: (id: string) => Promise<void>;
  isRunning: (id: string) => boolean;
  isWorking: () => boolean;
  dispose: () => void;
};

const MAX_LOGS = 30;
const AVAILABILITY_TTL_MS = 30_000;
const PROBE_TIMEOUT_MS = 8000;

const probeCommand = (command: string): Promise<boolean> => {
  return new Promise((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const done = (available: boolean): void => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(available);
      }
    };

    try {
      const probe = spawn(command, ['--version'], { stdio: 'ignore', windowsHide: true });
      timer = setTimeout(() => {
        probe.kill();
        done(false);
      }, PROBE_TIMEOUT_MS);
      probe.on('error', () => {
        done(false);
      });
      probe.on('close', (code) => {
        done(code === 0);
      });
    } catch {
      done(false);
    }
  });
};

const killProcessTree = (child: ChildProcessWithoutNullStreams): void => {
  if (!child.pid) {
    return;
  }
  if (process.platform === 'win32') {
    spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
  } else {
    try {
      child.kill('SIGTERM');
    } catch {
      // Ignore already exited
    }
  }
};

const hashPath = async (root: string, relEntry: string): Promise<Map<string, string>> => {
  const result = new Map<string, string>();
  const full = path.resolve(root, relEntry);

  const walk = async (target: string): Promise<void> => {
    try {
      const stat = await fs.stat(target);
      if (stat.isFile()) {
        const content = await fs.readFile(target);
        const hash = createHash('sha256').update(content).digest('hex');
        result.set(path.relative(root, target).replaceAll('\\', '/'), hash);
      } else if (stat.isDirectory()) {
        const entries = await fs.readdir(target);
        for (const entry of entries) {
          if (entry === 'node_modules' || entry === '.git') {
            continue;
          }
          await walk(path.join(target, entry));
        }
      }
    } catch {
      // Missing protected file is fine
    }
  };

  await walk(full);
  return result;
};

const snapshotProtected = async (
  root: string,
  protectedFiles: readonly string[],
): Promise<Map<string, string>> => {
  const combined = new Map<string, string>();
  for (const entry of protectedFiles) {
    const partial = await hashPath(root, entry);
    for (const [file, hash] of partial) {
      combined.set(file, hash);
    }
  }
  return combined;
};

const diffProtected = (before: Map<string, string>, after: Map<string, string>): string[] => {
  const changed: string[] = [];
  const allKeys = new Set([...before.keys(), ...after.keys()]);
  for (const key of allKeys) {
    if (before.get(key) !== after.get(key)) {
      changed.push(key);
    }
  }
  return changed.sort();
};

export const createAgentRunner = (options: AgentRunnerOptions): AgentRunner => {
  const agentDir = path.join(options.dir, 'agent');
  const logsDir = path.join(agentDir, 'logs');
  const statePath = path.join(agentDir, 'state.json');

  const now =
    options.now ??
    ((): string => {
      return new Date().toISOString();
    });

  const invoke = options.invoke ?? buildInvocation;
  const catalog =
    options.models ??
    createModelCatalog((provider) => {
      return resolveCommand(provider, options.policy);
    });

  let state: AgentState = emptyAgentState();
  let activeChild: ChildProcessWithoutNullStreams | null = null;
  let activeCancelled = false;
  let availabilityCache: { at: number; map: Record<Provider, boolean> } | null = null;
  let saveQueue: Promise<void> = Promise.resolve();

  const saveState = async (): Promise<void> => {
    const snapshot = `${JSON.stringify(state, null, 2)}\n`;
    const next = saveQueue.then(async () => {
      await writeFileAtomic(statePath, snapshot);
      options.onChange();
    });
    saveQueue = next.catch(() => {
      // Keep queue alive on write error
    });
    return next;
  };

  const checkAvailable = async (): Promise<Record<Provider, boolean>> => {
    const nowMs = Date.now();
    if (availabilityCache && nowMs - availabilityCache.at < AVAILABILITY_TTL_MS) {
      return availabilityCache.map;
    }

    const entries = await Promise.all(
      PROVIDERS.map(async (provider): Promise<[Provider, boolean]> => {
        if (options.isAvailable) {
          return [provider, await options.isAvailable(provider)];
        }
        const cmd = resolveCommand(provider, options.policy);
        return [provider, await probeCommand(cmd)];
      }),
    );

    const map: Record<Provider, boolean> = {
      claude: false,
      antigravity: false,
    };
    for (const [provider, okFlag] of entries) {
      map[provider] = okFlag;
    }

    availabilityCache = { at: nowMs, map };
    return map;
  };

  const pruneLogs = async (): Promise<void> => {
    try {
      const files = (await fs.readdir(logsDir))
        .filter((f) => {
          return f.endsWith('.log');
        })
        .sort();
      if (files.length <= MAX_LOGS) {
        return;
      }
      const toRemove = files.slice(0, files.length - MAX_LOGS);
      for (const file of toRemove) {
        await fs.rm(path.join(logsDir, file), { force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  };

  const isRunning = (id: string): boolean => {
    return state.activeRunId !== null && state.activeCommentIds.includes(id);
  };

  const isQueued = (id: string): boolean => {
    return state.queue.some((round) => {
      return round.commentIds.includes(id);
    });
  };

  const executeRound = async (runId: string, commentIds: string[]): Promise<void> => {
    const settings = await options.settings.read();
    const files = commentIds.map((id) => {
      return options.store.relativePathFor(id);
    });
    const prompt = options.policy.prompt({
      files,
      allowedCommands: options.policy.allowedCommands,
    });

    const invocation = invoke({
      provider: settings.provider,
      prompt,
      files,
      model: settings.model,
      effort: settings.effort,
      allowedMcp: settings.allowedMcp,
      policy: options.policy,
    });

    state.activeRunId = runId;
    state.activeCommentIds = [...commentIds];
    const ts = now();
    for (const id of commentIds) {
      state.runs[id] = {
        commentId: id,
        runId,
        status: 'running',
        summary: null,
        error: null,
        protectedTouched: [],
        updatedAt: ts,
      };
    }
    await saveState();

    mkdirSync(logsDir, { recursive: true });
    const logStream = createWriteStream(path.join(logsDir, `${runId}.log`), { flags: 'a' });
    const protectedBefore = await snapshotProtected(options.root, options.policy.protectedFiles);

    activeCancelled = false;

    type RoundOutcome = {
      rateLimited: { resetsAt: number | null; status: string } | null;
      lastResult: Extract<ParsedEvent, { kind: 'result' }> | null;
      stderrTail: string;
      timedOut: boolean;
      spawnError: string | null;
      exitCode: number | null;
    };

    const outcome = await new Promise<RoundOutcome>((resolve) => {
      let lineBuf = '';
      let timer: ReturnType<typeof setTimeout> | undefined;
      let logNotifyTimer: ReturnType<typeof setTimeout> | undefined;
      let rateLimited: { resetsAt: number | null; status: string } | null = null;
      let lastResult: Extract<ParsedEvent, { kind: 'result' }> | null = null;
      let stderrTail = '';
      let timedOut = false;
      let spawnError: string | null = null;
      let exitCode: number | null = null;

      const scheduleLogNotify = (): void => {
        if (!options.onLog || logNotifyTimer) {
          return;
        }
        logNotifyTimer = setTimeout(() => {
          logNotifyTimer = undefined;
          options.onLog?.(runId);
        }, 250);
      };

      const finish = (): void => {
        clearTimeout(timer);
        if (logNotifyTimer) {
          clearTimeout(logNotifyTimer);
          logNotifyTimer = undefined;
        }
        activeChild = null;
        resolve({ rateLimited, lastResult, stderrTail, timedOut, spawnError, exitCode });
      };

      try {
        const child = spawn(invocation.command, invocation.args, {
          cwd: options.root,
          windowsHide: true,
        });
        activeChild = child;

        timer = setTimeout(() => {
          timedOut = true;
          killProcessTree(child);
        }, options.policy.timeoutMs);

        if (invocation.stdin !== null) {
          child.stdin.write(invocation.stdin);
          child.stdin.end();
        } else {
          child.stdin.end();
        }

        child.stdout.on('data', (chunk: Buffer) => {
          const text = chunk.toString('utf8');
          logStream.write(text);
          scheduleLogNotify();
          lineBuf += text;
          const lines = lineBuf.split(/\r?\n/);
          lineBuf = lines.pop() ?? '';
          for (const line of lines) {
            const event = parseLine(line);
            if (!event) {
              continue;
            }
            if (event.kind === 'rate_limit') {
              rateLimited = { resetsAt: event.resetsAt, status: event.status };
            } else {
              lastResult = event;
            }
          }
        });

        child.stderr.on('data', (chunk: Buffer) => {
          const text = chunk.toString('utf8');
          logStream.write(text);
          scheduleLogNotify();
          stderrTail = (stderrTail + text).slice(-2000);
        });

        child.on('error', (error) => {
          spawnError = error.message;
          finish();
        });

        child.on('close', (code) => {
          exitCode = code;
          if (lineBuf.trim()) {
            const event = parseLine(lineBuf);
            if (event?.kind === 'result') {
              lastResult = event;
            }
          }
          finish();
        });
      } catch (error) {
        spawnError = error instanceof Error ? error.message : String(error);
        finish();
      }
    });

    const { rateLimited, lastResult, stderrTail, timedOut, spawnError, exitCode } = outcome;

    await new Promise<void>((resolve) => {
      logStream.end(() => {
        resolve();
      });
    });
    options.onLog?.(runId);
    await pruneLogs();
    await options.store.repairAll();

    const protectedAfter = await snapshotProtected(options.root, options.policy.protectedFiles);
    const protectedTouched = diffProtected(protectedBefore, protectedAfter);

    const endTs = now();
    const failedHard =
      !activeCancelled &&
      (spawnError !== null || timedOut || (exitCode !== null && exitCode !== 0));

    let errorMsg: string | null = null;
    if (spawnError) {
      errorMsg = spawnError;
    } else if (timedOut) {
      errorMsg = 'Agent run timed out.';
    } else if (exitCode !== null && exitCode !== 0) {
      errorMsg = stderrTail.trim() || `Agent exited with code ${exitCode}.`;
    }

    for (const id of commentIds) {
      const comment = await options.store.get(id);
      let status: CommentRun['status'];
      let summary: string | null = comment?.resolution ?? lastResult?.text ?? null;

      if (activeCancelled) {
        status = 'cancelled';
      } else if (comment?.status === 'resolved') {
        status = 'done';
      } else if (failedHard) {
        status = 'failed';
      } else {
        status = 'needs_attention';
        if (lastResult?.denied.length) {
          const deniedNote = `Denied: ${lastResult.denied.join(', ')}`;
          summary = summary ? `${summary} (${deniedNote})` : deniedNote;
        }
      }

      state.runs[id] = {
        commentId: id,
        runId,
        status,
        summary,
        error: failedHard ? errorMsg : null,
        protectedTouched,
        updatedAt: endTs,
      };
    }

    state.activeRunId = null;
    state.activeCommentIds = [];

    if (!activeCancelled && rateLimited !== null) {
      const rl = rateLimited as { resetsAt: number | null; status: string };
      state.paused = {
        kind: 'rate_limit',
        message: 'Usage limit reached. Queue paused.',
        resetsAt: rl.resetsAt,
      };
    } else if (failedHard) {
      state.paused = {
        kind: 'error',
        message: errorMsg ?? 'Agent round failed. Queue paused.',
        resetsAt: null,
      };
    }

    await saveState();
    drainQueue();
  };

  const drainQueue = (): void => {
    if (state.activeRunId !== null || state.paused !== null) {
      return;
    }
    const next = state.queue.shift();
    if (!next) {
      return;
    }
    // Claim active run synchronously so `isWorking()` is immediately true
    state.activeRunId = next.runId;
    state.activeCommentIds = [...next.commentIds];
    void executeRound(next.runId, next.commentIds);
  };

  return {
    init: async (): Promise<void> => {
      try {
        const raw = await fs.readFile(statePath, 'utf8');
        const parsed = v.safeParse(AgentStateSchema, JSON.parse(raw) as unknown);
        if (parsed.success) {
          state = parsed.output;
        }
      } catch {
        state = emptyAgentState();
      }

      // If dev server restarted mid-run, mark active comments failed and pause remaining queue
      if (state.activeRunId !== null) {
        const ts = now();
        for (const id of state.activeCommentIds) {
          state.runs[id] = {
            commentId: id,
            runId: state.activeRunId,
            status: 'failed',
            summary: null,
            error: 'Dev server restarted mid-run.',
            protectedTouched: [],
            updatedAt: ts,
          };
        }
        state.activeRunId = null;
        state.activeCommentIds = [];
        if (state.queue.length > 0) {
          state.paused = {
            kind: 'restart',
            message: 'Dev server restarted while queue was active.',
            resetsAt: null,
          };
        }
        await saveState();
      }
    },
    info: async (): Promise<AgentInfo> => {
      const [settings, available] = await Promise.all([options.settings.read(), checkAvailable()]);
      return { settings, available, state };
    },
    models: async (provider: Provider): Promise<ModelOption[] | null> => {
      return catalog(provider);
    },
    mcpServers: async (provider: Provider): Promise<McpServerOption[]> => {
      if (options.mcpServers) {
        return options.mcpServers(provider);
      }
      return discoverMcpServers(provider, options.root);
    },
    readLog: async (runId: string): Promise<{ raw: string; active: boolean } | null> => {
      if (!COMMENT_ID_PATTERN.test(runId)) {
        return null;
      }
      try {
        const raw = await fs.readFile(path.join(logsDir, `${runId}.log`), 'utf8');
        return { raw, active: state.activeRunId === runId };
      } catch {
        if (state.activeRunId === runId) {
          return { raw: '', active: true };
        }
        return null;
      }
    },
    run: async (ids: string[]): Promise<Result<RunAccepted, RunFailure>> => {
      const settings = await options.settings.read();
      if (!settings.enabled) {
        return err({ code: 'disabled', rejected: [] });
      }
      if (state.paused !== null) {
        return err({ code: 'paused', rejected: [] });
      }
      const available = await checkAvailable();
      if (!available[settings.provider]) {
        return err({ code: 'provider_unavailable', rejected: [] });
      }

      const uniqueIds = [...new Set(ids)];
      const accepted: string[] = [];
      const rejected: RunRejection[] = [];

      for (const id of uniqueIds) {
        if (isRunning(id) || isQueued(id)) {
          rejected.push({ id, reason: 'busy' });
          continue;
        }
        const comment = await options.store.get(id);
        if (!comment) {
          rejected.push({ id, reason: 'not_found' });
          continue;
        }
        if (comment.status !== 'open') {
          rejected.push({ id, reason: 'not_open' });
          continue;
        }
        accepted.push(id);
      }

      if (accepted.length === 0) {
        return err({ code: 'no_eligible', rejected });
      }

      const runId = uuidv7();
      const ts = now();
      state.queue.push({ runId, commentIds: accepted, createdAt: ts });
      for (const id of accepted) {
        state.runs[id] = {
          commentId: id,
          runId,
          status: 'queued',
          summary: null,
          error: null,
          protectedTouched: [],
          updatedAt: ts,
        };
      }
      await saveState();
      drainQueue();

      return ok({ runId, accepted, rejected });
    },
    cancel: async (): Promise<void> => {
      activeCancelled = true;
      const ts = now();

      for (const round of state.queue) {
        for (const id of round.commentIds) {
          state.runs[id] = {
            commentId: id,
            runId: round.runId,
            status: 'cancelled',
            summary: null,
            error: null,
            protectedTouched: [],
            updatedAt: ts,
          };
        }
      }
      state.queue = [];
      state.paused = null;

      if (activeChild) {
        killProcessTree(activeChild);
      }
      await saveState();
    },
    resume: async (): Promise<Result<null, 'not_paused' | 'disabled'>> => {
      const settings = await options.settings.read();
      if (!settings.enabled) {
        return err('disabled');
      }
      if (state.paused === null) {
        return err('not_paused');
      }
      state.paused = null;
      await saveState();
      drainQueue();
      return ok(null);
    },
    updateSettings: async (patch: AgentSettingsPatch): Promise<AgentSettings> => {
      const updated = await options.settings.update(patch);
      options.onChange();
      return updated;
    },
    reconcile: async (): Promise<void> => {
      let changed = false;
      for (const round of state.queue) {
        const before = round.commentIds.length;
        const kept: string[] = [];
        for (const id of round.commentIds) {
          const comment = await options.store.get(id);
          if (comment?.status === 'open') {
            kept.push(id);
          } else {
            delete state.runs[id];
          }
        }
        if (kept.length !== before) {
          round.commentIds = kept;
          changed = true;
        }
      }
      state.queue = state.queue.filter((r) => {
        return r.commentIds.length > 0;
      });
      if (changed) {
        await saveState();
      }
    },
    forget: async (id: string): Promise<void> => {
      let changed = false;
      if (id in state.runs) {
        delete state.runs[id];
        changed = true;
      }
      for (const round of state.queue) {
        const next = round.commentIds.filter((c) => {
          return c !== id;
        });
        if (next.length !== round.commentIds.length) {
          round.commentIds = next;
          changed = true;
        }
      }
      state.queue = state.queue.filter((r) => {
        return r.commentIds.length > 0;
      });
      if (changed) {
        await saveState();
      }
    },
    isRunning,
    isWorking: (): boolean => {
      return state.activeRunId !== null;
    },
    dispose: (): void => {
      if (activeChild) {
        activeCancelled = true;
        killProcessTree(activeChild);
        activeChild = null;
      }
    },
  };
};
