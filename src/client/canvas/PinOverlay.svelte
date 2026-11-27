<script lang="ts">
  import { Check, Loader2 } from '@lucide/svelte';

  import type { CommentRun } from '#src/core/agent-state.ts';
  import type { ArtboardComment } from '#src/core/schema.ts';

  import CommentPopover from '#src/client/canvas/CommentPopover.svelte';

  type Props = {
    boardWidth: number;
    boardHeight: number;
    frameEl: HTMLDivElement | null;
    comments: ArtboardComment[];
    runsMap: Record<string, CommentRun>;
    agentEnabled: boolean;
    openCommentId: string | null;
    onopencomment: (id: string | null) => void;
    ondraggingchange: (dragging: boolean) => void;
    onmovepin?: (commentId: string, pinXPct: number, pinYPct: number) => void;
    oneditcomment?: (commentId: string, text: string) => void;
    ontogglecomment?: (comment: ArtboardComment) => void;
    ondeletecomment?: (commentId: string) => void;
    onsendtoagent?: (ids: string[]) => void;
  };

  let {
    boardWidth,
    boardHeight,
    frameEl,
    comments,
    runsMap,
    agentEnabled,
    openCommentId,
    onopencomment,
    ondraggingchange,
    onmovepin,
    oneditcomment,
    ontogglecomment,
    ondeletecomment,
    onsendtoagent,
  }: Props = $props();

  let draggingPin = $state<{
    id: string;
    startClientX: number;
    startClientY: number;
    startXPct: number;
    startYPct: number;
    currentXPct: number;
    currentYPct: number;
    moved: boolean;
  } | null>(null);

  function getPinPos(pin: ArtboardComment): { xPct: number; yPct: number } {
    if (draggingPin && draggingPin.id === pin.id) {
      return { xPct: draggingPin.currentXPct, yPct: draggingPin.currentYPct };
    }
    return {
      xPct: pin.artboard.pinXPct ?? pin.artboard.xPct,
      yPct: pin.artboard.pinYPct ?? pin.artboard.yPct,
    };
  }

  function handlePinPointerDown(event: PointerEvent, pin: ArtboardComment): void {
    if (event.button !== 0 || !frameEl) {
      return;
    }
    event.stopPropagation();
    const pos = getPinPos(pin);
    draggingPin = {
      id: pin.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startXPct: pos.xPct,
      startYPct: pos.yPct,
      currentXPct: pos.xPct,
      currentYPct: pos.yPct,
      moved: false,
    };
    ondraggingchange(true);
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // Ignore synthetic events
    }
  }

  function handlePinPointerMove(event: PointerEvent): void {
    if (!draggingPin || !frameEl) {
      return;
    }
    event.stopPropagation();
    const dx = event.clientX - draggingPin.startClientX;
    const dy = event.clientY - draggingPin.startClientY;
    if (!draggingPin.moved && Math.hypot(dx, dy) < 4) {
      return;
    }

    const rect = frameEl.getBoundingClientRect();
    const nextXPct = Math.max(0, Math.min(100, draggingPin.startXPct + (dx / rect.width) * 100));
    const nextYPct = Math.max(0, Math.min(100, draggingPin.startYPct + (dy / rect.height) * 100));

    draggingPin = {
      ...draggingPin,
      currentXPct: nextXPct,
      currentYPct: nextYPct,
      moved: true,
    };
  }

  function handlePinPointerUp(event: PointerEvent, pin: ArtboardComment): void {
    if (!draggingPin || draggingPin.id !== pin.id) {
      return;
    }
    event.stopPropagation();
    const finalDrag = draggingPin;
    draggingPin = null;
    ondraggingchange(false);

    if (finalDrag.moved) {
      onmovepin?.(
        pin.id,
        Math.round(finalDrag.currentXPct * 100) / 100,
        Math.round(finalDrag.currentYPct * 100) / 100,
      );
      return;
    }

    onopencomment(openCommentId === pin.id ? null : pin.id);
  }
</script>

<svg class="ab-leader-svg" viewBox="0 0 {boardWidth} {boardHeight}" aria-hidden="true">
  {#each comments as pin (pin.id)}
    {@const pos = getPinPos(pin)}
    {@const x1 = (pin.artboard.xPct / 100) * boardWidth}
    {@const y1 = (pin.artboard.yPct / 100) * boardHeight}
    {@const x2 = (pos.xPct / 100) * boardWidth}
    {@const y2 = (pos.yPct / 100) * boardHeight}
    {#if Math.hypot(x2 - x1, y2 - y1) > 4}
      {@const strokeColor = pin.status === 'resolved' ? '#10b981' : '#f59e0b'}
      <line
        {x1}
        {y1}
        {x2}
        {y2}
        stroke={strokeColor}
        stroke-width="2"
        stroke-dasharray="4 3"
        stroke-linecap="round"
      />
      <circle cx={x1} cy={y1} r="4" fill={strokeColor} stroke="#ffffff" stroke-width="1.5" />
    {/if}
  {/each}
</svg>

{#each comments as pin, index (pin.id)}
  {@const pos = getPinPos(pin)}
  {@const run = runsMap[pin.id]}
  {@const running = run?.status === 'running'}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="ab-pin-anchor"
    class:ab-pin-open={openCommentId === pin.id || draggingPin?.id === pin.id}
    style="left: {pos.xPct}%; top: {pos.yPct}%;"
    onclick={(e) => {
      e.stopPropagation();
    }}
  >
    <button
      type="button"
      title="Click to view · Drag to reposition"
      class="ab-pin-badge"
      class:ab-pin-resolved={pin.status === 'resolved'}
      class:ab-pin-running={running}
      class:ab-pin-dragging={draggingPin?.id === pin.id && draggingPin.moved}
      onpointerdown={(e) => {
        handlePinPointerDown(e, pin);
      }}
      onpointermove={handlePinPointerMove}
      onpointerup={(e) => {
        handlePinPointerUp(e, pin);
      }}
      onpointercancel={(e) => {
        handlePinPointerUp(e, pin);
      }}
    >
      {#if running}
        <span class="ab-spin"><Loader2 size={13} /></span>
      {:else if pin.status === 'resolved'}
        <Check size={14} />
      {:else}
        {index + 1}
      {/if}
    </button>

    {#if openCommentId === pin.id}
      <CommentPopover
        {pin}
        {run}
        {agentEnabled}
        onedit={(text) => {
          oneditcomment?.(pin.id, text);
        }}
        ontoggle={() => {
          ontogglecomment?.(pin);
        }}
        ondelete={() => {
          ondeletecomment?.(pin.id);
        }}
        onsendtoagent={() => {
          onsendtoagent?.([pin.id]);
        }}
        onclose={() => {
          onopencomment(null);
        }}
      />
    {/if}
  </div>
{/each}

<style>
  .ab-leader-svg {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: 28;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .ab-pin-anchor {
    position: absolute;
    z-index: 30;
    transform: translate(0, -100%);
  }

  .ab-pin-open {
    z-index: 50;
  }

  .ab-pin-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 9999px 9999px 9999px 4px;
    border: 2px solid #ffffff;
    background: #f59e0b;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    cursor: grab;
    touch-action: none;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.35);
    transition: transform 0.15s ease;
  }

  .ab-pin-badge:hover {
    transform: scale(1.08);
  }

  .ab-pin-dragging {
    cursor: grabbing;
    transform: scale(1.12);
  }

  .ab-pin-resolved {
    background: #10b981;
  }

  .ab-pin-running {
    background: #6366f1;
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
