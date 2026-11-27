<script lang="ts">
  import {
    ArrowLeft,
    Bot,
    Bug,
    Flame,
    Grid3x3,
    Hand,
    Layers,
    Loader2,
    Maximize2,
    MessageSquarePlus,
    Moon,
    MousePointer2,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    Sun,
    ZoomIn,
    ZoomOut,
  } from '@lucide/svelte';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

  import type { CanvasTool } from '#src/client/ArtboardFrame.svelte';
  import type { PositionedBoard } from '#src/client/layout.ts';
  import type { AgentInfo, AgentSettingsPatch } from '#src/core/agent-state.ts';
  import type { ArtboardComment, CommentInput } from '#src/core/schema.ts';
  import type { ArtboardSection, ArtboardTheme, StudioTheme } from '#src/registry.ts';

  import AgentSettingsModal from '#src/client/AgentSettingsModal.svelte';
  import { createApiClient } from '#src/client/api-client.ts';
  import ArtboardFrame from '#src/client/ArtboardFrame.svelte';
  import CommentsPanel from '#src/client/CommentsPanel.svelte';
  import { getStudioDefaults } from '#src/client/defaults.ts';
  import { computeCanvasLayout } from '#src/client/layout.ts';
  import ThemeSelect from '#src/client/ThemeSelect.svelte';

  type Props = {
    sections: ArtboardSection[];
    themes?: ArtboardTheme[];
    studioTheme?: StudioTheme;
    storageKey?: string;
    appUrl?: string;
    defaultDebug?: boolean;
  };

  const defaults = getStudioDefaults();

  let {
    sections,
    themes = [],
    studioTheme = defaults.studioTheme,
    storageKey = defaults.storageKey,
    appUrl = defaults.appUrl,
    defaultDebug = defaults.defaultDebug,
  }: Props = $props();

  let debugOverride = $state<boolean | null>(null);
  const showDebug = $derived(debugOverride ?? defaultDebug);

  let studioThemeOverride = $state<'dark' | 'light' | null>(null);
  let systemPrefersDark = $state(true);

  const resolvedStudioTheme = $derived.by((): 'dark' | 'light' => {
    if (studioThemeOverride) {
      return studioThemeOverride;
    }
    if (studioTheme === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return studioTheme;
  });

  let globalThemeOverride = $state<string | null>(null);
  const activeGlobalThemeId = $derived(globalThemeOverride ?? themes[0]?.id ?? null);

  let stressTest = $state(false);
  const layout = $derived(computeCanvasLayout(sections, stressTest ? 3 : 1));

  let sidebarOpen = $state(true);
  let sidebarTab = $state<'boards' | 'comments'>('boards');
  let agentModalOpen = $state(false);
  let selectedCommentId = $state<string | null>(null);
  let searchQuery = $state('');
  let activeCategory = $state<string>('all');
  let highlightedBoardId = $state<string | null>(null);

  const api = createApiClient(defaults.apiBase);
  let comments = $state<ArtboardComment[]>([]);
  let agentInfo = $state<AgentInfo | null>(null);

  const openCommentCount = $derived(
    comments.filter((c) => {
      return c.status === 'open';
    }).length,
  );
  const agentWorking = $derived(agentInfo?.state.activeRunId !== null && agentInfo !== null);
  const agentPaused = $derived(agentInfo?.state.paused ?? null);

  let tool = $state<CanvasTool>('interact');
  let spacePressed = $state(false);
  let showGrid = $state(false);

  let viewportEl = $state<HTMLDivElement | null>(null);
  let camX = $state(40);
  let camY = $state(40);
  let zoom = $state(0.55);
  let isPanning = $state(false);
  let panStart = { x: 0, y: 0, camX: 0, camY: 0 };

  // Multi-touch pointer tracking for 1-finger pan & 2-finger pinch-to-zoom
  const activePointers = new SvelteMap<number, { x: number; y: number }>();
  let pinchStart: {
    dist: number;
    midX: number;
    midY: number;
    zoom: number;
    camX: number;
    camY: number;
  } | null = null;

  const mountedIds = new SvelteSet<string>();
  let fps = $state(60);

  async function refreshComments(): Promise<void> {
    try {
      comments = await api.listComments();
    } catch (err) {
      console.warn('[sveltekit-artboard] Failed to load comments:', err);
    }
  }

  async function refreshAgent(): Promise<void> {
    try {
      agentInfo = await api.getAgentInfo();
    } catch {
      // Dev server may be restarting
    }
  }

  $effect(() => {
    if (window.innerWidth < 768) {
      sidebarOpen = false;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    systemPrefersDark = mq.matches;
    const onChange = (e: MediaQueryListEvent): void => {
      systemPrefersDark = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
    };
  });

  $effect(() => {
    try {
      const savedDebug = localStorage.getItem(`${storageKey}:debug`);
      if (savedDebug === 'true' || savedDebug === 'false') {
        debugOverride = savedDebug === 'true';
      }
      const savedStudioTheme = localStorage.getItem(`${storageKey}:studio-theme`);
      if (savedStudioTheme === 'dark' || savedStudioTheme === 'light') {
        studioThemeOverride = savedStudioTheme;
      }
    } catch {
      // Ignore storage errors
    }

    void refreshComments();
    void refreshAgent();

    const onCommentsChanged = (): void => {
      void refreshComments();
    };
    const onAgentChanged = (): void => {
      void refreshAgent();
    };

    window.addEventListener('artboard:comments-changed', onCommentsChanged);
    window.addEventListener('artboard:agent-changed', onAgentChanged);
    return () => {
      window.removeEventListener('artboard:comments-changed', onCommentsChanged);
      window.removeEventListener('artboard:agent-changed', onAgentChanged);
    };
  });

  function toggleDebug(): void {
    const next = !showDebug;
    debugOverride = next;
    if (!next) {
      stressTest = false;
    }
    try {
      localStorage.setItem(`${storageKey}:debug`, String(next));
    } catch {
      // Ignore storage errors
    }
  }

  function toggleStudioTheme(): void {
    const next: 'dark' | 'light' = resolvedStudioTheme === 'dark' ? 'light' : 'dark';
    studioThemeOverride = next;
    try {
      localStorage.setItem(`${storageKey}:studio-theme`, next);
    } catch {
      // Ignore storage errors
    }
  }

  const effectiveTool = $derived<CanvasTool>(spacePressed ? 'pan' : tool);

  const categories = $derived.by(() => {
    const seen = new SvelteSet<string>();
    const list: Array<{ id: string; label: string }> = [{ id: 'all', label: 'All' }];
    for (const sec of sections) {
      if (!seen.has(sec.category)) {
        seen.add(sec.category);
        const label = sec.category.charAt(0).toUpperCase() + sec.category.slice(1);
        list.push({ id: sec.category, label });
      }
    }
    return list;
  });

  const filteredBoards = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    return layout.boards.filter((b) => {
      const matchCat = activeCategory === 'all' || b.category === activeCategory;
      const matchQ =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.section.toLowerCase().includes(q) ||
        b.viewportLabel.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  });

  const mountedCount = $derived.by(() => {
    let count = 0;
    for (const b of layout.boards) {
      if (mountedIds.has(b.id)) {
        count++;
      }
    }
    return count;
  });

  const mountedRatio = $derived(
    layout.boards.length ? Math.round((mountedCount / layout.boards.length) * 100) : 0,
  );

  const fpsColor = $derived.by(() => {
    if (fps >= 50) {
      return '#10b981';
    }
    if (fps >= 30) {
      return '#f59e0b';
    }
    return '#f43f5e';
  });

  $effect(() => {
    if (!showDebug) {
      return;
    }

    let frames = 0;
    let lastTime = performance.now();
    let rafId = 0;

    const tick = (now: number): void => {
      frames++;
      if (now - lastTime >= 500) {
        fps = Math.round((frames * 1000) / (now - lastTime));
        frames = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
    };
  });

  $effect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        spacePressed = true;
      } else if (e.key === 'h' || e.key === 'H') {
        tool = 'pan';
      } else if (e.key === 'v' || e.key === 'V') {
        tool = 'interact';
      } else if (e.key === 'c' || e.key === 'C') {
        tool = 'comment';
      } else if (e.key === 'g' || e.key === 'G') {
        showGrid = !showGrid;
      } else if (e.key === 'd' || e.key === 'D') {
        toggleDebug();
      } else if (e.key === '0') {
        fitAll();
      }
    };

    const onKeyUp = (e: KeyboardEvent): void => {
      if (e.code === 'Space') {
        spacePressed = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  });

  function handleMountChange(id: string, mounted: boolean): void {
    if (mounted) {
      mountedIds.add(id);
    } else {
      mountedIds.delete(id);
    }
  }

  function getPinchMetrics(): { dist: number; midX: number; midY: number } | null {
    const pts = [...activePointers.values()];
    if (pts.length < 2 || !viewportEl) {
      return null;
    }
    const rect = viewportEl.getBoundingClientRect();
    const dx = pts[1].x - pts[0].x;
    const dy = pts[1].y - pts[0].y;
    return {
      dist: Math.hypot(dx, dy) || 1,
      midX: (pts[0].x + pts[1].x) / 2 - rect.left,
      midY: (pts[0].y + pts[1].y) / 2 - rect.top,
    };
  }

  function handlePointerDown(e: PointerEvent): void {
    const isEmptyCanvasTarget = e.target === viewportEl;
    const shouldTrackTouch = e.pointerType === 'touch';
    const shouldPan =
      e.button === 1 ||
      (e.button === 0 && (effectiveTool === 'pan' || (shouldTrackTouch && isEmptyCanvasTarget)));

    if (!shouldPan && !shouldTrackTouch) {
      return;
    }

    if (shouldPan) {
      e.preventDefault();
    }

    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size >= 2) {
      // Transition into 2-finger pinch-to-zoom + pan
      isPanning = false;
      const metrics = getPinchMetrics();
      if (metrics) {
        pinchStart = { ...metrics, zoom, camX, camY };
      }
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture failures on synthetic/detached events
      }
      return;
    }

    if (shouldPan) {
      isPanning = true;
      pinchStart = null;
      panStart = { x: e.clientX, y: e.clientY, camX, camY };
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture failures
      }
    }
  }

  function handlePointerMove(e: PointerEvent): void {
    if (activePointers.has(e.pointerId)) {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (activePointers.size >= 2 && pinchStart) {
      const metrics = getPinchMetrics();
      if (!metrics) {
        return;
      }
      const nextZoom = Math.max(
        0.12,
        Math.min(2.0, pinchStart.zoom * (metrics.dist / pinchStart.dist)),
      );
      const ratio = nextZoom / pinchStart.zoom;
      camX = metrics.midX - (pinchStart.midX - pinchStart.camX) * ratio;
      camY = metrics.midY - (pinchStart.midY - pinchStart.camY) * ratio;
      zoom = nextZoom;
      return;
    }

    if (!isPanning) {
      return;
    }
    camX = panStart.camX + (e.clientX - panStart.x);
    camY = panStart.camY + (e.clientY - panStart.y);
  }

  function handlePointerUp(e: PointerEvent): void {
    activePointers.delete(e.pointerId);

    if (activePointers.size < 2) {
      pinchStart = null;
    }

    if (activePointers.size === 1 && effectiveTool === 'pan') {
      // Seamlessly continue 1-finger panning after lifting the second finger
      const remaining = [...activePointers.values()][0];
      if (remaining) {
        isPanning = true;
        panStart = { x: remaining.x, y: remaining.y, camX, camY };
        return;
      }
    }

    if (activePointers.size === 0) {
      isPanning = false;
    }
  }

  function handleWheel(e: WheelEvent): void {
    if (!viewportEl) {
      return;
    }
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const rect = viewportEl.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const factor = Math.exp(-e.deltaY * 0.0025);
      const nextZoom = Math.max(0.12, Math.min(2.0, zoom * factor));
      const ratio = nextZoom / zoom;

      camX = mouseX - (mouseX - camX) * ratio;
      camY = mouseY - (mouseY - camY) * ratio;
      zoom = nextZoom;
    } else {
      camX -= e.deltaX;
      camY -= e.deltaY;
    }
  }

  function zoomBy(factor: number): void {
    if (!viewportEl) {
      return;
    }
    const rect = viewportEl.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const nextZoom = Math.max(0.12, Math.min(2.0, zoom * factor));
    const ratio = nextZoom / zoom;
    camX = cx - (cx - camX) * ratio;
    camY = cy - (cy - camY) * ratio;
    zoom = nextZoom;
  }

  function focusBoard(board: PositionedBoard): void {
    if (!viewportEl) {
      return;
    }
    const rect = viewportEl.getBoundingClientRect();
    const pad = 120;
    const targetZoom = Math.max(
      0.25,
      Math.min(1.0, Math.min((rect.width - pad) / board.width, (rect.height - pad) / board.height)),
    );

    zoom = targetZoom;
    camX = rect.width / 2 - (board.x + board.width / 2) * targetZoom;
    camY = rect.height / 2 - (board.y + board.height / 2) * targetZoom;

    highlightedBoardId = board.id;
    setTimeout(() => {
      if (highlightedBoardId === board.id) {
        highlightedBoardId = null;
      }
    }, 1600);
  }

  function fitAll(): void {
    if (!viewportEl || layout.boards.length === 0) {
      return;
    }
    const rect = viewportEl.getBoundingClientRect();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const b of layout.boards) {
      if (b.x < minX) {
        minX = b.x;
      }
      if (b.y < minY) {
        minY = b.y;
      }
      if (b.x + b.width > maxX) {
        maxX = b.x + b.width;
      }
      if (b.y + b.height > maxY) {
        maxY = b.y + b.height;
      }
    }

    const contentW = maxX - minX + 200;
    const contentH = maxY - minY + 200;
    const nextZoom = Math.max(
      0.12,
      Math.min(0.8, Math.min(rect.width / contentW, rect.height / contentH)),
    );

    zoom = nextZoom;
    camX = (rect.width - contentW * nextZoom) / 2 - (minX - 100) * nextZoom;
    camY = (rect.height - contentH * nextZoom) / 2 - (minY - 100) * nextZoom;
  }

  async function handleAddComment(input: CommentInput): Promise<void> {
    try {
      const created = await api.createComment(input);
      comments = [...comments, created];
    } catch (err) {
      console.warn('[sveltekit-artboard] Failed to create comment:', err);
    }
  }

  async function handleEditComment(commentId: string, text: string): Promise<void> {
    try {
      const updated = await api.patchComment(commentId, { text });
      comments = comments.map((c) => {
        return c.id === updated.id ? updated : c;
      });
    } catch {
      // Comment may be busy with agent
    }
  }

  async function handleMovePin(commentId: string, pinXPct: number, pinYPct: number): Promise<void> {
    // Optimistically update local position immediately for zero snap-back
    comments = comments.map((c) => {
      return c.id === commentId ? { ...c, artboard: { ...c.artboard, pinXPct, pinYPct } } : c;
    });
    try {
      const updated = await api.patchComment(commentId, { pinXPct, pinYPct });
      comments = comments.map((c) => {
        return c.id === updated.id ? updated : c;
      });
    } catch {
      await refreshComments();
    }
  }

  async function handleToggleComment(comment: ArtboardComment): Promise<void> {
    const nextStatus = comment.status === 'resolved' ? 'open' : 'resolved';
    try {
      const updated = await api.patchComment(comment.id, { status: nextStatus });
      comments = comments.map((c) => {
        return c.id === updated.id ? updated : c;
      });
    } catch {
      // Comment may be busy with agent
    }
  }

  async function handleDeleteComment(commentId: string): Promise<void> {
    try {
      await api.deleteComment(commentId);
      comments = comments.filter((c) => {
        return c.id !== commentId;
      });
    } catch {
      // Comment may be busy with agent
    }
  }

  async function handleClearResolved(): Promise<void> {
    try {
      await api.clearResolved();
      await refreshComments();
    } catch {
      // Ignore
    }
  }

  function handleFocusComment(comment: ArtboardComment): void {
    const targetBoard = layout.boards.find((b) => {
      return b.id === comment.artboard.boardId;
    });
    if (targetBoard) {
      focusBoard(targetBoard);
    }
    selectedCommentId = comment.id;
  }

  async function handleSendToAgent(ids: string[]): Promise<void> {
    try {
      await api.runAgent(ids);
      await refreshAgent();
    } catch {
      await refreshAgent();
    }
  }

  async function handleCancelAgent(): Promise<void> {
    try {
      await api.cancelAgent();
      await refreshAgent();
    } catch {
      // Ignore
    }
  }

  async function handleResumeAgent(): Promise<void> {
    try {
      await api.resumeAgent();
      await refreshAgent();
    } catch {
      // Ignore
    }
  }

  async function handleUpdateAgentSettings(patch: AgentSettingsPatch): Promise<void> {
    await api.updateAgentSettings(patch);
    await refreshAgent();
  }
</script>

<div class="ab-root" data-studio-theme={resolvedStudioTheme}>
  {#if sidebarOpen}
    <aside class="ab-sidebar">
      <div class="ab-sidebar-head">
        <div class="ab-brand">
          <div class="ab-brand-icon">
            <Layers size={16} />
          </div>
          <div>
            <h1 class="ab-brand-title">Artboard Studio</h1>
            <p class="ab-brand-badge">DEV-ONLY PLUGIN</p>
          </div>
        </div>
        <button
          type="button"
          title="Collapse sidebar"
          class="ab-icon-btn"
          onclick={() => {
            sidebarOpen = false;
          }}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      <!-- Sidebar Mode Tabs: Boards | Comments -->
      <div class="ab-side-tabs">
        <button
          type="button"
          class="ab-side-tab"
          class:ab-side-tab-active={sidebarTab === 'boards'}
          onclick={() => {
            sidebarTab = 'boards';
          }}
        >
          Boards ({layout.boards.length})
        </button>
        <button
          type="button"
          class="ab-side-tab"
          class:ab-side-tab-active={sidebarTab === 'comments'}
          onclick={() => {
            sidebarTab = 'comments';
          }}
        >
          {openCommentCount > 0 ? `Comments (${openCommentCount})` : 'Comments'}
        </button>
      </div>

      {#if sidebarTab === 'boards'}
        <div class="ab-sidebar-filters">
          <div class="ab-search-wrap">
            <span class="ab-search-icon">
              <Search size={14} />
            </span>
            <input
              type="search"
              bind:value={searchQuery}
              placeholder="Jump to artboard..."
              class="ab-search-input"
            />
          </div>

          <div class="ab-cat-row">
            {#each categories as cat (cat.id)}
              <button
                type="button"
                class="ab-cat-pill"
                class:ab-cat-active={activeCategory === cat.id}
                onclick={() => {
                  activeCategory = cat.id;
                }}
              >
                {cat.label}
              </button>
            {/each}
          </div>
        </div>

        <div class="ab-board-list">
          {#each filteredBoards as board (board.id)}
            {@const pinCount = comments.filter((c) => {
              return c.artboard.boardId === board.id && c.status === 'open';
            }).length}
            {@const isLive = mountedIds.has(board.id)}
            <button
              type="button"
              class="ab-board-row"
              class:ab-board-row-active={highlightedBoardId === board.id}
              onclick={() => {
                focusBoard(board);
              }}
            >
              <div class="ab-board-row-left">
                {#if showDebug}
                  <span class="ab-row-dot" class:ab-row-dot-live={isLive}></span>
                {/if}
                <div class="ab-board-row-meta">
                  <p class="ab-board-row-title">{board.title}</p>
                  <p class="ab-board-row-dim">{board.viewportLabel}</p>
                </div>
              </div>
              {#if pinCount > 0}
                <span class="ab-row-pin-badge">{pinCount}</span>
              {/if}
            </button>
          {/each}
        </div>
      {:else}
        <CommentsPanel
          {comments}
          {agentInfo}
          onfocuscomment={handleFocusComment}
          ontogglecomment={handleToggleComment}
          ondeletecomment={handleDeleteComment}
          onclearresolved={handleClearResolved}
          onsendtoagent={handleSendToAgent}
          oncancelagent={handleCancelAgent}
          onresumeagent={handleResumeAgent}
          onopenagentsettings={() => {
            agentModalOpen = true;
          }}
        />
      {/if}

      <div class="ab-sidebar-foot">
        <a href={appUrl} class="ab-back-link">
          <ArrowLeft size={14} />
          Back to Live App
        </a>
      </div>
    </aside>
  {/if}

  <div class="ab-main">
    <div class="ab-topbar">
      <div class="ab-topbar-left">
        {#if !sidebarOpen}
          <button
            type="button"
            title="Open sidebar"
            class="ab-pill-group ab-icon-pad"
            onclick={() => {
              sidebarOpen = true;
            }}
          >
            <PanelLeftOpen size={16} />
          </button>
        {/if}

        <div class="ab-pill-group">
          <button
            type="button"
            title="Interact with UI components (V)"
            class="ab-tool-btn"
            class:ab-tool-active={effectiveTool === 'interact'}
            onclick={() => {
              tool = 'interact';
            }}
          >
            <MousePointer2 size={14} />
            Interact
          </button>
          <button
            type="button"
            title="Pan Canvas (H or hold Space)"
            class="ab-tool-btn"
            class:ab-tool-active={effectiveTool === 'pan'}
            onclick={() => {
              tool = 'pan';
            }}
          >
            <Hand size={14} />
            Pan
          </button>
          <button
            type="button"
            title="Pin Review Comments (C)"
            class="ab-tool-btn"
            class:ab-tool-comment={effectiveTool === 'comment'}
            onclick={() => {
              tool = 'comment';
            }}
          >
            <MessageSquarePlus size={14} />
            Comment
          </button>
        </div>

        {#if agentWorking || agentPaused}
          <button
            type="button"
            class="ab-pill-group ab-agent-chip"
            class:ab-agent-chip-warn={Boolean(agentPaused)}
            onclick={() => {
              sidebarOpen = true;
              sidebarTab = 'comments';
            }}
          >
            {#if agentWorking}
              <span class="ab-spin"><Loader2 size={13} /></span>
              <span>Agent running…</span>
            {:else}
              <Bot size={13} />
              <span>Agent paused</span>
            {/if}
          </button>
        {/if}
      </div>

      <div class="ab-pill-group ab-topbar-right">
        <!-- Optional App Content Theme Selector (only rendered if consumer provides `themes`) -->
        {#if themes.length > 0}
          <ThemeSelect
            {themes}
            size="sm"
            showIcon={true}
            label="Global app theme"
            value={activeGlobalThemeId ?? ''}
            onchange={(id) => {
              globalThemeOverride = id;
            }}
          />
          <div class="ab-divider"></div>
        {/if}

        <button
          type="button"
          aria-label="Grid"
          title="Toggle Layout Grid Overlay (G)"
          class="ab-tool-btn"
          class:ab-tool-grid={showGrid}
          onclick={() => {
            showGrid = !showGrid;
          }}
        >
          <Grid3x3 size={14} />
          <span class="ab-mobile-hide">Grid</span>
        </button>

        {#if showDebug}
          <button
            type="button"
            aria-label={stressTest ? `Stress (${layout.boards.length})` : 'Stress Test'}
            title="Toggle Stress Test (3x artboards for IntersectionObserver benchmark)"
            class="ab-tool-btn"
            class:ab-tool-stress={stressTest}
            onclick={() => {
              stressTest = !stressTest;
            }}
          >
            <Flame size={14} />
            <span class="ab-mobile-hide">
              {stressTest ? `Stress (${layout.boards.length})` : 'Stress Test'}
            </span>
          </button>
        {/if}

        <button
          type="button"
          aria-label="Toggle debug tools"
          title="Toggle Debug & Performance Tools (D)"
          class="ab-icon-btn"
          class:ab-tool-debug={showDebug}
          onclick={toggleDebug}
        >
          <Bug size={14} />
        </button>

        <button
          type="button"
          aria-label="Toggle studio theme"
          title="Switch Artboard Studio UI between Light and Dark"
          class="ab-icon-btn"
          onclick={toggleStudioTheme}
        >
          {#if resolvedStudioTheme === 'dark'}
            <Moon size={14} color="#818cf8" />
          {:else}
            <Sun size={14} color="#d97706" />
          {/if}
        </button>

        <div class="ab-divider"></div>

        <button
          type="button"
          title="Zoom out"
          class="ab-icon-btn"
          onclick={() => {
            zoomBy(0.8);
          }}
        >
          <ZoomOut size={14} />
        </button>
        <button
          type="button"
          title="Reset to 100%"
          class="ab-zoom-val"
          onclick={() => {
            zoom = 1;
          }}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          title="Zoom in"
          class="ab-icon-btn"
          onclick={() => {
            zoomBy(1.25);
          }}
        >
          <ZoomIn size={14} />
        </button>
        <button type="button" title="Fit all boards (0)" class="ab-icon-btn" onclick={fitAll}>
          <Maximize2 size={14} />
        </button>
      </div>
    </div>

    <div
      bind:this={viewportEl}
      role="application"
      aria-label="Artboard Infinite Canvas"
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
      onwheel={handleWheel}
      class="ab-canvas"
      class:ab-canvas-grab={effectiveTool === 'pan' && !isPanning}
      class:ab-canvas-grabbing={effectiveTool === 'pan' && isPanning}
    >
      <div class="ab-world" style="transform: translate({camX}px, {camY}px) scale({zoom});">
        {#each layout.sections as section (section.id)}
          <div class="ab-section-head" style="left: {section.x}px; top: {section.y}px;">
            <h2 class="ab-section-title">{section.title}</h2>
            {#if section.subtitle}
              <p class="ab-section-sub">{section.subtitle}</p>
            {/if}
          </div>
        {/each}

        {#each layout.boards as board (board.id)}
          <ArtboardFrame
            {board}
            tool={effectiveTool}
            {zoom}
            {themes}
            globalThemeId={activeGlobalThemeId}
            {showGrid}
            comments={comments.filter((c) => {
              return c.artboard.boardId === board.id;
            })}
            runsMap={agentInfo?.state.runs ?? {}}
            agentEnabled={agentInfo?.settings.enabled ?? false}
            {selectedCommentId}
            highlighted={highlightedBoardId === board.id}
            {showDebug}
            onmountchange={handleMountChange}
            onfocusboard={focusBoard}
            onaddcomment={handleAddComment}
            oneditcomment={handleEditComment}
            onmovepin={handleMovePin}
            ontogglecomment={handleToggleComment}
            ondeletecomment={handleDeleteComment}
            onsendtoagent={handleSendToAgent}
          />
        {/each}
      </div>
    </div>

    {#if showDebug}
      <div class="ab-hud">
        <div>
          <p class="ab-hud-label">IntersectionObserver</p>
          <div class="ab-hud-row">
            <span class="ab-hud-num">{mountedCount} / {layout.boards.length}</span>
            <span class="ab-hud-muted">mounted ({mountedRatio}%)</span>
          </div>
        </div>

        <div class="ab-hud-sep"></div>

        <div>
          <p class="ab-hud-label">FPS</p>
          <p class="ab-hud-num" style="color: {fpsColor};">{fps}</p>
        </div>

        <div class="ab-hud-sep"></div>

        <div class="ab-hud-hints">
          <p><kbd class="ab-kbd">Space</kbd> + Drag to pan</p>
          <p><kbd class="ab-kbd">Ctrl</kbd> + Scroll to zoom</p>
        </div>
      </div>
    {/if}
  </div>

  <AgentSettingsModal
    open={agentModalOpen}
    {agentInfo}
    loadModels={(provider) => {
      return api.getAgentModels(provider);
    }}
    onupdate={handleUpdateAgentSettings}
    onclose={() => {
      agentModalOpen = false;
    }}
  />
</div>

<style>
  .ab-root {
    /* Dark Studio Chrome (default) */
    --ab-bg: #09090b;
    --ab-surface: rgba(24, 24, 27, 0.94);
    --ab-surface-solid: #18181b;
    --ab-input-bg: #09090b;
    --ab-pill-bg: #27272a;
    --ab-hover: #27272a;
    --ab-border: rgba(63, 63, 70, 0.85);
    --ab-border-subtle: #27272a;
    --ab-text: #f4f4f5;
    --ab-text-muted: #a1a1aa;
    --ab-text-subtle: #71717a;
    --ab-accent-text: #a5b4fc;
    --ab-dot-idle: #52525b;
    --ab-canvas-dot: rgba(148, 163, 184, 0.22);
    --ab-frame-border: rgba(63, 63, 70, 0.85);
    --ab-frame-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.55);
    --ab-placeholder-bg: rgba(24, 24, 27, 0.95);
    --ab-chrome-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);

    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: var(--ab-bg);
    color: var(--ab-text);
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
  }

  .ab-root[data-studio-theme='light'] {
    --ab-bg: #f1f5f9;
    --ab-surface: rgba(255, 255, 255, 0.94);
    --ab-surface-solid: #ffffff;
    --ab-input-bg: #f8fafc;
    --ab-pill-bg: #e2e8f0;
    --ab-hover: #f1f5f9;
    --ab-border: #cbd5e1;
    --ab-border-subtle: #e2e8f0;
    --ab-text: #0f172a;
    --ab-text-muted: #475569;
    --ab-text-subtle: #64748b;
    --ab-accent-text: #4f46e5;
    --ab-dot-idle: #94a3b8;
    --ab-canvas-dot: rgba(100, 116, 139, 0.28);
    --ab-frame-border: #cbd5e1;
    --ab-frame-shadow: 0 16px 36px -10px rgba(15, 23, 42, 0.16);
    --ab-placeholder-bg: #e2e8f0;
    --ab-chrome-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);
  }

  .ab-sidebar {
    z-index: 30;
    display: flex;
    flex-direction: column;
    width: 288px;
    flex-shrink: 0;
    border-right: 1px solid var(--ab-border-subtle);
    background: var(--ab-surface);
    backdrop-filter: blur(12px);
  }

  .ab-sidebar-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--ab-border-subtle);
    padding: 12px 16px;
  }

  .ab-side-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    border-bottom: 1px solid var(--ab-border-subtle);
    padding: 8px 12px;
  }

  .ab-side-tab {
    border: none;
    border-radius: 7px;
    background: transparent;
    padding: 6px 8px;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-side-tab:hover {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-side-tab-active {
    background: var(--ab-pill-bg);
    color: var(--ab-text);
    font-weight: 600;
  }

  .ab-agent-chip {
    padding: 6px 10px;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--ab-accent-text);
    cursor: pointer;
  }

  .ab-agent-chip-warn {
    color: #f59e0b;
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

  .ab-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ab-brand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #4f46e5;
    color: #ffffff;
  }

  .ab-brand-title {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    color: var(--ab-text);
  }

  .ab-brand-badge {
    margin: 0;
    font-size: 10px;
    color: #10b981;
    letter-spacing: 0.04em;
  }

  .ab-sidebar-filters {
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-bottom: 1px solid var(--ab-border-subtle);
    padding: 12px;
  }

  .ab-search-wrap {
    position: relative;
  }

  .ab-search-icon {
    pointer-events: none;
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    color: var(--ab-text-subtle);
    display: inline-flex;
  }

  .ab-search-input {
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--ab-border);
    background: var(--ab-input-bg);
    padding: 0 10px 0 32px;
    font-size: 12px;
    color: var(--ab-text);
  }

  .ab-search-input:focus {
    outline: none;
    border-color: #6366f1;
  }

  .ab-cat-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .ab-cat-pill {
    border: none;
    border-radius: 6px;
    background: var(--ab-pill-bg);
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 500;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-cat-pill:hover {
    color: var(--ab-text);
  }

  .ab-cat-active {
    background: #4f46e5;
    color: #ffffff;
  }

  .ab-board-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ab-board-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    border: none;
    border-radius: 8px;
    background: transparent;
    padding: 8px 10px;
    text-align: left;
    color: var(--ab-text);
    cursor: pointer;
  }

  .ab-board-row:hover {
    background: var(--ab-hover);
  }

  .ab-board-row-active {
    background: rgba(99, 102, 241, 0.16);
    color: var(--ab-accent-text);
  }

  .ab-board-row-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .ab-row-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: var(--ab-dot-idle);
    flex-shrink: 0;
  }

  .ab-row-dot-live {
    background: #34d399;
  }

  .ab-board-row-meta {
    min-width: 0;
  }

  .ab-board-row-title {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-board-row-dim {
    margin: 2px 0 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    color: var(--ab-text-subtle);
  }

  .ab-row-pin-badge {
    flex-shrink: 0;
    border-radius: 9999px;
    background: rgba(245, 158, 11, 0.2);
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 600;
    color: #d97706;
  }

  .ab-sidebar-foot {
    border-top: 1px solid var(--ab-border-subtle);
    padding: 12px;
  }

  .ab-back-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 8px;
    border: 1px solid var(--ab-border);
    background: var(--ab-input-bg);
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--ab-text);
    text-decoration: none;
  }

  .ab-back-link:hover {
    background: var(--ab-hover);
  }

  .ab-main {
    position: relative;
    flex: 1;
    overflow: hidden;
  }

  .ab-topbar {
    pointer-events: none;
    position: absolute;
    top: 16px;
    right: 16px;
    left: 16px;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .ab-topbar-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ab-pill-group {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: 12px;
    border: 1px solid var(--ab-border);
    background: var(--ab-surface);
    padding: 4px;
    box-shadow: var(--ab-chrome-shadow);
    backdrop-filter: blur(12px);
    color: var(--ab-text);
  }

  .ab-icon-pad {
    padding: 8px;
    cursor: pointer;
  }

  .ab-tool-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    border-radius: 8px;
    background: transparent;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-tool-btn:hover {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-tool-active {
    background: #4f46e5;
    color: #ffffff;
  }

  .ab-tool-active:hover {
    background: #4f46e5;
    color: #ffffff;
  }

  .ab-tool-comment {
    background: #f59e0b;
    color: #09090b;
  }

  .ab-tool-comment:hover {
    background: #f59e0b;
    color: #09090b;
  }

  .ab-tool-grid {
    background: rgba(244, 63, 94, 0.16);
    color: #e11d48;
  }

  .ab-tool-stress {
    background: rgba(249, 115, 22, 0.2);
    color: #ea580c;
  }

  .ab-tool-debug {
    background: rgba(16, 185, 129, 0.18);
    color: #10b981;
  }

  .ab-divider {
    width: 1px;
    height: 16px;
    margin: 0 4px;
    background: var(--ab-border);
  }

  .ab-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    background: transparent;
    padding: 6px;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-icon-btn:hover {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-zoom-val {
    min-width: 48px;
    border: none;
    border-radius: 8px;
    background: transparent;
    padding: 4px 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    color: var(--ab-text);
    cursor: pointer;
  }

  .ab-zoom-val:hover {
    background: var(--ab-hover);
  }

  .ab-canvas {
    width: 100%;
    height: 100%;
    overflow: hidden;
    touch-action: none;
    background-image: radial-gradient(circle, var(--ab-canvas-dot) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  @media (max-width: 767px) {
    .ab-sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 50;
      background: var(--ab-surface-solid);
      backdrop-filter: none;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
    }

    .ab-pill-group,
    .ab-hud {
      background: var(--ab-surface-solid);
      backdrop-filter: none;
    }

    .ab-topbar {
      flex-direction: column;
      align-items: flex-start;
      top: 10px;
      right: 10px;
      left: 10px;
      gap: 6px;
    }

    .ab-topbar-left,
    .ab-topbar-right {
      max-width: 100%;
    }
  }

  @media (max-width: 480px) {
    .ab-mobile-hide {
      display: none;
    }

    .ab-topbar-right {
      gap: 2px;
      padding: 3px;
    }

    .ab-topbar-right .ab-tool-btn,
    .ab-topbar-right .ab-icon-btn {
      padding: 5px;
    }

    .ab-topbar-right .ab-divider {
      margin: 0 2px;
    }

    .ab-topbar-right .ab-zoom-val {
      min-width: 38px;
      padding: 4px 2px;
      font-size: 11px;
    }

    .ab-topbar-left .ab-tool-btn {
      padding: 5px 8px;
      font-size: 11px;
    }
  }

  .ab-canvas-grab {
    cursor: grab;
  }

  .ab-canvas-grabbing {
    cursor: grabbing;
  }

  .ab-world {
    transform-origin: 0 0;
  }

  .ab-section-head {
    position: absolute;
    user-select: none;
  }

  .ab-section-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--ab-text);
  }

  .ab-section-sub {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--ab-text-muted);
  }

  .ab-hud {
    pointer-events: auto;
    position: absolute;
    right: 16px;
    bottom: 16px;
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 16px;
    border-radius: 12px;
    border: 1px solid var(--ab-border);
    background: var(--ab-surface);
    padding: 10px 16px;
    font-size: 12px;
    box-shadow: var(--ab-chrome-shadow);
    backdrop-filter: blur(12px);
  }

  .ab-hud-label {
    margin: 0;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ab-text-muted);
  }

  .ab-hud-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
  }

  .ab-hud-num {
    margin: 2px 0 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight: 700;
    color: #10b981;
  }

  .ab-hud-muted {
    font-size: 11px;
    color: var(--ab-text-muted);
  }

  .ab-hud-sep {
    width: 1px;
    height: 28px;
    background: var(--ab-border);
  }

  .ab-hud-hints {
    font-size: 10px;
    line-height: 1.5;
    color: var(--ab-text-muted);
  }

  .ab-hud-hints p {
    margin: 0;
  }

  .ab-kbd {
    border-radius: 4px;
    background: var(--ab-pill-bg);
    padding: 1px 5px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    color: var(--ab-text);
  }
</style>
