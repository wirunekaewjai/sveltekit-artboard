<script lang="ts">
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

  import type { CameraState, PinchMetrics } from '#src/client/camera.ts';
  import type { CanvasTool } from '#src/client/canvas/ArtboardFrame.svelte';
  import type { PositionedBoard } from '#src/client/layout.ts';
  import type { AgentInfo, AgentSettingsPatch } from '#src/core/agent-state.ts';
  import type { ArtboardComment, CommentInput } from '#src/core/schema.ts';
  import type { ArtboardSection, ArtboardTheme, StudioTheme } from '#src/registry.ts';

  import AgentSettingsModal from '#src/client/agent/AgentSettingsModal.svelte';
  import { createApiClient } from '#src/client/api-client.ts';
  import {
    computeFitAll,
    computeFocusBoard,
    computePinchMetrics,
    computePinchTransform,
    computeZoomAtPoint,
  } from '#src/client/camera.ts';
  import ArtboardFrame from '#src/client/canvas/ArtboardFrame.svelte';
  import DebugHud from '#src/client/canvas/DebugHud.svelte';
  import StudioTopbar from '#src/client/canvas/StudioTopbar.svelte';
  import { getStudioDefaults } from '#src/client/defaults.ts';
  import { computeCanvasLayout } from '#src/client/layout.ts';
  import StudioSidebar from '#src/client/sidebar/StudioSidebar.svelte';

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

  const activePointers = new SvelteMap<number, { x: number; y: number }>();
  let pinchStart: (PinchMetrics & CameraState) | null = null;

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

  const mountedCount = $derived.by(() => {
    let count = 0;
    for (const b of layout.boards) {
      if (mountedIds.has(b.id)) {
        count++;
      }
    }
    return count;
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

  function applyCamera(next: CameraState): void {
    camX = next.camX;
    camY = next.camY;
    zoom = next.zoom;
  }

  function handleMountChange(id: string, mounted: boolean): void {
    if (mounted) {
      mountedIds.add(id);
    } else {
      mountedIds.delete(id);
    }
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
      isPanning = false;
      const metrics = computePinchMetrics([...activePointers.values()]);
      if (metrics) {
        pinchStart = { ...metrics, zoom, camX, camY };
      }
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture failures
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
      const metrics = computePinchMetrics([...activePointers.values()]);
      if (metrics) {
        applyCamera(computePinchTransform(pinchStart, metrics));
      }
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
      applyCamera(
        computeZoomAtPoint(
          { camX, camY, zoom },
          { x: e.clientX - rect.left, y: e.clientY - rect.top },
          Math.exp(-e.deltaY * 0.0025),
        ),
      );
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
    applyCamera(
      computeZoomAtPoint({ camX, camY, zoom }, { x: rect.width / 2, y: rect.height / 2 }, factor),
    );
  }

  function focusBoard(board: PositionedBoard): void {
    if (!viewportEl) {
      return;
    }
    const rect = viewportEl.getBoundingClientRect();
    applyCamera(computeFocusBoard(board, rect.width, rect.height));
    highlightedBoardId = board.id;
    setTimeout(() => {
      if (highlightedBoardId === board.id) {
        highlightedBoardId = null;
      }
    }, 1600);
  }

  function fitAll(): void {
    if (!viewportEl) {
      return;
    }
    const rect = viewportEl.getBoundingClientRect();
    const next = computeFitAll(layout.boards, rect.width, rect.height);
    if (next) {
      applyCamera(next);
    }
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
    <StudioSidebar
      {sidebarTab}
      boards={layout.boards}
      {categories}
      {comments}
      {openCommentCount}
      {agentInfo}
      {mountedIds}
      {highlightedBoardId}
      {showDebug}
      {appUrl}
      onchangetab={(tab) => {
        sidebarTab = tab;
      }}
      onclose={() => {
        sidebarOpen = false;
      }}
      onfocusboard={focusBoard}
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

  <div class="ab-main">
    <StudioTopbar
      {sidebarOpen}
      {effectiveTool}
      {agentWorking}
      agentPaused={Boolean(agentPaused)}
      {themes}
      {activeGlobalThemeId}
      {showGrid}
      {showDebug}
      {stressTest}
      boardCount={layout.boards.length}
      {resolvedStudioTheme}
      {zoom}
      onopensidebar={() => {
        sidebarOpen = true;
      }}
      onopenagentpanel={() => {
        sidebarOpen = true;
        sidebarTab = 'comments';
      }}
      onselecttool={(next) => {
        tool = next;
      }}
      onselectglobaltheme={(id) => {
        globalThemeOverride = id;
      }}
      ontogglegrid={() => {
        showGrid = !showGrid;
      }}
      ontogglestress={() => {
        stressTest = !stressTest;
      }}
      ontoggledebug={toggleDebug}
      ontogglestudiotheme={toggleStudioTheme}
      onzoomby={zoomBy}
      onresetzoom={() => {
        zoom = 1;
      }}
      onfitall={fitAll}
    />

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
      <DebugHud {mountedCount} totalBoards={layout.boards.length} {fps} />
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

  .ab-main {
    position: relative;
    flex: 1;
    overflow: hidden;
  }

  .ab-canvas {
    width: 100%;
    height: 100%;
    overflow: hidden;
    touch-action: none;
    background-image: radial-gradient(circle, var(--ab-canvas-dot) 1px, transparent 1px);
    background-size: 24px 24px;
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
</style>
