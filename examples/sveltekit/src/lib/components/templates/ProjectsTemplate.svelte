<script lang="ts">
  import type { NavRouteId, ProjectItem, ProjectStatus } from '#lib/types/domain.ts';

  import EmptyState from '#lib/components/molecules/EmptyState.svelte';
  import ProjectCard from '#lib/components/molecules/ProjectCard.svelte';
  import SearchFilterBar from '#lib/components/molecules/SearchFilterBar.svelte';
  import AppShell from '#lib/components/organisms/AppShell.svelte';
  import CreateProjectDialog from '#lib/components/organisms/CreateProjectDialog.svelte';

  type Props = {
    projects: ProjectItem[];
    query: string;
    activeStatus: ProjectStatus | 'all';
    loading?: boolean;
    createDialogOpen?: boolean;
    dialogContained?: boolean;
    draftProjectName?: string;
    draftClientName?: string;
    draftCategory?: string;
    draftError?: string;
    userName: string;
    userRole: string;
    workspaceName: string;
    darkMode?: boolean;
    onquerychange?: (value: string) => void;
    onstatuschange?: (status: ProjectStatus | 'all') => void;
    onresetfilters?: () => void;
    onselectproject?: (project: ProjectItem) => void;
    onopencreate?: () => void;
    onclosecreate?: () => void;
    ondraftnamechange?: (value: string) => void;
    ondraftclientchange?: (value: string) => void;
    ondraftcategorychange?: (value: string) => void;
    onsubmitcreate?: () => void;
    onnavigate?: (route: NavRouteId) => void;
    ontoggletheme?: () => void;
  };

  let {
    projects,
    query,
    activeStatus,
    loading = false,
    createDialogOpen = false,
    dialogContained = false,
    draftProjectName = '',
    draftClientName = '',
    draftCategory = 'Design System',
    draftError,
    userName,
    userRole,
    workspaceName,
    darkMode = false,
    onquerychange,
    onstatuschange,
    onresetfilters,
    onselectproject,
    onopencreate,
    onclosecreate,
    ondraftnamechange,
    ondraftclientchange,
    ondraftcategorychange,
    onsubmitcreate,
    onnavigate,
    ontoggletheme,
  }: Props = $props();
</script>

<div class="relative min-h-full w-full">
  <AppShell
    activeRoute="/projects"
    pageTitle="Projects Catalog"
    pageSubtitle="Manage active design systems, UI reviews, and handoff milestones."
    {userName}
    {userRole}
    {workspaceName}
    {darkMode}
    {onnavigate}
    {ontoggletheme}
  >
    <div class="space-y-6">
      <SearchFilterBar
        {query}
        {activeStatus}
        {onquerychange}
        {onstatuschange}
        oncreate={onopencreate}
      />

      {#if loading}
        <div class="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {#each [1, 2, 3] as n (n)}
            <div
              class="h-48 animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div class="h-3 w-20 rounded bg-slate-200 dark:bg-zinc-800"></div>
              <div class="mt-3 h-5 w-40 rounded bg-slate-200 dark:bg-zinc-800"></div>
              <div class="mt-2 h-3 w-28 rounded bg-slate-100 dark:bg-zinc-800/70"></div>
              <div class="mt-8 h-2 w-full rounded bg-slate-100 dark:bg-zinc-800/70"></div>
            </div>
          {/each}
        </div>
      {:else if projects.length === 0}
        <EmptyState
          title="No matching projects"
          description="Try clearing your search query or switching to a different status filter."
          actionLabel="Reset Filters"
          onaction={onresetfilters}
        />
      {:else}
        <div class="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {#each projects as project (project.id)}
            <ProjectCard {project} onselect={onselectproject} />
          {/each}
        </div>
      {/if}
    </div>
  </AppShell>

  <CreateProjectDialog
    open={createDialogOpen}
    contained={dialogContained}
    projectName={draftProjectName}
    clientName={draftClientName}
    category={draftCategory}
    errorMessage={draftError}
    onnamechange={ondraftnamechange}
    onclientchange={ondraftclientchange}
    oncategorychange={ondraftcategorychange}
    onclose={onclosecreate}
    onsubmit={onsubmitcreate}
  />
</div>
