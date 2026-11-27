<script lang="ts">
  import { Check, Pencil, Send, Trash2, X } from '@lucide/svelte';

  import type { CommentRun } from '#src/core/agent-state.ts';
  import type { ArtboardComment } from '#src/core/schema.ts';

  import { formatSourceBadge } from '#src/client/inspect.ts';
  import ConfirmBar from '#src/client/ui/ConfirmBar.svelte';

  type Props = {
    pin: ArtboardComment;
    run?: CommentRun;
    agentEnabled: boolean;
    onedit: (text: string) => void;
    ontoggle: () => void;
    ondelete: () => void;
    onsendtoagent: () => void;
    onclose: () => void;
  };

  let { pin, run, agentEnabled, onedit, ontoggle, ondelete, onsendtoagent, onclose }: Props =
    $props();

  let editing = $state(false);
  let editText = $state('');
  let confirmingDelete = $state(false);

  const running = $derived(run?.status === 'running');
  const queued = $derived(run?.status === 'queued');
  const sourceBadge = $derived(formatSourceBadge(pin.target.source));

  function startEdit(): void {
    editing = true;
    editText = pin.text;
    confirmingDelete = false;
  }

  function submitEdit(): void {
    const trimmed = editText.trim();
    if (!trimmed) {
      return;
    }
    onedit(trimmed);
    editing = false;
    editText = '';
  }
</script>

<div class="ab-popover">
  <div class="ab-popover-head">
    <div class="ab-popover-meta">
      <span class="ab-popover-author">{pin.author}</span>
      {#if sourceBadge}
        <span class="ab-popover-src">{sourceBadge}</span>
      {/if}
    </div>
    <div class="ab-popover-actions">
      {#if agentEnabled && pin.status === 'open' && !running && !queued}
        <button
          type="button"
          title="Send to AI Agent"
          class="ab-pop-btn ab-pop-btn-send"
          onclick={onsendtoagent}
        >
          <Send size={13} />
        </button>
      {/if}
      <button
        type="button"
        title="Edit comment"
        disabled={running}
        class="ab-pop-btn"
        onclick={startEdit}
      >
        <Pencil size={13} />
      </button>
      <button
        type="button"
        title={pin.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
        disabled={running}
        class="ab-pop-btn ab-pop-btn-ok"
        onclick={ontoggle}
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        title="Delete comment"
        disabled={running}
        class="ab-pop-btn ab-pop-btn-del"
        onclick={() => {
          confirmingDelete = true;
          editing = false;
        }}
      >
        <Trash2 size={14} />
      </button>
      <button type="button" class="ab-pop-btn" onclick={onclose}>
        <X size={14} />
      </button>
    </div>
  </div>

  {#if confirmingDelete}
    <ConfirmBar
      message="Delete this comment?"
      onconfirm={() => {
        ondelete();
        confirmingDelete = false;
        onclose();
      }}
      oncancel={() => {
        confirmingDelete = false;
      }}
    />
  {:else if editing}
    <textarea
      bind:value={editText}
      rows="3"
      aria-label="Edit comment text"
      onkeydown={(e) => {
        if (e.key === 'Escape') {
          editing = false;
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          submitEdit();
        }
      }}
      class="ab-textarea"></textarea>
    <div class="ab-draft-footer">
      <button
        type="button"
        class="ab-btn-cancel"
        onclick={() => {
          editing = false;
        }}
      >
        Cancel
      </button>
      <button type="button" class="ab-btn-pin" onclick={submitEdit}>Save</button>
    </div>
  {:else}
    <p class="ab-popover-text" class:ab-popover-text-resolved={pin.status === 'resolved'}>
      {pin.text}
    </p>
    {#if pin.resolution}
      <p class="ab-popover-resolution">↳ {pin.resolution}</p>
    {/if}
    {#if run && run.status !== 'done'}
      <p class="ab-popover-run">
        Agent: {run.status}{run.error ? ` — ${run.error}` : ''}
      </p>
    {/if}
  {/if}
</div>

<style>
  .ab-popover {
    position: absolute;
    top: 36px;
    left: 0;
    z-index: 50;
    width: 268px;
    border-radius: 12px;
    border: 1px solid var(--ab-border);
    background: var(--ab-surface-solid);
    padding: 12px;
    text-align: left;
    color: var(--ab-text);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.32);
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
  }

  .ab-popover-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .ab-popover-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .ab-popover-author {
    margin: 0;
    font-size: 11px;
    font-weight: 600;
    color: var(--ab-accent-text);
  }

  .ab-popover-src {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    color: var(--ab-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-popover-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  .ab-pop-btn {
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

  .ab-pop-btn:hover:not(:disabled) {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-pop-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .ab-pop-btn-send:hover:not(:disabled) {
    color: #818cf8;
  }

  .ab-pop-btn-ok:hover:not(:disabled) {
    color: #10b981;
  }

  .ab-pop-btn-del:hover:not(:disabled) {
    color: #f43f5e;
  }

  .ab-popover-text {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--ab-text);
  }

  .ab-popover-text-resolved {
    color: var(--ab-text-subtle);
    text-decoration: line-through;
  }

  .ab-popover-resolution {
    margin: 6px 0 0;
    font-size: 11px;
    line-height: 1.4;
    color: #10b981;
  }

  .ab-popover-run {
    margin: 6px 0 0;
    font-size: 10px;
    color: var(--ab-text-muted);
  }

  .ab-textarea {
    box-sizing: border-box;
    width: 100%;
    margin-top: 6px;
    border-radius: 8px;
    border: 1px solid var(--ab-border);
    background: var(--ab-input-bg);
    padding: 8px;
    font-family: inherit;
    font-size: 12px;
    color: var(--ab-text);
    resize: vertical;
  }

  .ab-textarea:focus {
    outline: none;
    border-color: #6366f1;
  }

  .ab-draft-footer {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    margin-top: 8px;
  }

  .ab-btn-cancel {
    border: none;
    border-radius: 6px;
    background: transparent;
    padding: 4px 8px;
    font-size: 11px;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-btn-cancel:hover {
    background: var(--ab-hover);
  }

  .ab-btn-pin {
    border: none;
    border-radius: 6px;
    background: #4f46e5;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
  }

  .ab-btn-pin:hover {
    background: #6366f1;
  }
</style>
