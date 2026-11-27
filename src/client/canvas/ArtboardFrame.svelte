<script lang="ts">
  import { Crosshair } from '@lucide/svelte';

  import type { PositionedBoard } from '#src/client/layout.ts';
  import type { CommentRun } from '#src/core/agent-state.ts';
  import type { ArtboardComment, CommentInput, CommentTarget } from '#src/core/schema.ts';
  import type { ArtboardTheme } from '#src/registry.ts';

  import DraftCommentPopover from '#src/client/canvas/DraftCommentPopover.svelte';
  import PinOverlay from '#src/client/canvas/PinOverlay.svelte';
  import { formatSourceBadge, inspectElement } from '#src/client/inspect.ts';
  import ThemeSelect from '#src/client/ui/ThemeSelect.svelte';

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
  let openCommentId = $state<string | null>(null);
  let isDraggingPin = $state(false);
  let themeMenuOpen = $state(false);
  let hoverBox = $state<HoverBox | null>(null);

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
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (isMounted) {
        onmountchange?.(board.id, false);
      }
    };
  });

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
    openCommentId = null;
    hoverBox = null;
  }

  function handleDraftSubmit(text: string): void {
    if (!draftPin) {
      return;
    }
    onaddcomment?.({
      text,
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
  }

  const BoardComponent = $derived(board.component);
  const renderContext = $derived({
    theme: activeTheme,
    viewport: board.viewport,
  });
</script>

<div
  class="ab-board"
  class:ab-board-elevated={Boolean(draftPin || openCommentId || themeMenuOpen || isDraggingPin)}
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

    <PinOverlay
      boardWidth={board.width}
      boardHeight={board.height}
      {frameEl}
      {comments}
      {runsMap}
      {agentEnabled}
      {openCommentId}
      onopencomment={(id) => {
        openCommentId = id;
      }}
      ondraggingchange={(dragging) => {
        isDraggingPin = dragging;
      }}
      {onmovepin}
      {oneditcomment}
      {ontogglecomment}
      {ondeletecomment}
      {onsendtoagent}
    />

    {#if draftPin}
      <DraftCommentPopover
        xPct={draftPin.xPct}
        yPct={draftPin.yPct}
        target={draftPin.target}
        onsubmit={handleDraftSubmit}
        oncancel={() => {
          draftPin = null;
        }}
      />
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
</style>
