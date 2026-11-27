<script lang="ts">
  import { MessageSquarePlus } from '@lucide/svelte';

  import type { CommentTarget } from '#src/core/schema.ts';

  import { formatSourceBadge } from '#src/client/inspect.ts';

  type Props = {
    xPct: number;
    yPct: number;
    target: CommentTarget;
    onsubmit: (text: string) => void;
    oncancel: () => void;
  };

  let { xPct, yPct, target, onsubmit, oncancel }: Props = $props();

  let draftText = $state('');
  const draftBadge = $derived(formatSourceBadge(target.source));

  function handleSubmit(): void {
    const trimmed = draftText.trim();
    if (!trimmed) {
      return;
    }
    onsubmit(trimmed);
    draftText = '';
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="ab-pin-anchor ab-pin-open"
  style="left: {xPct}%; top: {yPct}%;"
  onclick={(e) => {
    e.stopPropagation();
  }}
>
  <div class="ab-pin-badge ab-pin-draft">
    <MessageSquarePlus size={14} />
  </div>

  <div class="ab-popover ab-popover-draft">
    <div class="ab-popover-meta">
      <p class="ab-popover-author">Add Comment</p>
      {#if draftBadge}
        <span class="ab-popover-src">{draftBadge}</span>
      {/if}
    </div>
    <textarea
      bind:value={draftText}
      rows="2"
      placeholder="e.g. Increase padding on mobile..."
      onkeydown={(e) => {
        if (e.key === 'Escape') {
          oncancel();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          handleSubmit();
        }
      }}
      class="ab-textarea"></textarea>
    <div class="ab-draft-footer">
      <button type="button" class="ab-btn-cancel" onclick={oncancel}>Cancel</button>
      <button type="button" class="ab-btn-pin" onclick={handleSubmit}>Post</button>
    </div>
  </div>
</div>

<style>
  .ab-pin-anchor {
    position: absolute;
    z-index: 50;
    transform: translate(0, -100%);
  }

  .ab-pin-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 9999px 9999px 9999px 4px;
    border: 2px solid #ffffff;
    background: #6366f1;
    color: #ffffff;
    cursor: default;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.35);
  }

  .ab-popover {
    position: absolute;
    top: 36px;
    left: 0;
    z-index: 50;
    width: 268px;
    border-radius: 12px;
    border: 1px solid rgba(99, 102, 241, 0.55);
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
