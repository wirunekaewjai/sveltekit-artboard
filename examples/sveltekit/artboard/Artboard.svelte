<script lang="ts">
  import type {
    ArtboardRenderContext,
    ArtboardTheme,
    ArtboardViewport,
  } from 'sveltekit-artboard/studio';

  import { Artboard, defineArtboards } from 'sveltekit-artboard/studio';

  import type { ProjectStatus } from '#lib/types/domain.ts';

  import Avatar from '#lib/components/atoms/Avatar.svelte';
  import Badge from '#lib/components/atoms/Badge.svelte';
  import Button from '#lib/components/atoms/Button.svelte';
  import Input from '#lib/components/atoms/Input.svelte';
  import ProgressBar from '#lib/components/atoms/ProgressBar.svelte';
  import Toggle from '#lib/components/atoms/Toggle.svelte';
  import EmptyState from '#lib/components/molecules/EmptyState.svelte';
  import MetricCard from '#lib/components/molecules/MetricCard.svelte';
  import PricingCard from '#lib/components/molecules/PricingCard.svelte';
  import ProjectCard from '#lib/components/molecules/ProjectCard.svelte';
  import SearchFilterBar from '#lib/components/molecules/SearchFilterBar.svelte';
  import ActivityTable from '#lib/components/organisms/ActivityTable.svelte';
  import CreateProjectDialog from '#lib/components/organisms/CreateProjectDialog.svelte';
  import DeleteWorkspaceDialog from '#lib/components/organisms/DeleteWorkspaceDialog.svelte';
  import RevenueChart from '#lib/components/organisms/RevenueChart.svelte';
  import DashboardTemplate from '#lib/components/templates/DashboardTemplate.svelte';
  import LandingTemplate from '#lib/components/templates/LandingTemplate.svelte';
  import ProjectsTemplate from '#lib/components/templates/ProjectsTemplate.svelte';
  import SettingsTemplate from '#lib/components/templates/SettingsTemplate.svelte';

  import {
    FIXTURE_ACTIVITIES,
    FIXTURE_METRICS,
    FIXTURE_NOTIFICATIONS,
    FIXTURE_PRICING,
    FIXTURE_PROFILE,
    FIXTURE_PROJECTS,
    FIXTURE_REVENUE,
  } from './fixtures.ts';

  // Reusable app-specific viewport sizes
  const MOBILE: Readonly<ArtboardViewport> = { label: 'Mobile', width: 375, height: 820 };
  const TABLET: Readonly<ArtboardViewport> = { label: 'Tablet', width: 768, height: 820 };
  const DESKTOP: Readonly<ArtboardViewport> = { label: 'Desktop', width: 1280, height: 820 };
  const DESKTOP_COMPACT: Readonly<ArtboardViewport> = {
    label: 'Desktop',
    width: 1080,
    height: 700,
  };

  // Optional custom themes supported by this app (omit `themes` prop if your app has no themes)
  const APP_THEMES: ArtboardTheme[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark', class: 'dark' },
  ];

  // Lightweight interactive state for atom/molecule playgrounds
  let demoToggleA = $state(true);
  let demoToggleB = $state(false);
  let demoSearch = $state('');
  let demoStatus = $state<ProjectStatus | 'all'>('all');
  let demoPeriod = $state<'6m' | '12m'>('6m');

  const sections = $derived.by(() => {
    return defineArtboards([
      {
        id: 'sec-atoms',
        title: '01 / Atoms',
        subtitle: 'Core primitive UI building blocks — stateless, theme-aware, and composable',
        category: 'atoms',
        boards: [
          {
            id: 'atom-buttons',
            title: 'Buttons Matrix',
            viewport: { width: 440, height: 320 },
            render: buttonsBoard,
          },
          {
            id: 'atom-badges',
            title: 'Badges & Status Dots',
            viewport: { width: 380, height: 260 },
            render: badgesBoard,
          },
          {
            id: 'atom-inputs',
            title: 'Text Inputs & States',
            viewport: { width: 400, height: 340 },
            render: inputsBoard,
          },
          {
            id: 'atom-toggles',
            title: 'Switch Toggles',
            viewport: { width: 400, height: 280 },
            render: togglesBoard,
          },
          {
            id: 'atom-avatars',
            title: 'Avatars & Progress Bars',
            viewport: { width: 400, height: 300 },
            render: avatarsBoard,
          },
        ],
      },
      {
        id: 'sec-molecules',
        title: '02 / Molecules',
        subtitle: 'Composite patterns adapting via CSS Container Queries (@container)',
        category: 'molecules',
        boards: [
          {
            id: 'mol-metrics',
            title: 'KPI Metric Cards',
            viewport: { width: 620, height: 290 },
            render: metricsBoard,
          },
          {
            id: 'mol-search-mobile',
            title: 'SearchFilterBar — Mobile',
            viewport: { ...MOBILE, height: 200 },
            render: searchFilterBoard,
          },
          {
            id: 'mol-search-desktop',
            title: 'SearchFilterBar — Wide',
            viewport: { label: 'Wide', width: 840, height: 120 },
            render: searchFilterBoard,
          },
          {
            id: 'mol-project-card',
            title: 'Project Card',
            viewport: { width: 380, height: 290 },
            render: projectCardBoard,
          },
          {
            id: 'mol-pricing',
            title: 'Pricing Card (Highlighted)',
            viewport: { width: 360, height: 410 },
            render: pricingCardBoard,
          },
          {
            id: 'mol-empty',
            title: 'Empty State',
            viewport: { width: 440, height: 290 },
            render: emptyStateBoard,
          },
        ],
      },
      {
        id: 'sec-organisms-dialogs',
        title: '03 / Organisms & Dialogs',
        subtitle: 'Complex data views and contained modal dialogs for isolated review',
        category: 'dialogs',
        boards: [
          {
            id: 'org-chart',
            title: 'RevenueChart — Compact',
            viewport: { width: 480, height: 360 },
            render: revenueChartBoard,
          },
          {
            id: 'org-activity-mobile',
            title: 'ActivityTable — Mobile Stack',
            viewport: { ...MOBILE, height: 380 },
            render: activityTableBoard,
          },
          {
            id: 'org-activity-desktop',
            title: 'ActivityTable — Table View',
            viewport: { label: 'Desktop', width: 760, height: 340 },
            render: activityTableBoard,
          },
          {
            id: 'dlg-create-default',
            title: 'CreateProjectDialog — Default',
            viewport: { width: 540, height: 480 },
            render: createDialogDefaultBoard,
          },
          {
            id: 'dlg-create-error',
            title: 'CreateProjectDialog — Validation Error',
            viewport: { width: 540, height: 480 },
            render: createDialogErrorBoard,
          },
          {
            id: 'dlg-delete',
            title: 'DeleteWorkspaceDialog — Confirm',
            viewport: { width: 500, height: 420 },
            render: deleteDialogBoard,
          },
        ],
      },
      {
        id: 'sec-page-landing',
        title: '04 / Page 1 — Marketing Landing',
        subtitle: 'Side-by-side responsive artboards across Mobile, Tablet, and Desktop',
        category: 'templates',
        boards: [
          {
            id: 'tpl-landing-mobile',
            title: 'Landing — Mobile',
            viewport: MOBILE,
            render: landingBoard,
          },
          {
            id: 'tpl-landing-tablet',
            title: 'Landing — Tablet',
            viewport: TABLET,
            render: landingBoard,
          },
          {
            id: 'tpl-landing-desktop',
            title: 'Landing — Desktop',
            viewport: { ...DESKTOP, height: 860 },
            render: landingBoard,
          },
          {
            id: 'tpl-landing-dark',
            title: 'Landing — Desktop (Dark)',
            viewport: { ...DESKTOP, height: 860 },
            defaultTheme: 'dark',
            render: landingBoard,
          },
        ],
      },
      {
        id: 'sec-page-dashboard',
        title: '05 / Page 2 — Analytics Dashboard',
        subtitle: 'AppShell switches from topbar to full sidebar at @5xl (1024px+)',
        category: 'templates',
        boards: [
          {
            id: 'tpl-dash-mobile',
            title: 'Dashboard — Mobile',
            viewport: MOBILE,
            render: dashboardBoard,
          },
          {
            id: 'tpl-dash-tablet',
            title: 'Dashboard — Tablet',
            viewport: TABLET,
            render: dashboardBoard,
          },
          {
            id: 'tpl-dash-desktop',
            title: 'Dashboard — Desktop',
            viewport: DESKTOP,
            render: dashboardBoard,
          },
        ],
      },
      {
        id: 'sec-page-projects',
        title: '06 / Page 3 — Projects Catalog & States',
        subtitle: 'Responsive breakpoints plus Empty, Loading, and Dialog-open review states',
        category: 'templates',
        boards: [
          {
            id: 'tpl-proj-mobile',
            title: 'Projects — Mobile',
            viewport: { ...MOBILE, height: 800 },
            render: projectsDefaultBoard,
          },
          {
            id: 'tpl-proj-desktop',
            title: 'Projects — Desktop',
            viewport: { ...DESKTOP, height: 760 },
            render: projectsDefaultBoard,
          },
          {
            id: 'tpl-proj-empty',
            title: 'Projects — Empty State',
            viewport: DESKTOP_COMPACT,
            render: projectsEmptyBoard,
          },
          {
            id: 'tpl-proj-loading',
            title: 'Projects — Loading Skeleton',
            viewport: DESKTOP_COMPACT,
            render: projectsLoadingBoard,
          },
          {
            id: 'tpl-proj-dialog',
            title: 'Projects — Create Dialog Open',
            viewport: { ...DESKTOP_COMPACT, height: 720 },
            render: projectsDialogBoard,
          },
        ],
      },
      {
        id: 'sec-page-settings',
        title: '07 / Page 4 — Workspace Settings',
        subtitle: 'Profile, Notifications, and Danger Zone with contained Delete Dialog',
        category: 'templates',
        boards: [
          {
            id: 'tpl-set-mobile',
            title: 'Settings — Mobile Profile',
            viewport: { ...MOBILE, height: 760 },
            render: settingsProfileBoard,
          },
          {
            id: 'tpl-set-notif',
            title: 'Settings — Notifications Tab',
            viewport: { ...DESKTOP_COMPACT, width: 1120, height: 720 },
            render: settingsNotifBoard,
          },
          {
            id: 'tpl-set-delete-dialog',
            title: 'Settings — Delete Dialog Open',
            viewport: { ...DESKTOP_COMPACT, width: 1120, height: 720 },
            render: settingsDeleteDialogBoard,
          },
        ],
      },
    ]);
  });
</script>

<!-- ── Atom Snippets ──────────────────────────────────────────────────────── -->

{#snippet buttonsBoard()}
  <div class="flex h-full flex-col justify-center gap-4 bg-white p-6 dark:bg-zinc-950">
    <div class="flex flex-wrap items-center gap-2.5">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
    <div class="flex flex-wrap items-center gap-2.5">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
    <div class="flex flex-wrap items-center gap-2.5">
      <Button loading>Saving...</Button>
      <Button variant="secondary" disabled>Disabled</Button>
    </div>
  </div>
{/snippet}

{#snippet badgesBoard()}
  <div class="flex h-full flex-col justify-center gap-4 bg-white p-6 dark:bg-zinc-950">
    <div class="flex flex-wrap gap-2">
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="indigo">Active</Badge>
      <Badge tone="emerald">Approved</Badge>
      <Badge tone="amber">In Review</Badge>
      <Badge tone="rose">Blocked</Badge>
    </div>
    <div class="flex flex-wrap gap-2">
      <Badge tone="indigo" dot>Live Sync</Badge>
      <Badge tone="emerald" dot>Passed</Badge>
      <Badge tone="amber" dot>Pending</Badge>
      <Badge tone="rose" dot>Failed</Badge>
    </div>
  </div>
{/snippet}

{#snippet inputsBoard()}
  <div class="flex h-full flex-col justify-center gap-4 bg-white p-6 dark:bg-zinc-950">
    <Input label="Workspace Name" value="Veloce Studio" hint="Shown in your sidebar and URLs." />
    <Input
      label="Project Slug"
      value="invalid slug!"
      error="Slug may only contain lowercase letters and hyphens."
    />
    <Input label="Read-only Token" value="vs_live_9821a0f" disabled />
  </div>
{/snippet}

{#snippet togglesBoard()}
  <div class="flex h-full flex-col justify-center gap-5 bg-white p-6 dark:bg-zinc-950">
    <Toggle
      label="Design Review Alerts"
      description="Notify team members when comments are pinned."
      checked={demoToggleA}
      onchange={(v) => {
        demoToggleA = v;
      }}
    />
    <Toggle
      label="Auto-Publish Tokens"
      description="Push updated tokens to staging automatically."
      checked={demoToggleB}
      onchange={(v) => {
        demoToggleB = v;
      }}
    />
    <Toggle label="Locked Enterprise Policy" checked={true} disabled />
  </div>
{/snippet}

{#snippet avatarsBoard()}
  <div class="flex h-full flex-col justify-center gap-6 bg-white p-6 dark:bg-zinc-950">
    <div class="flex items-center gap-3">
      <Avatar name="Nicha Tan" color="bg-indigo-600" size="sm" />
      <Avatar name="Korn Chai" color="bg-emerald-600" size="md" />
      <Avatar name="Pim Srisai" color="bg-rose-600" size="lg" />
      <div class="ml-4 flex -space-x-2">
        <Avatar name="Nicha Tan" color="bg-indigo-600" size="sm" />
        <Avatar name="Mina Park" color="bg-amber-600" size="sm" />
        <Avatar name="Alex Rivera" color="bg-sky-600" size="sm" />
      </div>
    </div>
    <div class="space-y-3">
      <ProgressBar value={78} tone="indigo" showLabel />
      <ProgressBar value={100} tone="emerald" showLabel />
      <ProgressBar value={42} tone="amber" showLabel />
    </div>
  </div>
{/snippet}

<!-- ── Molecule & Organism Snippets ───────────────────────────────────────── -->

{#snippet metricsBoard()}
  <div class="grid h-full grid-cols-2 items-center gap-4 bg-slate-50 p-5 dark:bg-zinc-950">
    <MetricCard metric={FIXTURE_METRICS[0]} />
    <MetricCard metric={FIXTURE_METRICS[3]} />
  </div>
{/snippet}

{#snippet searchFilterBoard()}
  <div class="flex h-full items-center bg-slate-50 p-4 dark:bg-zinc-950">
    <div class="w-full">
      <SearchFilterBar
        query={demoSearch}
        activeStatus={demoStatus}
        onquerychange={(v) => {
          demoSearch = v;
        }}
        onstatuschange={(s) => {
          demoStatus = s;
        }}
        oncreate={() => {}}
      />
    </div>
  </div>
{/snippet}

{#snippet projectCardBoard()}
  <div class="flex h-full items-center justify-center bg-slate-50 p-5 dark:bg-zinc-950">
    <ProjectCard project={FIXTURE_PROJECTS[0]} />
  </div>
{/snippet}

{#snippet pricingCardBoard()}
  <div class="flex h-full items-center justify-center bg-slate-50 p-5 dark:bg-zinc-950">
    <div class="w-full">
      <PricingCard tier={FIXTURE_PRICING[1]} />
    </div>
  </div>
{/snippet}

{#snippet emptyStateBoard()}
  <div class="flex h-full items-center justify-center bg-white p-5 dark:bg-zinc-950">
    <div class="w-full">
      <EmptyState
        title="No matching projects"
        description="Try clearing your search query or switching to a different status filter."
        actionLabel="Reset Filters"
        onaction={() => {}}
      />
    </div>
  </div>
{/snippet}

{#snippet revenueChartBoard()}
  <div class="flex h-full items-center bg-slate-50 p-4 dark:bg-zinc-950">
    <div class="w-full">
      <RevenueChart
        data={FIXTURE_REVENUE}
        period={demoPeriod}
        onperiodchange={(p) => {
          demoPeriod = p;
        }}
      />
    </div>
  </div>
{/snippet}

{#snippet activityTableBoard()}
  <div class="h-full bg-slate-50 p-4 dark:bg-zinc-950">
    <ActivityTable items={FIXTURE_ACTIVITIES} />
  </div>
{/snippet}

{#snippet createDialogDefaultBoard()}
  <div class="relative h-full w-full bg-slate-100 dark:bg-zinc-950">
    <CreateProjectDialog
      open={true}
      contained={true}
      projectName="Design Tokens v3"
      clientName="Core Platform"
      onclose={() => {}}
      onsubmit={() => {}}
    />
  </div>
{/snippet}

{#snippet createDialogErrorBoard()}
  <div class="relative h-full w-full bg-slate-100 dark:bg-zinc-950">
    <CreateProjectDialog
      open={true}
      contained={true}
      projectName=""
      errorMessage="Project name is required."
      onclose={() => {}}
      onsubmit={() => {}}
    />
  </div>
{/snippet}

{#snippet deleteDialogBoard()}
  <div class="relative h-full w-full bg-slate-100 dark:bg-zinc-950">
    <DeleteWorkspaceDialog
      open={true}
      contained={true}
      workspaceName={FIXTURE_PROFILE.workspaceName}
      confirmationInput="Veloce Studio"
      onclose={() => {}}
      onconfirm={() => {}}
    />
  </div>
{/snippet}

<!-- ── Page Template Snippets ─────────────────────────────────────────────── -->

{#snippet landingBoard(ctx: ArtboardRenderContext)}
  <LandingTemplate pricingTiers={FIXTURE_PRICING} darkMode={ctx.theme?.id === 'dark'} />
{/snippet}

{#snippet dashboardBoard(ctx: ArtboardRenderContext)}
  <DashboardTemplate
    metrics={FIXTURE_METRICS}
    revenueData={FIXTURE_REVENUE}
    activities={FIXTURE_ACTIVITIES}
    userName={FIXTURE_PROFILE.fullName}
    userRole={FIXTURE_PROFILE.role}
    workspaceName={FIXTURE_PROFILE.workspaceName}
    darkMode={ctx.theme?.id === 'dark'}
  />
{/snippet}

{#snippet projectsDefaultBoard(ctx: ArtboardRenderContext)}
  <ProjectsTemplate
    projects={FIXTURE_PROJECTS}
    query=""
    activeStatus="all"
    userName={FIXTURE_PROFILE.fullName}
    userRole={FIXTURE_PROFILE.role}
    workspaceName={FIXTURE_PROFILE.workspaceName}
    darkMode={ctx.theme?.id === 'dark'}
  />
{/snippet}

{#snippet projectsEmptyBoard(ctx: ArtboardRenderContext)}
  <ProjectsTemplate
    projects={[]}
    query="nonexistent"
    activeStatus="review"
    userName={FIXTURE_PROFILE.fullName}
    userRole={FIXTURE_PROFILE.role}
    workspaceName={FIXTURE_PROFILE.workspaceName}
    darkMode={ctx.theme?.id === 'dark'}
  />
{/snippet}

{#snippet projectsLoadingBoard(ctx: ArtboardRenderContext)}
  <ProjectsTemplate
    projects={[]}
    query=""
    activeStatus="all"
    loading={true}
    userName={FIXTURE_PROFILE.fullName}
    userRole={FIXTURE_PROFILE.role}
    workspaceName={FIXTURE_PROFILE.workspaceName}
    darkMode={ctx.theme?.id === 'dark'}
  />
{/snippet}

{#snippet projectsDialogBoard(ctx: ArtboardRenderContext)}
  <ProjectsTemplate
    projects={FIXTURE_PROJECTS}
    query=""
    activeStatus="all"
    createDialogOpen={true}
    dialogContained={true}
    draftProjectName="Mobile Checkout v2"
    draftClientName="Commerce Squad"
    userName={FIXTURE_PROFILE.fullName}
    userRole={FIXTURE_PROFILE.role}
    workspaceName={FIXTURE_PROFILE.workspaceName}
    darkMode={ctx.theme?.id === 'dark'}
  />
{/snippet}

{#snippet settingsProfileBoard(ctx: ArtboardRenderContext)}
  <SettingsTemplate
    activeTab="profile"
    profile={FIXTURE_PROFILE}
    notifications={FIXTURE_NOTIFICATIONS}
    darkMode={ctx.theme?.id === 'dark'}
  />
{/snippet}

{#snippet settingsNotifBoard(ctx: ArtboardRenderContext)}
  <SettingsTemplate
    activeTab="notifications"
    profile={FIXTURE_PROFILE}
    notifications={FIXTURE_NOTIFICATIONS}
    savedNotice={true}
    darkMode={ctx.theme?.id === 'dark'}
  />
{/snippet}

{#snippet settingsDeleteDialogBoard(ctx: ArtboardRenderContext)}
  <SettingsTemplate
    activeTab="danger"
    profile={FIXTURE_PROFILE}
    notifications={FIXTURE_NOTIFICATIONS}
    deleteDialogOpen={true}
    dialogContained={true}
    deleteConfirmText="Veloce Studio"
    darkMode={ctx.theme?.id === 'dark'}
  />
{/snippet}

<Artboard {sections} themes={APP_THEMES} />
