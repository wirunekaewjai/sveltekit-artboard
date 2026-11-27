<script lang="ts">
  type Props = {
    mountedCount: number;
    totalBoards: number;
    fps: number;
  };

  let { mountedCount, totalBoards, fps }: Props = $props();

  const mountedRatio = $derived(totalBoards ? Math.round((mountedCount / totalBoards) * 100) : 0);

  const fpsColor = $derived.by(() => {
    if (fps >= 50) {
      return '#10b981';
    }
    if (fps >= 30) {
      return '#f59e0b';
    }
    return '#f43f5e';
  });
</script>

<div class="ab-hud">
  <div>
    <p class="ab-hud-label">IntersectionObserver</p>
    <div class="ab-hud-row">
      <span class="ab-hud-num">{mountedCount} / {totalBoards}</span>
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

<style>
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

  @media (max-width: 767px) {
    .ab-hud {
      background: var(--ab-surface-solid);
      backdrop-filter: none;
    }
  }
</style>
