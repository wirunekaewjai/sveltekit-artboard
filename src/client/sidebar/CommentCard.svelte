<script lang="ts">
  import {
    AlertTriangle,
    Check,
    CheckCircle2,
    Clock,
    Loader2,
    RotateCcw,
    Terminal,
    Trash2,
    XCircle,
  } from '@lucide/svelte';

  import type { CommentRun } from '#src/core/agent-state.ts';
  import type { ArtboardComment } from '#src/core/schema.ts';

  import { formatSourceBadge } from '#src/client/inspect.ts';
  import ConfirmBar from '#src/client/ui/ConfirmBar.svelte';

  type Props = {
    item: ArtboardComment;
    run?: CommentRun;
    selectable: boolean;
    selected: boolean;
    confirmingDelete: boolean;
    ontoggleselect: () => void;
    onfocus: () => void;
    ontoggle: () => void;
    onrequestdelete: () => void;
    onconfirmdelete: () => void;
    oncanceldelete: () => void;
    onopenlog: (runId: string) => void;
  };

  let {
    item,
    run,
    selectable,
    selected,
    confirmingDelete,
    ontoggleselect,
    onfocus,
    ontoggle,
    onrequestdelete,
    onconfirmdelete,
    oncanceldelete,
    onopenlog,
  }: Props = $props();

  const running = $derived(run?.status === 'running');
  const sourceBadge = $derived(formatSourceBadge(item.target.source));
  const runNote = $derived(run?.error ?? (run?.status !== 'done' ? run?.summary : null) ?? null);
</script>

<div class="ab-cp-card">
  <div class="ab-cp-card-top">
    {#if selectable}
      <input
        type="checkbox"
        aria-label="Select comment"
        checked={selected}
        disabled={running || run?.status === 'queued'}
        onchange={ontoggleselect}
        class="ab-cp-check"
      />
    {/if}

    <button type="button" class="ab-cp-card-link" onclick={onfocus}>
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
        onclick={ontoggle}
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
        onclick={onrequestdelete}
      >
        <Trash2 size={12} />
      </button>
    </div>
  </div>

  {#if confirmingDelete}
    <ConfirmBar
      message="Delete comment?"
      compact={true}
      onconfirm={onconfirmdelete}
      oncancel={oncanceldelete}
    />
  {/if}

  <button type="button" class="ab-cp-card-body" onclick={onfocus}>
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

      {#if run.status !== 'queued'}
        <button
          type="button"
          class="ab-cp-log-btn"
          title="View agent log"
          onclick={() => {
            onopenlog(run.runId);
          }}
        >
          <Terminal size={10} />
          Log
        </button>
      {/if}
    </div>

    {#if runNote}
      <p class="ab-cp-run-note" class:ab-cp-run-note-err={run.status === 'failed'}>
        {runNote}
      </p>
    {/if}
  {/if}
</div>

<style>
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
    color: #f59e0b;
    font-weight: 600;
  }

  .ab-cp-log-btn {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    border: 1px solid var(--ab-border);
    border-radius: 4px;
    background: transparent;
    padding: 1px 5px;
    font-size: 9.5px;
    font-weight: 600;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-cp-log-btn:hover {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-cp-run-note {
    margin: 4px 0 0;
    font-size: 10px;
    line-height: 1.4;
    color: #f59e0b;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ab-cp-run-note-err {
    color: #f43f5e;
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
