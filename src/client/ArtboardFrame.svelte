<script lang="ts">
  import {
    Check,
    Crosshair,
    Loader2,
    MessageSquarePlus,
    Pencil,
    Send,
    Trash2,
    X,
  } from '@lucide/svelte';

  import type { PositionedBoard } from '#src/client/layout.ts';
  import type { CommentRun } from '#src/core/agent-state.ts';
  import type { ArtboardComment, CommentInput, CommentTarget } from '#src/core/schema.ts';
  import type { ArtboardTheme } from '#src/registry.ts';

  import { formatSourceBadge, inspectElement } from '#src/client/inspect.ts';
  import ThemeSelect from '#src/client/ThemeSelect.svelte';

  export type CanvasTool = 'pan' | 'interact' | 'comment';

  type HoverBox = {
    left: number;
    top: number;
    width: number;
    height: number;
    label: string;
  };

  type Props = {
    board: PositionedBoard;
    tool: CanvasTool;
    zoom?: number;
    themes?: ArtboardTheme[];
    globalThemeId?: string | null;
    showGrid: boolean;
    comments: ArtboardComment[];
    runsMap?: Record<string, CommentRun>;
    agentEnabled?: boolean;
    selectedCommentId?: string | null;
    highlighted?: boolean;
    showDebug?: boolean;
    onmountchange?: (id: string, mounted: boolean) => void;
    onfocusboard?: (board: PositionedBoard) => void;
    onaddcomment?: (input: CommentInput) => void;
    oneditcomment?: (commentId: string, text: string) => void;
    onmovepin?: (commentId: string, pinXPct: number, pinYPct: number) => void;
    ontogglecomment?: (comment: ArtboardComment) => void;
    ondeletecomment?: (commentId: string) => void;
    onsendtoagent?: (ids: string[]) => void;
  };

  let {
    board,
    tool,
    zoom = 1,
    themes = [],
    globalThemeId = null,
    showGrid,
    comments,
    runsMap = {},
    agentEnabled = false,
    selectedCommentId = null,
    highlighted = false,
    showDebug = false,
    onmountchange,
    onfocusboard,
    onaddcomment,
    oneditcomment,
    onmovepin,
    ontogglecomment,
    ondeletecomment,
    onsendtoagent,
  }: Props = $props();

  let frameEl = $state<HTMLDivElement | null>(null);
  let viewportEl = $state<HTMLDivElement | null>(null);
  let isMounted = $state(false);
  let localThemeOverride = $state<string | null>(null);

  let draftPin = $state<{ xPct: number; yPct: number; target: CommentTarget } | null>(null);
  let draftText = $state('');
  let openCommentId = $state<string | null>(null);
  let editingCommentId = $state<string | null>(null);
  let editText = $state('');
  let confirmingDeleteId = $state<string | null>(null);
  let themeMenuOpen = $state(false);
  let hoverBox = $state<HoverBox | null>(null);

  // Pin drag state
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

  $effect(() => {
    if (
      selectedCommentId &&
      comments.some((c) => {
        return c.id === selectedCommentId;
      })
    ) {
      openCommentId = selectedCommentId;
    }
  });

  $effect(() => {
    if (tool !== 'comment') {
      hoverBox = null;
    }
  });

  const activeTheme = $derived.by((): ArtboardTheme | null => {
    if (themes.length === 0) {
      return null;
    }
    const targetId = localThemeOverride ?? board.defaultTheme ?? globalThemeId ?? themes[0]?.id;
    return (
      themes.find((t) => {
        return t.id === targetId;
      }) ??
      themes[0] ??
      null
    );
  });

  const gridCols = $derived.by(() => {
    if (board.width < 520) {
      return 4;
    }
    if (board.width < 960) {
      return 8;
    }
    return 12;
  });

  const gridIndices = $derived(
    Array.from({ length: gridCols }, (_v, idx) => {
      return idx;
    }),
  );

  $effect(() => {
    const el = frameEl;
    if (!el) {
      return;
    }

    const rootMargin = window.innerWidth < 768 ? '120px' : '240px';
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        const next = entry.isIntersecting;
        if (next !== isMounted) {
          isMounted = next;
          onmountchange?.(board.id, next);
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (isMounted) {
        onmountchange?.(board.id, false);
      }
    };
  });

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

    if (finalDrag.moved) {
      onmovepin?.(
        pin.id,
        Math.round(finalDrag.currentXPct * 100) / 100,
        Math.round(finalDrag.currentYPct * 100) / 100,
      );
      return;
    }

    // Normal click: toggle popover
    openCommentId = openCommentId === pin.id ? null : pin.id;
    editingCommentId = null;
    confirmingDeleteId = null;
  }

  function handleViewportPointerMove(event: PointerEvent): void {
    if (tool !== 'comment' || !viewportEl || !isMounted) {
      hoverBox = null;
      return;
    }
    const target = event.target as Element | null;
    if (!target || target === viewportEl || target.classList.contains('ab-scroll')) {
      hoverBox = null;
      return;
    }

    const vpRect = viewportEl.getBoundingClientRect();
    const elRect = target.getBoundingClientRect();
    const scale = zoom || 1;
    const inspected = inspectElement(target, viewportEl);
    const badge = formatSourceBadge(inspected.source) ?? `<${inspected.tag}>`;

    hoverBox = {
      left: (elRect.left - vpRect.left) / scale,
      top: (elRect.top - vpRect.top) / scale,
      width: elRect.width / scale,
      height: elRect.height / scale,
      label: badge,
    };
  }

  function handleViewportClickCapture(event: MouseEvent): void {
    if (tool !== 'comment' || !frameEl || !viewportEl) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const rect = frameEl.getBoundingClientRect();
    const xPct = Math.max(1, Math.min(99, ((event.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(1, Math.min(99, ((event.clientY - rect.top) / rect.height) * 100));

    const clickedEl = event.target as Element | null;
    const target: CommentTarget =
      clickedEl && clickedEl !== viewportEl
        ? inspectElement(clickedEl, viewportEl)
        : {
            source: null,
            componentStack: [],
            selector: '',
            tag: 'div',
            text: '',
            html: '',
          };

    draftPin = { xPct, yPct, target };
    draftText = '';
    openCommentId = null;
    editingCommentId = null;
    confirmingDeleteId = null;
    hoverBox = null;
  }

  function submitDraftComment(): void {
    if (!draftPin || !draftText.trim()) {
      return;
    }
    onaddcomment?.({
      text: draftText.trim(),
      artboard: {
        boardId: board.id,
        boardTitle: board.title,
        section: board.section,
        viewport: {
          width: board.viewport.width,
          height: board.viewport.height,
          label: board.viewport.label,
        },
        theme: activeTheme ? { id: activeTheme.id, label: activeTheme.label } : null,
        xPct: draftPin.xPct,
        yPct: draftPin.yPct,
      },
      target: draftPin.target,
    });
    draftPin = null;
    draftText = '';
  }

  function startEdit(pin: ArtboardComment): void {
    editingCommentId = pin.id;
    editText = pin.text;
    confirmingDeleteId = null;
  }

  function submitEdit(pinId: string): void {
    const trimmed = editText.trim();
    if (!trimmed) {
      return;
    }
    oneditcomment?.(pinId, trimmed);
    editingCommentId = null;
    editText = '';
  }

  const BoardComponent = $derived(board.component);
  const renderContext = $derived({
    theme: activeTheme,
    viewport: board.viewport,
  });
</script>

<div
  class="ab-board"
  class:ab-board-elevated={Boolean(draftPin || openCommentId || themeMenuOpen || draggingPin)}
  style="left: {board.x}px; top: {board.y}px; width: {board.width}px;"
>
  <div class="ab-header">
    <div class="ab-header-left">
      {#if showDebug}
        <span
          title={isMounted ? 'Mounted in DOM' : 'Virtualized placeholder (off-screen)'}
          class="ab-status-dot"
          class:ab-status-mounted={isMounted}
        ></span>
      {/if}
      <button
        type="button"
        class="ab-title-btn"
        onclick={() => {
          onfocusboard?.(board);
        }}
      >
        {board.title}
      </button>
      <span class="ab-dim-pill">{board.viewportLabel}</span>
    </div>

    <div class="ab-header-right">
      {#if comments.length > 0}
        <span class="ab-pin-count">
          {comments.length} comment{comments.length > 1 ? 's' : ''}
        </span>
      {/if}
      {#if themes.length > 0}
        <ThemeSelect
          {themes}
          size="xs"
          label="Theme for {board.title}"
          value={activeTheme?.id ?? ''}
          onchange={(id) => {
            localThemeOverride = id;
          }}
          onopenchange={(isOpen) => {
            themeMenuOpen = isOpen;
          }}
        />
      {/if}
      <button
        type="button"
        title="Focus / Fit this board"
        class="ab-icon-btn"
        onclick={() => {
          onfocusboard?.(board);
        }}
      >
        <Crosshair size={14} />
      </button>
    </div>
  </div>

  <!-- Overflow-visible wrapper so comment popovers and leader lines are never clipped -->
  <div
    bind:this={frameEl}
    class="ab-frame-outer"
    class:ab-cursor-comment={tool === 'comment'}
    style="width: {board.width}px; height: {board.height}px;"
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      bind:this={viewportEl}
      onpointermove={handleViewportPointerMove}
      onpointerleave={() => {
        hoverBox = null;
      }}
      onclickcapture={handleViewportClickCapture}
      class="ab-viewport {activeTheme?.class ?? ''}"
      class:ab-viewport-highlighted={highlighted}
      {...activeTheme?.attrs}
    >
      {#if isMounted}
        <div
          class="ab-scroll"
          class:ab-scroll-interactive={tool === 'interact' && zoom >= 0.45}
          class:ab-non-interactive={tool === 'pan'}
        >
          {#if board.render}
            {@render board.render(renderContext)}
          {:else if BoardComponent}
            <BoardComponent {...board.props} />
          {/if}
        </div>
      {:else}
        <div class="ab-placeholder">
          <div class="ab-placeholder-box"></div>
          <p class="ab-placeholder-title">{board.title}</p>
          <p class="ab-placeholder-sub">Virtualized ({board.width} × {board.height})</p>
        </div>
      {/if}

      <!-- Hover Element Highlight Overlay (Comment Mode) -->
      {#if hoverBox && tool === 'comment'}
        <div
          class="ab-hover-box"
          style="left: {hoverBox.left}px; top: {hoverBox.top}px; width: {hoverBox.width}px; height: {hoverBox.height}px;"
        >
          <span class="ab-hover-badge">{hoverBox.label}</span>
        </div>
      {/if}

      {#if showGrid}
        <div
          class="ab-grid-overlay"
          style="grid-template-columns: repeat({gridCols}, minmax(0, 1fr));"
        >
          {#each gridIndices as idx (idx)}
            <div class="ab-grid-col"></div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Leader lines for dragged comment pins -->
    <svg class="ab-leader-svg" viewBox="0 0 {board.width} {board.height}" aria-hidden="true">
      {#each comments as pin (pin.id)}
        {@const pos = getPinPos(pin)}
        {@const x1 = (pin.artboard.xPct / 100) * board.width}
        {@const y1 = (pin.artboard.yPct / 100) * board.height}
        {@const x2 = (pos.xPct / 100) * board.width}
        {@const y2 = (pos.yPct / 100) * board.height}
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

    <!-- Pinned Review Comments (anchored at left-bottom tip!) -->
    {#each comments as pin, index (pin.id)}
      {@const pos = getPinPos(pin)}
      {@const run = runsMap[pin.id]}
      {@const running = run?.status === 'running'}
      {@const queued = run?.status === 'queued'}
      {@const sourceBadge = formatSourceBadge(pin.target.source)}
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
                    onclick={() => {
                      onsendtoagent?.([pin.id]);
                    }}
                  >
                    <Send size={13} />
                  </button>
                {/if}
                <button
                  type="button"
                  title="Edit comment"
                  disabled={running}
                  class="ab-pop-btn"
                  onclick={() => {
                    startEdit(pin);
                  }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  title={pin.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
                  disabled={running}
                  class="ab-pop-btn ab-pop-btn-ok"
                  onclick={() => {
                    ontogglecomment?.(pin);
                  }}
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  title="Delete comment"
                  disabled={running}
                  class="ab-pop-btn ab-pop-btn-del"
                  onclick={() => {
                    confirmingDeleteId = pin.id;
                    editingCommentId = null;
                  }}
                >
                  <Trash2 size={14} />
                </button>
                <button
                  type="button"
                  class="ab-pop-btn"
                  onclick={() => {
                    openCommentId = null;
                    editingCommentId = null;
                    confirmingDeleteId = null;
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {#if confirmingDeleteId === pin.id}
              <div class="ab-confirm-bar">
                <span>Delete this comment?</span>
                <div class="ab-confirm-actions">
                  <button
                    type="button"
                    class="ab-btn-cancel"
                    onclick={() => {
                      confirmingDeleteId = null;
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="ab-btn-danger"
                    onclick={() => {
                      ondeletecomment?.(pin.id);
                      confirmingDeleteId = null;
                      openCommentId = null;
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            {:else if editingCommentId === pin.id}
              <textarea
                bind:value={editText}
                rows="3"
                aria-label="Edit comment text"
                onkeydown={(e) => {
                  if (e.key === 'Escape') {
                    editingCommentId = null;
                  } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    submitEdit(pin.id);
                  }
                }}
                class="ab-textarea"></textarea>
              <div class="ab-draft-footer">
                <button
                  type="button"
                  class="ab-btn-cancel"
                  onclick={() => {
                    editingCommentId = null;
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="ab-btn-pin"
                  onclick={() => {
                    submitEdit(pin.id);
                  }}
                >
                  Save
                </button>
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
        {/if}
      </div>
    {/each}

    <!-- New Comment Composer (anchored at left-bottom tip!) -->
    {#if draftPin}
      {@const draftBadge = formatSourceBadge(draftPin.target.source)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="ab-pin-anchor ab-pin-open"
        style="left: {draftPin.xPct}%; top: {draftPin.yPct}%;"
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
                draftPin = null;
              } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                submitDraftComment();
              }
            }}
            class="ab-textarea"></textarea>
          <div class="ab-draft-footer">
            <button
              type="button"
              class="ab-btn-cancel"
              onclick={() => {
                draftPin = null;
              }}
            >
              Cancel
            </button>
            <button type="button" class="ab-btn-pin" onclick={submitDraftComment}>Post</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .ab-board {
    position: absolute;
    user-select: none;
    z-index: 10;
  }

  .ab-board-elevated {
    z-index: 40;
  }

  .ab-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
    padding: 0 2px;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
  }

  .ab-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .ab-header-right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .ab-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: var(--ab-dot-idle);
    flex-shrink: 0;
  }

  .ab-status-mounted {
    background: #34d399;
    box-shadow: 0 0 8px rgba(52, 211, 153, 0.7);
  }

  .ab-title-btn {
    border: none;
    background: transparent;
    padding: 0;
    color: var(--ab-text);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-title-btn:hover {
    color: var(--ab-accent-text);
  }

  .ab-dim-pill {
    flex-shrink: 0;
    border-radius: 4px;
    background: var(--ab-pill-bg);
    padding: 2px 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    color: var(--ab-text-muted);
  }

  .ab-pin-count {
    border-radius: 4px;
    background: rgba(245, 158, 11, 0.2);
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 600;
    color: #d97706;
  }

  .ab-icon-btn {
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

  .ab-icon-btn:hover {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-frame-outer {
    position: relative;
  }

  .ab-cursor-comment {
    cursor: crosshair;
  }

  .ab-viewport {
    container-type: inline-size;
    contain: layout style paint;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid var(--ab-frame-border);
    background: #ffffff;
    box-shadow: var(--ab-frame-shadow);
    transition:
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  .ab-viewport-highlighted {
    border-color: #6366f1;
    box-shadow:
      0 0 0 4px rgba(99, 102, 241, 0.35),
      var(--ab-frame-shadow);
  }

  .ab-scroll {
    width: 100%;
    height: 100%;
    overflow: hidden;
    touch-action: none;
    user-select: text;
  }

  .ab-scroll-interactive {
    overflow-y: auto;
    touch-action: pan-y;
  }

  .ab-non-interactive {
    pointer-events: none;
    touch-action: none;
    user-select: none;
  }

  .ab-hover-box {
    pointer-events: none;
    position: absolute;
    z-index: 25;
    border: 2px solid #6366f1;
    background: rgba(99, 102, 241, 0.12);
    border-radius: 4px;
    box-sizing: border-box;
  }

  .ab-hover-badge {
    position: absolute;
    top: -22px;
    left: -2px;
    border-radius: 4px;
    background: #4f46e5;
    padding: 2px 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    font-weight: 600;
    color: #ffffff;
    white-space: nowrap;
  }

  .ab-leader-svg {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: 28;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .ab-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 100%;
    background: var(--ab-placeholder-bg);
    color: var(--ab-text-muted);
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
  }

  .ab-placeholder-box {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    border: 1px solid var(--ab-border);
    background: var(--ab-pill-bg);
  }

  .ab-placeholder-title {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--ab-text-muted);
  }

  .ab-placeholder-sub {
    margin: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    color: var(--ab-text-subtle);
  }

  .ab-grid-overlay {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: 20;
    display: grid;
    gap: 16px;
    padding: 0 16px;
  }

  .ab-grid-col {
    height: 100%;
    border-left: 1px solid rgba(244, 63, 94, 0.22);
    border-right: 1px solid rgba(244, 63, 94, 0.22);
    background: rgba(244, 63, 94, 0.06);
  }

  /* Left-bottom anchor so the teardrop tip sits directly on the clicked coordinate */
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

  .ab-pin-draft {
    background: #6366f1;
    cursor: default;
  }

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

  .ab-popover-draft {
    border-color: rgba(99, 102, 241, 0.55);
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

  .ab-confirm-bar {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-radius: 8px;
    border: 1px solid rgba(244, 63, 94, 0.35);
    background: rgba(244, 63, 94, 0.1);
    padding: 8px 10px;
    font-size: 11.5px;
    color: #fb7185;
  }

  .ab-confirm-actions {
    display: flex;
    gap: 6px;
  }

  .ab-btn-danger {
    border: none;
    border-radius: 6px;
    background: #e11d48;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
  }

  .ab-btn-danger:hover {
    background: #f43f5e;
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
