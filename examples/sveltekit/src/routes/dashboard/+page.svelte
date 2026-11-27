<script lang="ts">
  import { goto } from '$app/navigation';

  import DashboardTemplate from '#lib/components/templates/DashboardTemplate.svelte';
  import { workspace } from '#lib/state/workspace.svelte.ts';
</script>

<DashboardTemplate
  metrics={workspace.metrics}
  revenueData={workspace.revenueData}
  activities={workspace.activities}
  period={workspace.dashboardPeriod}
  userName={workspace.profile.fullName}
  userRole={workspace.profile.role}
  workspaceName={workspace.profile.workspaceName}
  darkMode={workspace.darkMode}
  onperiodchange={(p) => (workspace.dashboardPeriod = p)}
  onexport={() => alert('Report exported as CSV (demo)')}
  onnavigate={(route) => goto(route)}
  ontoggletheme={() => workspace.toggleTheme()}
/>
