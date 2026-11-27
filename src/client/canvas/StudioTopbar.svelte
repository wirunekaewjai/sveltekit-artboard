<script lang="ts">
  import {
    Bot,
    Bug,
    Flame,
    Grid3x3,
    Hand,
    Loader2,
    Maximize2,
    MessageSquarePlus,
    Moon,
    MousePointer2,
    PanelLeftOpen,
    Sun,
    ZoomIn,
    ZoomOut,
  } from '@lucide/svelte';

  import type { CanvasTool } from '#src/client/canvas/ArtboardFrame.svelte';
  import type { ArtboardTheme } from '#src/registry.ts';

  import ThemeSelect from '#src/client/ui/ThemeSelect.svelte';

  type Props = {
    sidebarOpen: boolean;
    effectiveTool: CanvasTool;
    agentWorking: boolean;
    agentPaused: boolean;
    themes: ArtboardTheme[];
    activeGlobalThemeId: string | null;
    showGrid: boolean;
    showDebug: boolean;
    stressTest: boolean;
    boardCount: number;
    resolvedStudioTheme: 'dark' | 'light';
    zoom: number;
    onopensidebar: () => void;
    onopenagentpanel: () => void;
    onselecttool: (tool: CanvasTool) => void;
    onselectglobaltheme: (id: string) => void;
    ontogglegrid: () => void;
    ontogglestress: () => void;
    ontoggledebug: () => void;
    ontogglestudiotheme: () => void;
    onzoomby: (factor: number) => void;
    onresetzoom: () => void;
    onfitall: () => void;
  };

  let {
    sidebarOpen,
    effectiveTool,
    agentWorking,
    agentPaused,
    themes,
    activeGlobalThemeId,
    showGrid,
    showDebug,
    stressTest,
    boardCount,
    resolvedStudioTheme,
    zoom,
    onopensidebar,
    onopenagentpanel,
    onselecttool,
    onselectglobaltheme,
    ontogglegrid,
    ontogglestress,
    ontoggledebug,
    ontogglestudiotheme,
    onzoomby,
    onresetzoom,
    onfitall,
  }: Props = $props();
</script>

<div class="ab-topbar">
  <div class="ab-topbar-left">
    {#if !sidebarOpen}
      <button
        type="button"
        title="Open sidebar"
        class="ab-pill-group ab-icon-pad"
        onclick={onopensidebar}
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
          onselecttool('interact');
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
          onselecttool('pan');
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
          onselecttool('comment');
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
        class:ab-agent-chip-warn={agentPaused}
        onclick={onopenagentpanel}
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
    {#if themes.length > 0}
      <ThemeSelect
        {themes}
        size="sm"
        showIcon={true}
        label="Global app theme"
        value={activeGlobalThemeId ?? ''}
        onchange={onselectglobaltheme}
      />
      <div class="ab-divider"></div>
    {/if}

    <button
      type="button"
      aria-label="Grid"
      title="Toggle Layout Grid Overlay (G)"
      class="ab-tool-btn"
      class:ab-tool-grid={showGrid}
      onclick={ontogglegrid}
    >
      <Grid3x3 size={14} />
      <span class="ab-mobile-hide">Grid</span>
    </button>

    {#if showDebug}
      <button
        type="button"
        aria-label={stressTest ? `Stress (${boardCount})` : 'Stress Test'}
        title="Toggle Stress Test (3x artboards for IntersectionObserver benchmark)"
        class="ab-tool-btn"
        class:ab-tool-stress={stressTest}
        onclick={ontogglestress}
      >
        <Flame size={14} />
        <span class="ab-mobile-hide">
          {stressTest ? `Stress (${boardCount})` : 'Stress Test'}
        </span>
      </button>
    {/if}

    <button
      type="button"
      aria-label="Toggle debug tools"
      title="Toggle Debug & Performance Tools (D)"
      class="ab-icon-btn"
      class:ab-tool-debug={showDebug}
      onclick={ontoggledebug}
    >
      <Bug size={14} />
    </button>

    <button
      type="button"
      aria-label="Toggle studio theme"
      title="Switch Artboard Studio UI between Light and Dark"
      class="ab-icon-btn"
      onclick={ontogglestudiotheme}
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
        onzoomby(0.8);
      }}
    >
      <ZoomOut size={14} />
    </button>
    <button type="button" title="Reset to 100%" class="ab-zoom-val" onclick={onresetzoom}>
      {Math.round(zoom * 100)}%
    </button>
    <button
      type="button"
      title="Zoom in"
      class="ab-icon-btn"
      onclick={() => {
        onzoomby(1.25);
      }}
    >
      <ZoomIn size={14} />
    </button>
    <button type="button" title="Fit all boards (0)" class="ab-icon-btn" onclick={onfitall}>
      <Maximize2 size={14} />
    </button>
  </div>
</div>

<style>
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

  .ab-tool-active,
  .ab-tool-active:hover {
    background: #4f46e5;
    color: #ffffff;
  }

  .ab-tool-comment,
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

  @media (max-width: 767px) {
    .ab-pill-group {
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
</style>
