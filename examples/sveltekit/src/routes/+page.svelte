<script lang="ts">
  import { goto } from '$app/navigation';

  import LandingTemplate from '#lib/components/templates/LandingTemplate.svelte';
  import { PRICING_TIERS, workspace } from '#lib/state/workspace.svelte.ts';
</script>

<LandingTemplate
  pricingTiers={PRICING_TIERS}
  darkMode={workspace.darkMode}
  onnavigate={(route) => goto(route)}
  ontoggletheme={() => workspace.toggleTheme()}
  onselecttier={() => goto('/dashboard')}
/>
