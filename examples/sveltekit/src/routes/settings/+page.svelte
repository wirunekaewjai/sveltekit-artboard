<script lang="ts">
  import { goto } from '$app/navigation';

  import type { SettingsTab } from '#lib/components/templates/SettingsTemplate.svelte';

  import SettingsTemplate from '#lib/components/templates/SettingsTemplate.svelte';
  import { workspace } from '#lib/state/workspace.svelte.ts';

  let activeTab = $state<SettingsTab>('profile');
  let savedNotice = $state(false);
  let deleteDialogOpen = $state(false);
  let deleteConfirmText = $state('');

  function handleSave() {
    savedNotice = true;
    setTimeout(() => {
      savedNotice = false;
    }, 2500);
  }

  function handleConfirmDelete() {
    deleteDialogOpen = false;
    deleteConfirmText = '';
    goto('/');
  }
</script>

<SettingsTemplate
  {activeTab}
  profile={workspace.profile}
  notifications={workspace.notifications}
  {savedNotice}
  {deleteDialogOpen}
  {deleteConfirmText}
  darkMode={workspace.darkMode}
  ontabchange={(tab) => (activeTab = tab)}
  onprofilechange={(patch) => workspace.updateProfile(patch)}
  onnotificationchange={(patch) => workspace.updateNotifications(patch)}
  onsave={handleSave}
  onopendelete={() => (deleteDialogOpen = true)}
  onclosedelete={() => {
    deleteDialogOpen = false;
    deleteConfirmText = '';
  }}
  ondeleteconfirmtextchange={(v) => (deleteConfirmText = v)}
  onconfirmdelete={handleConfirmDelete}
  onnavigate={(route) => goto(route)}
  ontoggletheme={() => workspace.toggleTheme()}
/>
