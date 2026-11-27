<script lang="ts">
  import { Download } from '@lucide/svelte';

  import type { ActivityItem, MetricItem, NavRouteId, RevenuePoint } from '#lib/types/domain.ts';

  import Button from '#lib/components/atoms/Button.svelte';
  import MetricCard from '#lib/components/molecules/MetricCard.svelte';
  import ActivityTable from '#lib/components/organisms/ActivityTable.svelte';
  import AppShell from '#lib/components/organisms/AppShell.svelte';
  import RevenueChart from '#lib/components/organisms/RevenueChart.svelte';

  type Props = {
    metrics: MetricItem[];
    revenueData: RevenuePoint[];
    activities: ActivityItem[];
    period?: '6m' | '12m';
    userName: string;
    userRole: string;
    workspaceName: string;
    darkMode?: boolean;
    onperiodchange?: (period: '6m' | '12m') => void;
    onexport?: () => void;
    onnavigate?: (route: NavRouteId) => void;
    ontoggletheme?: () => void;
  };

  let {
    metrics,
    revenueData,
    activities,
    period = '6m',
    userName,
    userRole,
    workspaceName,
    darkMode = false,
    onperiodchange,
    onexport,
    onnavigate,
    ontoggletheme,
  }: Props = $props();
</script>

<AppShell
  activeRoute="/dashboard"
  pageTitle="Analytics Dashboard"
  pageSubtitle="Real-time overview of design velocity, component adoption, and revenue."
  {userName}
  {userRole}
  {workspaceName}
  {darkMode}
  {onnavigate}
  {ontoggletheme}
>
  {#snippet headerAction()}
    <Button variant="secondary" size="sm" onclick={onexport}>
      <Download class="h-3.5 w-3.5" />
      Export Report
    </Button>
  {/snippet}

  <div class="space-y-6">
    <!-- KPI Grid adapts via container queries -->
    <div class="grid grid-cols-1 gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
      {#each metrics as metric (metric.id)}
        <MetricCard {metric} />
      {/each}
    </div>

    <!-- Chart + Activity -->
    <div class="grid grid-cols-1 gap-6 @5xl:grid-cols-5">
      <div class="@5xl:col-span-3">
        <RevenueChart data={revenueData} {period} {onperiodchange} />
      </div>
      <div class="@5xl:col-span-2">
        <ActivityTable items={activities} />
      </div>
    </div>
  </div>
</AppShell>
