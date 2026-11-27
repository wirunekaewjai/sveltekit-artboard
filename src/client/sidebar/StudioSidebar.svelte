<script lang="ts">
  import { ArrowLeft, Layers, PanelLeftClose } from '@lucide/svelte';

  import type { PositionedBoard } from '#src/client/layout.ts';
  import type { AgentInfo } from '#src/core/agent-state.ts';
  import type { ArtboardComment } from '#src/core/schema.ts';

  import BoardsTab from '#src/client/sidebar/BoardsTab.svelte';
  import CommentsPanel from '#src/client/sidebar/CommentsPanel.svelte';

  type Category = {
    id: string;
    label: string;
  };

  type Props = {
    sidebarTab: 'boards' | 'comments';
    boards: readonly PositionedBoard[];
    categories: readonly Category[];
    comments: ArtboardComment[];
    openCommentCount: number;
    agentInfo: AgentInfo | null;
    mountedIds: ReadonlySet<string>;
    highlightedBoardId: string | null;
    showDebug: boolean;
    appUrl: string;
    onchangetab: (tab: 'boards' | 'comments') => void;
    onclose: () => void;
    onfocusboard: (board: PositionedBoard) => void;
    onfocuscomment: (comment: ArtboardComment) => void;
    ontogglecomment: (comment: ArtboardComment) => void;
    ondeletecomment: (id: string) => void;
    onclearresolved: () => void;
    onsendtoagent: (ids: string[]) => void;
    oncancelagent: () => void;
    onresumeagent: () => void;
    onopenagentsettings: () => void;
    onopenlog: (runId: string, title?: string) => void;
  };

  let {
    sidebarTab,
    boards,
    categories,
    comments,
    openCommentCount,
    agentInfo,
    mountedIds,
    highlightedBoardId,
    showDebug,
    appUrl,
    onchangetab,
    onclose,
    onfocusboard,
    onfocuscomment,
    ontogglecomment,
    ondeletecomment,
    onclearresolved,
    onsendtoagent,
    oncancelagent,
    onresumeagent,
    onopenagentsettings,
    onopenlog,
  }: Props = $props();
</script>

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
    <button type="button" title="Collapse sidebar" class="ab-icon-btn" onclick={onclose}>
      <PanelLeftClose size={16} />
    </button>
  </div>

  <div class="ab-side-tabs">
    <button
      type="button"
      class="ab-side-tab"
      class:ab-side-tab-active={sidebarTab === 'boards'}
      onclick={() => {
        onchangetab('boards');
      }}
    >
      Boards ({boards.length})
    </button>
    <button
      type="button"
      class="ab-side-tab"
      class:ab-side-tab-active={sidebarTab === 'comments'}
      onclick={() => {
        onchangetab('comments');
      }}
    >
      {openCommentCount > 0 ? `Comments (${openCommentCount})` : 'Comments'}
    </button>
  </div>

  {#if sidebarTab === 'boards'}
    <BoardsTab
      {boards}
      {categories}
      {comments}
      {mountedIds}
      {highlightedBoardId}
      {showDebug}
      {onfocusboard}
    />
  {:else}
    <CommentsPanel
      {comments}
      {agentInfo}
      {onfocuscomment}
      {ontogglecomment}
      {ondeletecomment}
      {onclearresolved}
      {onsendtoagent}
      {oncancelagent}
      {onresumeagent}
      {onopenagentsettings}
      {onopenlog}
    />
  {/if}

  <div class="ab-sidebar-foot">
    <a href={appUrl} class="ab-back-link">
      <ArrowLeft size={14} />
      Back to Live App
    </a>
  </div>
</aside>

<style>
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

  @media (max-width: 767px) {
    .ab-sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 50;
      background: var(--ab-surface-solid);
      backdrop-filter: none;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
    }
  }
</style>
