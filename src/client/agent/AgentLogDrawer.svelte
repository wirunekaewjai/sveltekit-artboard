<script lang="ts">
  import {
    AlertTriangle,
    Bot,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Copy,
    Loader2,
    Settings,
    Terminal,
    Wrench,
    X,
    XCircle,
  } from '@lucide/svelte';
  import { tick } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';

  import type { AgentLogEntry, AgentLogResponse } from '#src/core/agent-log.ts';

  import { parseAgentLog } from '#src/core/agent-log.ts';

  type Props = {
    runId: string | null;
    title?: string;
    loadLog: (runId: string) => Promise<AgentLogResponse>;
    onclose: () => void;
    onopensettings: () => void;
  };

  let { runId, title = 'Agent Run Log', loadLog, onclose, onopensettings }: Props = $props();

  let raw = $state('');
  let active = $state(false);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let viewMode = $state<'timeline' | 'raw'>('timeline');
  let copied = $state(false);
  let scrollEl = $state<HTMLDivElement | null>(null);
  let pinnedToBottom = true;

  const expandedTools = new SvelteSet<string>();

  const entries = $derived(parseAgentLog(raw));

  async function fetchLog(id: string, isInitial: boolean): Promise<void> {
    if (isInitial) {
      loading = true;
      error = null;
    }
    try {
      const res = await loadLog(id);
      raw = res.raw;
      active = res.active;
      error = null;
      if (pinnedToBottom) {
        await tick();
        if (scrollEl) {
          scrollEl.scrollTop = scrollEl.scrollHeight;
        }
      }
    } catch (err) {
      if (isInitial) {
        error = err instanceof Error ? err.message : 'Failed to load log';
      }
    } finally {
      if (isInitial) {
        loading = false;
      }
    }
  }

  $effect(() => {
    const id = runId;
    if (!id) {
      raw = '';
      active = false;
      error = null;
      expandedTools.clear();
      return;
    }

    pinnedToBottom = true;
    void fetchLog(id, true);

    const onLogEvent = (event: Event): void => {
      const detail = (event as CustomEvent<{ runId?: string }>).detail;
      if (!detail?.runId || detail.runId === id) {
        void fetchLog(id, false);
      }
    };
    const onAgentChanged = (): void => {
      void fetchLog(id, false);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onclose();
      }
    };

    window.addEventListener('artboard:agent-log', onLogEvent);
    window.addEventListener('artboard:agent-changed', onAgentChanged);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('artboard:agent-log', onLogEvent);
      window.removeEventListener('artboard:agent-changed', onAgentChanged);
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  function handleScroll(): void {
    if (!scrollEl) {
      return;
    }
    const distanceFromBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
    pinnedToBottom = distanceFromBottom < 60;
  }

  function toggleTool(id: string): void {
    if (expandedTools.has(id)) {
      expandedTools.delete(id);
    } else {
      expandedTools.add(id);
    }
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(raw);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 1500);
    } catch {
      // Ignore clipboard errors
    }
  }

  function formatDuration(seconds?: number): string | null {
    if (seconds === undefined || !Number.isFinite(seconds)) {
      return null;
    }
    if (seconds < 1) {
      return `${Math.round(seconds * 1000)}ms`;
    }
    return `${seconds.toFixed(1)}s`;
  }

  function formatTokens(tokens?: number): string | null {
    if (tokens === undefined || !Number.isFinite(tokens) || tokens <= 0) {
      return null;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k tok`;
    }
    return `${tokens} tok`;
  }

  function summarizeToolParams(entry: Extract<AgentLogEntry, { kind: 'tool' }>): string | null {
    const params = entry.parameters;
    if (!params || typeof params !== 'object' || Array.isArray(params)) {
      return null;
    }
    const rec = params as Record<string, unknown>;
    if (typeof rec.ServerName === 'string' && typeof rec.ToolName === 'string') {
      return `${rec.ServerName}/${rec.ToolName}`;
    }
    for (const key of ['Path', 'file_path', 'path', 'CommandLine', 'command', 'pattern', 'query']) {
      if (typeof rec[key] === 'string' && rec[key]) {
        const val = rec[key];
        return val.length > 72 ? `…${val.slice(-70)}` : val;
      }
    }
    return null;
  }

  function formatJson(value: unknown): string {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
</script>

{#if runId}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="ab-log-backdrop" onclick={onclose}>
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Agent Run Log"
      class="ab-log-drawer"
      onclick={(e) => {
        e.stopPropagation();
      }}
    >
      <div class="ab-log-head">
        <div class="ab-log-title-wrap">
          <Terminal size={15} color="#818cf8" />
          <div class="ab-log-title-col">
            <h2 class="ab-log-title">{title}</h2>
            <span class="ab-log-runid">{runId.slice(0, 8)}</span>
          </div>
          {#if active}
            <span class="ab-log-live-pill">
              <span class="ab-log-live-dot"></span>
              Live
            </span>
          {/if}
        </div>

        <div class="ab-log-head-actions">
          <div class="ab-log-seg">
            <button
              type="button"
              class="ab-log-seg-btn"
              class:ab-log-seg-active={viewMode === 'timeline'}
              onclick={() => {
                viewMode = 'timeline';
              }}
            >
              Timeline
            </button>
            <button
              type="button"
              class="ab-log-seg-btn"
              class:ab-log-seg-active={viewMode === 'raw'}
              onclick={() => {
                viewMode = 'raw';
              }}
            >
              Raw
            </button>
          </div>

          <button
            type="button"
            class="ab-log-icon-btn"
            title="Copy raw log"
            disabled={!raw}
            onclick={() => {
              void handleCopy();
            }}
          >
            {#if copied}
              <Check size={14} color="#10b981" />
            {:else}
              <Copy size={14} />
            {/if}
          </button>

          <button type="button" class="ab-log-icon-btn" aria-label="Close log" onclick={onclose}>
            <X size={15} />
          </button>
        </div>
      </div>

      <div class="ab-log-body" bind:this={scrollEl} onscroll={handleScroll}>
        {#if loading}
          <div class="ab-log-empty">
            <span class="ab-spin"><Loader2 size={16} color="#818cf8" /></span>
            <span>Loading agent log…</span>
          </div>
        {:else if error}
          <div class="ab-log-warning ab-log-warning-err">
            <XCircle size={14} />
            <span>{error}</span>
          </div>
        {:else if !raw.trim()}
          <div class="ab-log-empty">
            {#if active}
              <span class="ab-spin"><Loader2 size={16} color="#818cf8" /></span>
              <span>Waiting for agent output…</span>
            {:else}
              <span>No log output recorded for this run.</span>
            {/if}
          </div>
        {:else if viewMode === 'raw'}
          <pre class="ab-log-raw">{raw}</pre>
        {:else}
          <div class="ab-log-timeline">
            {#each entries as entry (entry.id)}
              {#if entry.kind === 'init'}
                <div class="ab-log-init">
                  <span class="ab-log-badge">{entry.provider ?? 'agent'}</span>
                  {#if entry.model}
                    <span class="ab-log-meta-code">{entry.model}</span>
                  {/if}
                  {#if entry.cwd}
                    <span class="ab-log-meta-muted" title={entry.cwd}>{entry.cwd}</span>
                  {/if}
                </div>
              {:else if entry.kind === 'message'}
                <div class="ab-log-msg">
                  <div class="ab-log-msg-head">
                    <Bot size={12} color="#818cf8" />
                    <span>Agent</span>
                    {#if formatDuration(entry.durationSeconds)}
                      <span class="ab-log-pill">{formatDuration(entry.durationSeconds)}</span>
                    {/if}
                    {#if formatTokens(entry.tokens)}
                      <span class="ab-log-pill">{formatTokens(entry.tokens)}</span>
                    {/if}
                  </div>
                  <p class="ab-log-msg-text">{entry.text}</p>
                </div>
              {:else if entry.kind === 'tool'}
                {@const isOpen = expandedTools.has(entry.id)}
                {@const summary = summarizeToolParams(entry)}
                <div class="ab-log-tool">
                  <button
                    type="button"
                    class="ab-log-tool-head"
                    onclick={() => {
                      toggleTool(entry.id);
                    }}
                  >
                    <span class="ab-log-tool-chev">
                      {#if isOpen}
                        <ChevronDown size={12} />
                      {:else}
                        <ChevronRight size={12} />
                      {/if}
                    </span>
                    {#if entry.status === 'running'}
                      <span class="ab-spin"><Loader2 size={12} color="#818cf8" /></span>
                    {:else if entry.status === 'error'}
                      <XCircle size={12} color="#f43f5e" />
                    {:else}
                      <Wrench size={12} color="#10b981" />
                    {/if}
                    <span class="ab-log-tool-name">{entry.name}</span>
                    {#if summary}
                      <span class="ab-log-tool-summary" title={summary}>{summary}</span>
                    {/if}
                    {#if formatDuration(entry.durationSeconds)}
                      <span class="ab-log-pill ab-log-tool-dur">
                        {formatDuration(entry.durationSeconds)}
                      </span>
                    {/if}
                  </button>

                  {#if isOpen}
                    <div class="ab-log-tool-detail">
                      {#if entry.parameters !== undefined}
                        <div class="ab-log-detail-block">
                          <span class="ab-log-detail-label">Parameters</span>
                          <pre class="ab-log-code">{formatJson(entry.parameters)}</pre>
                        </div>
                      {/if}
                      {#if entry.output}
                        <div class="ab-log-detail-block">
                          <span class="ab-log-detail-label">Output</span>
                          <pre class="ab-log-code">{entry.output}</pre>
                        </div>
                      {/if}
                    </div>
                  {/if}
                </div>
              {:else if entry.kind === 'warning'}
                <div class="ab-log-warning" class:ab-log-warning-err={entry.isPermissionDenial}>
                  <AlertTriangle size={14} class="ab-log-warn-icon" />
                  <div class="ab-log-warn-body">
                    <p class="ab-log-warn-text">{entry.text}</p>
                    {#if entry.isPermissionDenial}
                      <button type="button" class="ab-log-settings-btn" onclick={onopensettings}>
                        <Settings size={11} />
                        Open Agent Settings (MCP)
                      </button>
                    {/if}
                  </div>
                </div>
              {:else if entry.kind === 'result'}
                <div
                  class="ab-log-result"
                  class:ab-log-result-ok={entry.ok && entry.denied.length === 0}
                  class:ab-log-result-warn={!entry.ok || entry.denied.length > 0}
                >
                  <div class="ab-log-result-head">
                    {#if entry.ok && entry.denied.length === 0}
                      <CheckCircle2 size={14} color="#10b981" />
                      <span>Completed</span>
                    {:else}
                      <AlertTriangle size={14} color="#f59e0b" />
                      <span>
                        {entry.denied.length > 0 ? 'Finished with denied permissions' : 'Finished'}
                      </span>
                    {/if}
                    {#if formatDuration(entry.durationSeconds)}
                      <span class="ab-log-pill">{formatDuration(entry.durationSeconds)}</span>
                    {/if}
                    {#if formatTokens(entry.tokens)}
                      <span class="ab-log-pill">{formatTokens(entry.tokens)}</span>
                    {/if}
                  </div>

                  {#if entry.text}
                    <p class="ab-log-result-text">{entry.text}</p>
                  {/if}

                  {#if entry.denied.length > 0}
                    <div class="ab-log-denied-row">
                      <span class="ab-log-denied-label">Denied: {entry.denied.join(', ')}</span>
                      <button type="button" class="ab-log-settings-btn" onclick={onopensettings}>
                        <Settings size={11} />
                        Configure MCP
                      </button>
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}

            {#if active}
              <div class="ab-log-running-foot">
                <span class="ab-spin"><Loader2 size={12} color="#818cf8" /></span>
                <span>Agent is still running…</span>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </aside>
  </div>
{/if}

<style>
  .ab-log-backdrop {
    position: fixed;
    inset: 0;
    z-index: 75;
    display: flex;
    justify-content: flex-end;
    background: rgba(0, 0, 0, 0.45);
  }

  .ab-log-drawer {
    width: min(560px, 94vw);
    height: 100%;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--ab-border);
    background: var(--ab-surface-solid);
    color: var(--ab-text);
    box-shadow: -16px 0 48px rgba(0, 0, 0, 0.45);
  }

  .ab-log-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-bottom: 1px solid var(--ab-border-subtle);
    padding: 12px 14px;
    flex-shrink: 0;
  }

  .ab-log-title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .ab-log-title-col {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .ab-log-title {
    margin: 0;
    font-size: 12.5px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-log-runid {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    color: var(--ab-text-subtle);
  }

  .ab-log-live-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 9999px;
    background: rgba(16, 185, 129, 0.14);
    padding: 2px 7px;
    font-size: 10px;
    font-weight: 600;
    color: #10b981;
    flex-shrink: 0;
  }

  .ab-log-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: #10b981;
    animation: ab-pulse 1.4s ease-in-out infinite;
  }

  .ab-log-head-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .ab-log-seg {
    display: inline-flex;
    border: 1px solid var(--ab-border);
    border-radius: 7px;
    background: var(--ab-input-bg);
    padding: 2px;
  }

  .ab-log-seg-btn {
    border: none;
    border-radius: 5px;
    background: transparent;
    padding: 3px 8px;
    font-size: 10.5px;
    font-weight: 600;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-log-seg-active {
    background: var(--ab-pill-bg);
    color: var(--ab-text);
  }

  .ab-log-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 6px;
    background: transparent;
    padding: 5px;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-log-icon-btn:hover:not(:disabled) {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-log-icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .ab-log-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
  }

  .ab-log-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 16px;
    font-size: 12px;
    color: var(--ab-text-muted);
  }

  .ab-log-raw {
    margin: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--ab-text);
    background: var(--ab-input-bg);
    border: 1px solid var(--ab-border-subtle);
    border-radius: 8px;
    padding: 10px 12px;
  }

  .ab-log-timeline {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ab-log-init {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    border: 1px solid var(--ab-border-subtle);
    border-radius: 8px;
    background: var(--ab-input-bg);
    padding: 6px 10px;
    font-size: 11px;
  }

  .ab-log-badge {
    border-radius: 4px;
    background: rgba(99, 102, 241, 0.16);
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--ab-accent-text);
  }

  .ab-log-meta-code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: var(--ab-text);
  }

  .ab-log-meta-muted {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    color: var(--ab-text-subtle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .ab-log-msg {
    border: 1px solid var(--ab-border-subtle);
    border-radius: 9px;
    background: var(--ab-input-bg);
    padding: 8px 10px;
  }

  .ab-log-msg-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10.5px;
    font-weight: 600;
    color: var(--ab-text-muted);
    margin-bottom: 4px;
  }

  .ab-log-msg-text {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--ab-text);
  }

  .ab-log-pill {
    border-radius: 4px;
    background: var(--ab-pill-bg);
    padding: 1px 5px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 9.5px;
    font-weight: 500;
    color: var(--ab-text-muted);
  }

  .ab-log-tool {
    border: 1px solid var(--ab-border-subtle);
    border-radius: 8px;
    background: var(--ab-input-bg);
    overflow: hidden;
  }

  .ab-log-tool-head {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: transparent;
    padding: 7px 9px;
    text-align: left;
    color: var(--ab-text);
    cursor: pointer;
    font-size: 11px;
  }

  .ab-log-tool-head:hover {
    background: var(--ab-hover);
  }

  .ab-log-tool-chev {
    display: inline-flex;
    color: var(--ab-text-subtle);
    flex-shrink: 0;
  }

  .ab-log-tool-name {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight: 600;
    flex-shrink: 0;
  }

  .ab-log-tool-summary {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10.5px;
    color: var(--ab-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
  }

  .ab-log-tool-dur {
    margin-left: auto;
    flex-shrink: 0;
  }

  .ab-log-tool-detail {
    border-top: 1px solid var(--ab-border-subtle);
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ab-log-detail-block {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .ab-log-detail-label {
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--ab-text-subtle);
  }

  .ab-log-code {
    margin: 0;
    max-height: 220px;
    overflow: auto;
    border-radius: 6px;
    background: var(--ab-bg);
    padding: 7px 9px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10.5px;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--ab-text);
  }

  .ab-log-warning {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    border: 1px solid rgba(245, 158, 11, 0.35);
    border-radius: 9px;
    background: rgba(245, 158, 11, 0.1);
    padding: 9px 11px;
    font-size: 11.5px;
    color: #f59e0b;
  }

  .ab-log-warning-err {
    border-color: rgba(244, 63, 94, 0.4);
    background: rgba(244, 63, 94, 0.1);
    color: #fb7185;
  }

  .ab-log-warn-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    flex: 1;
  }

  .ab-log-warn-text {
    margin: 0;
    line-height: 1.45;
    word-break: break-word;
  }

  .ab-log-settings-btn {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px solid var(--ab-border);
    border-radius: 6px;
    background: var(--ab-surface-solid);
    padding: 4px 8px;
    font-size: 10.5px;
    font-weight: 600;
    color: var(--ab-text);
    cursor: pointer;
  }

  .ab-log-settings-btn:hover {
    background: var(--ab-hover);
  }

  .ab-log-result {
    border: 1px solid var(--ab-border);
    border-radius: 9px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ab-log-result-ok {
    border-color: rgba(16, 185, 129, 0.35);
    background: rgba(16, 185, 129, 0.08);
  }

  .ab-log-result-warn {
    border-color: rgba(245, 158, 11, 0.4);
    background: rgba(245, 158, 11, 0.09);
  }

  .ab-log-result-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--ab-text);
  }

  .ab-log-result-text {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--ab-text);
  }

  .ab-log-denied-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    padding-top: 4px;
    border-top: 1px solid var(--ab-border-subtle);
  }

  .ab-log-denied-label {
    font-size: 11px;
    font-weight: 600;
    color: #f59e0b;
  }

  .ab-log-running-foot {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 4px;
    font-size: 11px;
    color: var(--ab-text-muted);
  }

  .ab-spin {
    display: inline-flex;
    animation: ab-spin 1s linear infinite;
  }

  @keyframes ab-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes ab-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.35;
    }
  }
</style>
