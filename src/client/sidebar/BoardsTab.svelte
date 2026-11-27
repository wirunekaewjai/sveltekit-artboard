<script lang="ts">
  import { Search } from '@lucide/svelte';

  import type { PositionedBoard } from '#src/client/layout.ts';
  import type { ArtboardComment } from '#src/core/schema.ts';

  type Category = {
    id: string;
    label: string;
  };

  type Props = {
    boards: readonly PositionedBoard[];
    categories: readonly Category[];
    comments: readonly ArtboardComment[];
    mountedIds: ReadonlySet<string>;
    highlightedBoardId: string | null;
    showDebug: boolean;
    onfocusboard: (board: PositionedBoard) => void;
  };

  let {
    boards,
    categories,
    comments,
    mountedIds,
    highlightedBoardId,
    showDebug,
    onfocusboard,
  }: Props = $props();

  let searchQuery = $state('');
  let activeCategory = $state<string>('all');

  const filteredBoards = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    return boards.filter((b) => {
      const matchCat = activeCategory === 'all' || b.category === activeCategory;
      const matchQ =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.section.toLowerCase().includes(q) ||
        b.viewportLabel.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  });
</script>

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
        onfocusboard(board);
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

<style>
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
</style>
