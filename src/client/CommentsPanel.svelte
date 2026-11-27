<script lang="ts">
  import {
    AlertTriangle,
    Bot,
    Check,
    CheckCircle2,
    Clock,
    Loader2,
    Play,
    RotateCcw,
    Send,
    Settings,
    Square,
    Trash2,
    XCircle,
  } from '@lucide/svelte';
  import { SvelteSet } from 'svelte/reactivity';

  import type { AgentInfo, CommentRun } from '#src/core/agent-state.ts';
  import type { ArtboardComment } from '#src/core/schema.ts';

  import { formatSourceBadge } from '#src/client/inspect.ts';

  type Props = {
    comments: ArtboardComment[];
    agentInfo: AgentInfo | null;
    onfocuscomment: (comment: ArtboardComment) => void;
    ontogglecomment: (comment: ArtboardComment) => void;
    ondeletecomment: (id: string) => void;
    onclearresolved: () => void;
    onsendtoagent: (ids: string[]) => void;
    oncancelagent: () => void;
    onresumeagent: () => void;
    onopenagentsettings: () => void;
  };

  let {
    comments,
    agentInfo,
    onfocuscomment,
    ontogglecomment,
    ondeletecomment,
    onclearresolved,
    onsendtoagent,
    oncancelagent,
    onresumeagent,
    onopenagentsettings,
  }: Props = $props();

  let activeTab = $state<'open' | 'resolved'>('open');
  let confirmingDeleteId = $state<string | null>(null);
  let confirmingClearResolved = $state(false);
  const selectedIds = new SvelteSet<string>();

  const openComments = $derived(
    comments.filter((c) => {
      return c.status === 'open';
    }),
  );

  const resolvedComments = $derived(
    comments.filter((c) => {
      return c.status === 'resolved';
    }),
  );

  const visibleComments = $derived(activeTab === 'open' ? openComments : resolvedComments);

  const runsMap = $derived(agentInfo?.state.runs ?? {});
  const agentEnabled = $derived(agentInfo?.settings.enabled ?? false);
  const agentWorking = $derived(agentInfo?.state.activeRunId !== null && agentInfo !== null);
  const agentPaused = $derived(agentInfo?.state.paused ?? null);

  const sendableOpenIds = $derived(
    openComments
      .filter((c) => {
        const st = runsMap[c.id]?.status;
        return st !== 'running' && st !== 'queued';
      })
      .map((c) => {
        return c.id;
      }),
  );

  const selectedSendableIds = $derived(
    sendableOpenIds.filter((id) => {
      return selectedIds.has(id);
    }),
  );

  function getRun(id: string): CommentRun | undefined {
    return runsMap[id];
  }

  function isRunning(id: string): boolean {
    return getRun(id)?.status === 'running';
  }

  function toggleSelect(id: string): void {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }
  }

  function handleSendSelected(): void {
    if (selectedSendableIds.length === 0) {
      return;
    }
    onsendtoagent([...selectedSendableIds]);
    for (const id of selectedSendableIds) {
      selectedIds.delete(id);
    }
  }

  function handleSendAll(): void {
    if (sendableOpenIds.length === 0) {
      return;
    }
    onsendtoagent([...sendableOpenIds]);
    selectedIds.clear();
  }
</script>

<div class="ab-cp-root">
  <!-- Sub-tabs: Open / Resolved + Agent Settings trigger -->
  <div class="ab-cp-tabs">
    <div class="ab-cp-tab-group">
      <button
        type="button"
        class="ab-cp-tab"
        class:ab-cp-tab-active={activeTab === 'open'}
        onclick={() => {
          activeTab = 'open';
        }}
      >
        Open ({openComments.length})
      </button>
      <button
        type="button"
        class="ab-cp-tab"
        class:ab-cp-tab-active={activeTab === 'resolved'}
        onclick={() => {
          activeTab = 'resolved';
        }}
      >
        Resolved ({resolvedComments.length})
      </button>
    </div>

    <button
      type="button"
      aria-label="Agent settings"
      title="Agent Runner Settings"
      class="ab-cp-gear"
      class:ab-cp-gear-on={agentEnabled}
      onclick={onopenagentsettings}
    >
      <Settings size={13} />
    </button>
  </div>

  <!-- Agent Status Banner (paused or running) -->
  {#if agentPaused}
    <div class="ab-cp-banner ab-cp-banner-warn">
      <div class="ab-cp-banner-text">
        <AlertTriangle size={13} />
        <span>{agentPaused.message}</span>
      </div>
      <div class="ab-cp-banner-actions">
        <button type="button" class="ab-cp-mini-btn ab-cp-mini-primary" onclick={onresumeagent}>
          <Play size={11} />
          Resume
        </button>
        <button type="button" class="ab-cp-mini-btn" onclick={oncancelagent}>
          <Square size={11} />
          Stop
        </button>
      </div>
    </div>
  {:else if agentWorking}
    <div class="ab-cp-banner ab-cp-banner-run">
      <div class="ab-cp-banner-text">
        <span class="ab-spin"><Loader2 size={13} /></span>
        <span>Agent resolving ({agentInfo?.state.activeCommentIds.length ?? 0})…</span>
      </div>
      <button type="button" class="ab-cp-mini-btn ab-cp-mini-danger" onclick={oncancelagent}>
        <Square size={11} />
        Stop
      </button>
    </div>
  {/if}

  <!-- Batch Action Bar -->
  {#if activeTab === 'open' && openComments.length > 0}
    <div class="ab-cp-bar">
      {#if agentEnabled}
        <button
          type="button"
          class="ab-cp-action-btn ab-cp-action-primary"
          disabled={selectedSendableIds.length === 0 || Boolean(agentPaused)}
          onclick={handleSendSelected}
        >
          <Send size={12} />
          Send ({selectedSendableIds.length})
        </button>
        <button
          type="button"
          class="ab-cp-action-btn"
          disabled={sendableOpenIds.length === 0 || Boolean(agentPaused)}
          onclick={handleSendAll}
        >
          <Bot size={12} />
          Send all ({sendableOpenIds.length})
        </button>
      {:else}
        <button
          type="button"
          class="ab-cp-action-btn ab-cp-action-full"
          onclick={onopenagentsettings}
        >
          <Bot size={12} />
          Enable Agent Runner…
        </button>
      {/if}
    </div>
  {:else if activeTab === 'resolved' && resolvedComments.length > 0}
    <div class="ab-cp-bar">
      {#if confirmingClearResolved}
        <div class="ab-cp-confirm">
          <span>Clear all {resolvedComments.length} resolved?</span>
          <div class="ab-cp-confirm-btns">
            <button
              type="button"
              class="ab-cp-mini-btn"
              onclick={() => {
                confirmingClearResolved = false;
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              class="ab-cp-mini-btn ab-cp-mini-danger-solid"
              onclick={() => {
                onclearresolved();
                confirmingClearResolved = false;
              }}
            >
              Clear
            </button>
          </div>
        </div>
      {:else}
        <button
          type="button"
          class="ab-cp-action-btn ab-cp-action-full"
          onclick={() => {
            confirmingClearResolved = true;
          }}
        >
          <Trash2 size={12} />
          Clear resolved ({resolvedComments.length})
        </button>
      {/if}
    </div>
  {/if}

  <!-- Comment List -->
  <div class="ab-cp-list">
    {#if visibleComments.length === 0}
      <p class="ab-cp-empty">
        {activeTab === 'open'
          ? 'No open comments. Switch to Comment mode (C) and click any element on an artboard.'
          : 'No resolved comments yet.'}
      </p>
    {:else}
      {#each visibleComments as item (item.id)}
        {@const run = getRun(item.id)}
        {@const running = isRunning(item.id)}
        {@const sourceBadge = formatSourceBadge(item.target.source)}
        <div class="ab-cp-card">
          <div class="ab-cp-card-top">
            {#if activeTab === 'open' && agentEnabled}
              <input
                type="checkbox"
                aria-label="Select comment"
                checked={selectedIds.has(item.id)}
                disabled={running || run?.status === 'queued'}
                onchange={() => {
                  toggleSelect(item.id);
                }}
                class="ab-cp-check"
              />
            {/if}

            <button
              type="button"
              class="ab-cp-card-link"
              onclick={() => {
                onfocuscomment(item);
              }}
            >
              <span class="ab-cp-board-title">{item.artboard.boardTitle}</span>
              {#if sourceBadge}
                <span class="ab-cp-source">{sourceBadge}</span>
              {/if}
            </button>

            <div class="ab-cp-card-btns">
              <button
                type="button"
                title={item.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
                disabled={running}
                class="ab-cp-icon-btn"
                onclick={() => {
                  ontogglecomment(item);
                }}
              >
                {#if item.status === 'resolved'}
                  <RotateCcw size={12} />
                {:else}
                  <Check size={12} />
                {/if}
              </button>
              <button
                type="button"
                title="Delete comment"
                disabled={running}
                class="ab-cp-icon-btn ab-cp-icon-del"
                onclick={() => {
                  confirmingDeleteId = item.id;
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {#if confirmingDeleteId === item.id}
            <div class="ab-cp-confirm">
              <span>Delete comment?</span>
              <div class="ab-cp-confirm-btns">
                <button
                  type="button"
                  class="ab-cp-mini-btn"
                  onclick={() => {
                    confirmingDeleteId = null;
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="ab-cp-mini-btn ab-cp-mini-danger-solid"
                  onclick={() => {
                    ondeletecomment(item.id);
                    confirmingDeleteId = null;
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          {/if}

          <button
            type="button"
            class="ab-cp-card-body"
            onclick={() => {
              onfocuscomment(item);
            }}
          >
            <p class="ab-cp-text">{item.text}</p>
            {#if item.resolution}
              <p class="ab-cp-resolution">↳ {item.resolution}</p>
            {/if}
          </button>

          {#if run}
            <div class="ab-cp-run-row" title={run.error ?? run.summary ?? run.status}>
              {#if run.status === 'queued'}
                <Clock size={11} color="#94a3b8" />
                <span>Queued</span>
              {:else if run.status === 'running'}
                <span class="ab-spin"><Loader2 size={11} color="#818cf8" /></span>
                <span>Running…</span>
              {:else if run.status === 'done'}
                <CheckCircle2 size={11} color="#10b981" />
                <span>Resolved by agent</span>
              {:else if run.status === 'needs_attention'}
                <AlertTriangle size={11} color="#f59e0b" />
                <span>Needs attention</span>
              {:else if run.status === 'failed'}
                <XCircle size={11} color="#f43f5e" />
                <span>Failed</span>
              {:else}
                <span>Cancelled</span>
              {/if}

              {#if run.protectedTouched.length > 0}
                <span
                  class="ab-cp-protected-warn"
                  title="Protected files modified: {run.protectedTouched.join(', ')}"
                >
                  ⚠ protected
                </span>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .ab-cp-root {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .ab-cp-tabs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    border-bottom: 1px solid var(--ab-border-subtle);
    padding: 8px 10px;
  }

  .ab-cp-tab-group {
    display: flex;
    gap: 4px;
  }

  .ab-cp-tab {
    border: none;
    border-radius: 6px;
    background: transparent;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 500;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-cp-tab:hover {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-cp-tab-active {
    background: var(--ab-pill-bg);
    color: var(--ab-text);
    font-weight: 600;
  }

  .ab-cp-gear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ab-border);
    border-radius: 6px;
    background: transparent;
    padding: 5px;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-cp-gear:hover {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-cp-gear-on {
    border-color: rgba(16, 185, 129, 0.5);
    color: #10b981;
  }

  .ab-cp-banner {
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-bottom: 1px solid var(--ab-border-subtle);
    padding: 8px 10px;
    font-size: 11px;
  }

  .ab-cp-banner-warn {
    background: rgba(245, 158, 11, 0.12);
    color: #f59e0b;
  }

  .ab-cp-banner-run {
    background: rgba(99, 102, 241, 0.14);
    color: var(--ab-accent-text);
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .ab-cp-banner-text {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .ab-cp-banner-actions {
    display: flex;
    gap: 6px;
  }

  .ab-cp-mini-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px solid var(--ab-border);
    border-radius: 5px;
    background: var(--ab-surface-solid);
    padding: 3px 7px;
    font-size: 10px;
    font-weight: 600;
    color: var(--ab-text);
    cursor: pointer;
  }

  .ab-cp-mini-primary {
    border-color: #4f46e5;
    background: #4f46e5;
    color: #ffffff;
  }

  .ab-cp-mini-danger {
    border-color: rgba(244, 63, 94, 0.5);
    color: #f43f5e;
  }

  .ab-cp-mini-danger-solid {
    border-color: #e11d48;
    background: #e11d48;
    color: #ffffff;
  }

  .ab-cp-confirm {
    margin-top: 6px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    border-radius: 6px;
    border: 1px solid rgba(244, 63, 94, 0.35);
    background: rgba(244, 63, 94, 0.1);
    padding: 5px 8px;
    font-size: 10.5px;
    color: #fb7185;
  }

  .ab-cp-confirm-btns {
    display: flex;
    gap: 4px;
  }

  .ab-cp-bar {
    display: flex;
    gap: 6px;
    border-bottom: 1px solid var(--ab-border-subtle);
    padding: 8px 10px;
  }

  .ab-cp-action-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: 1px solid var(--ab-border);
    border-radius: 7px;
    background: var(--ab-input-bg);
    padding: 6px 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--ab-text);
    cursor: pointer;
  }

  .ab-cp-action-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .ab-cp-action-primary {
    border-color: #4f46e5;
    background: #4f46e5;
    color: #ffffff;
  }

  .ab-cp-action-full {
    width: 100%;
  }

  .ab-cp-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ab-cp-empty {
    margin: 24px 12px;
    text-align: center;
    font-size: 11px;
    line-height: 1.5;
    color: var(--ab-text-subtle);
  }

  .ab-cp-card {
    border: 1px solid var(--ab-border-subtle);
    border-radius: 9px;
    background: var(--ab-input-bg);
    padding: 8px;
  }

  .ab-cp-card-top {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ab-cp-check {
    accent-color: #6366f1;
    cursor: pointer;
    margin: 0;
  }

  .ab-cp-card-link {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    padding: 0;
    text-align: left;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .ab-cp-board-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--ab-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-cp-source {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    color: var(--ab-accent-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-cp-card-btns {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .ab-cp-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 4px;
    background: transparent;
    padding: 4px;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-cp-icon-btn:hover:not(:disabled) {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-cp-icon-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .ab-cp-icon-del:hover:not(:disabled) {
    color: #f43f5e;
  }

  .ab-cp-card-body {
    width: 100%;
    border: none;
    background: transparent;
    padding: 0;
    margin-top: 6px;
    text-align: left;
    cursor: pointer;
  }

  .ab-cp-text {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.45;
    color: var(--ab-text);
    word-break: break-word;
  }

  .ab-cp-resolution {
    margin: 4px 0 0;
    font-size: 10.5px;
    line-height: 1.4;
    color: #10b981;
  }

  .ab-cp-run-row {
    margin-top: 6px;
    padding-top: 5px;
    border-top: 1px solid var(--ab-border-subtle);
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    color: var(--ab-text-muted);
  }

  .ab-cp-protected-warn {
    margin-left: auto;
    color: #f59e0b;
    font-weight: 600;
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
</style>
