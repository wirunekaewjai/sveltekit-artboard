export type AgentLogEntry =
  | {
      id: string;
      kind: 'init';
      provider: 'agy' | 'claude' | null;
      model: string | null;
      cwd: string | null;
    }
  | {
      id: string;
      kind: 'message';
      role: 'assistant' | 'user';
      text: string;
      durationSeconds?: number;
      tokens?: number;
    }
  | {
      id: string;
      kind: 'tool';
      name: string;
      status: 'running' | 'done' | 'error';
      parameters?: unknown;
      output?: string;
      durationSeconds?: number;
    }
  | {
      id: string;
      kind: 'warning';
      text: string;
      isPermissionDenial?: boolean;
    }
  | {
      id: string;
      kind: 'result';
      ok: boolean;
      text: string;
      denied: string[];
      durationSeconds?: number;
      tokens?: number;
    };

export type AgentLogResponse = {
  runId: string;
  raw: string;
  active: boolean;
};

type Json = Record<string, unknown>;

const asRecord = (value: unknown): Json | null => {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : null;
};

const asString = (value: unknown): string | null => {
  return typeof value === 'string' ? value : null;
};

const asNumber = (value: unknown): number | null => {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const formatToolResultContent = (content: unknown): string => {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        const record = asRecord(part);
        if (record && typeof record.text === 'string') {
          return record.text;
        }
        return JSON.stringify(part);
      })
      .join('\n');
  }
  if (content === null || content === undefined) {
    return '';
  }
  return JSON.stringify(content, null, 2);
};

const describeClaudeDenial = (denial: unknown): string => {
  const record = asRecord(denial);
  const name = asString(record?.tool_name) ?? 'tool';
  const input = asRecord(record?.tool_input);
  const target = asString(input?.file_path) ?? asString(input?.command);
  return target ? `${name}: ${target}` : name;
};

export const parseAgentLog = (raw: string): AgentLogEntry[] => {
  const entries: AgentLogEntry[] = [];
  const agyToolsByStep = new Map<number, Extract<AgentLogEntry, { kind: 'tool' }>>();
  const claudeToolsById = new Map<string, Extract<AgentLogEntry, { kind: 'tool' }>>();
  let seq = 0;
  const nextId = (): string => {
    seq += 1;
    return `log-${seq}`;
  };

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (!line.startsWith('{')) {
      entries.push({
        id: nextId(),
        kind: 'warning',
        text: line,
        isPermissionDenial: /permission|auto-denied|denied|mcp\(/i.test(line),
      });
      continue;
    }

    let parsed: Json | null;
    try {
      parsed = asRecord(JSON.parse(line) as unknown);
    } catch {
      entries.push({
        id: nextId(),
        kind: 'warning',
        text: line,
      });
      continue;
    }

    if (!parsed) {
      continue;
    }

    // ── Antigravity (agy) stream-json ──────────────────────────────────────
    if (parsed.event === 'init') {
      const init = asRecord(parsed.init);
      entries.push({
        id: nextId(),
        kind: 'init',
        provider: 'agy',
        model: asString(init?.model),
        cwd: asString(init?.cwd),
      });
      continue;
    }

    if (parsed.event === 'step_update') {
      const step = asRecord(parsed.step_update);
      if (!step) {
        continue;
      }
      const stepType = asString(step.step_type);
      const stepIndex = asNumber(step.step_index);
      const state = asString(step.state);
      const durationSeconds = asNumber(step.duration_seconds) ?? undefined;

      if (stepType === 'tool') {
        const info = asRecord(step.tool_info);
        const name = asString(step.tool_name) ?? asString(info?.name) ?? 'tool';
        const params = info?.parameters;
        const output = asString(info?.output) ?? undefined;
        const existing = stepIndex !== null ? agyToolsByStep.get(stepIndex) : undefined;
        let status: 'running' | 'done' | 'error' = 'running';
        if (state === 'ERROR' || state === 'FAILED') {
          status = 'error';
        } else if (state === 'DONE') {
          status = 'done';
        }

        if (existing) {
          existing.status = status;
          if (params !== undefined) {
            existing.parameters = params;
          }
          if (output !== undefined) {
            existing.output = output;
          }
          if (durationSeconds !== undefined) {
            existing.durationSeconds = durationSeconds;
          }
        } else {
          const entry: Extract<AgentLogEntry, { kind: 'tool' }> = {
            id: nextId(),
            kind: 'tool',
            name,
            status,
            parameters: params,
            output,
            durationSeconds,
          };
          entries.push(entry);
          if (stepIndex !== null) {
            agyToolsByStep.set(stepIndex, entry);
          }
        }
        continue;
      }

      if (stepType === 'agent_response') {
        const text =
          asString(step.text) ??
          asString(step.response) ??
          asString(asRecord(step.agent_response)?.text) ??
          '';
        const usage = asRecord(step.usage);
        const tokens = asNumber(usage?.total_tokens) ?? undefined;
        if (text || durationSeconds !== undefined || tokens !== undefined) {
          entries.push({
            id: nextId(),
            kind: 'message',
            role: 'assistant',
            text: text || 'Thinking & planning next action…',
            durationSeconds,
            tokens,
          });
        }
      }
      continue;
    }

    if (parsed.event === 'result') {
      const result = asRecord(parsed.result);
      const deniedRaw = Array.isArray(result?.denied_actions) ? result.denied_actions : [];
      const denied = deniedRaw.map((item) => {
        const record = asRecord(item);
        return asString(record?.display_name) ?? asString(record?.action) ?? 'action';
      });
      const usage = asRecord(result?.usage);
      entries.push({
        id: nextId(),
        kind: 'result',
        ok: result?.status === 'SUCCESS',
        text: asString(result?.response) ?? '',
        denied,
        durationSeconds: asNumber(result?.duration_seconds) ?? undefined,
        tokens: asNumber(usage?.total_tokens) ?? undefined,
      });
      continue;
    }

    // ── Claude Code stream-json ────────────────────────────────────────────
    if (parsed.type === 'system' && parsed.subtype === 'init') {
      entries.push({
        id: nextId(),
        kind: 'init',
        provider: 'claude',
        model: asString(parsed.model),
        cwd: asString(parsed.cwd),
      });
      continue;
    }

    if (parsed.type === 'assistant') {
      const message = asRecord(parsed.message);
      const content = Array.isArray(message?.content) ? message.content : [];
      for (const block of content) {
        const rec = asRecord(block);
        if (!rec) {
          continue;
        }
        if (rec.type === 'text') {
          const text = asString(rec.text)?.trim();
          if (text) {
            entries.push({
              id: nextId(),
              kind: 'message',
              role: 'assistant',
              text,
            });
          }
        } else if (rec.type === 'tool_use') {
          const toolId = asString(rec.id);
          const entry: Extract<AgentLogEntry, { kind: 'tool' }> = {
            id: nextId(),
            kind: 'tool',
            name: asString(rec.name) ?? 'tool',
            status: 'running',
            parameters: rec.input,
          };
          entries.push(entry);
          if (toolId) {
            claudeToolsById.set(toolId, entry);
          }
        }
      }
      continue;
    }

    if (parsed.type === 'user') {
      const message = asRecord(parsed.message);
      const content = Array.isArray(message?.content) ? message.content : [];
      for (const block of content) {
        const rec = asRecord(block);
        if (!rec || rec.type !== 'tool_result') {
          continue;
        }
        const toolUseId = asString(rec.tool_use_id);
        const output = formatToolResultContent(rec.content);
        const isError = rec.is_error === true;
        const existing = toolUseId ? claudeToolsById.get(toolUseId) : undefined;
        if (existing) {
          existing.status = isError ? 'error' : 'done';
          if (output) {
            existing.output = output;
          }
        }
      }
      continue;
    }

    if (parsed.type === 'rate_limit_event') {
      const info = asRecord(parsed.rate_limit_info);
      const status = asString(info?.status) ?? 'rate_limited';
      entries.push({
        id: nextId(),
        kind: 'warning',
        text: `Rate limit event: ${status}`,
      });
      continue;
    }

    if (parsed.type === 'result') {
      const denials = Array.isArray(parsed.permission_denials) ? parsed.permission_denials : [];
      const durationMs = asNumber(parsed.duration_ms);
      const usage = asRecord(parsed.usage);
      const inputTokens = asNumber(usage?.input_tokens) ?? 0;
      const outputTokens = asNumber(usage?.output_tokens) ?? 0;
      const totalTokens = inputTokens + outputTokens > 0 ? inputTokens + outputTokens : undefined;
      entries.push({
        id: nextId(),
        kind: 'result',
        ok: parsed.is_error !== true && parsed.subtype === 'success',
        text: asString(parsed.result) ?? '',
        denied: denials.map(describeClaudeDenial),
        durationSeconds: durationMs !== null ? durationMs / 1000 : undefined,
        tokens: totalTokens,
      });
    }
  }

  return entries;
};
