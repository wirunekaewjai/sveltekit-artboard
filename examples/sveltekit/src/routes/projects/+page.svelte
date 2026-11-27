<script lang="ts">
  import { goto } from '$app/navigation';

  import ProjectsTemplate from '#lib/components/templates/ProjectsTemplate.svelte';
  import { workspace } from '#lib/state/workspace.svelte.ts';

  let createDialogOpen = $state(false);
  let draftProjectName = $state('');
  let draftClientName = $state('');
  let draftCategory = $state('Design System');
  let draftError = $state<string | undefined>(undefined);

  function handleSubmitCreate() {
    if (!draftProjectName.trim()) {
      draftError = 'Please enter a project name.';
      return;
    }
    workspace.addProject(draftProjectName, draftClientName, draftCategory);
    draftProjectName = '';
    draftClientName = '';
    draftCategory = 'Design System';
    draftError = undefined;
    createDialogOpen = false;
  }
</script>

<ProjectsTemplate
  projects={workspace.filteredProjects}
  query={workspace.projectQuery}
  activeStatus={workspace.projectStatus}
  {createDialogOpen}
  {draftProjectName}
  {draftClientName}
  {draftCategory}
  {draftError}
  userName={workspace.profile.fullName}
  userRole={workspace.profile.role}
  workspaceName={workspace.profile.workspaceName}
  darkMode={workspace.darkMode}
  onquerychange={(q) => (workspace.projectQuery = q)}
  onstatuschange={(s) => (workspace.projectStatus = s)}
  onresetfilters={() => workspace.resetProjectFilters()}
  onopencreate={() => (createDialogOpen = true)}
  onclosecreate={() => {
    createDialogOpen = false;
    draftError = undefined;
  }}
  ondraftnamechange={(v) => {
    draftProjectName = v;
    if (draftError) draftError = undefined;
  }}
  ondraftclientchange={(v) => (draftClientName = v)}
  ondraftcategorychange={(v) => (draftCategory = v)}
  onsubmitcreate={handleSubmitCreate}
  onnavigate={(route) => goto(route)}
  ontoggletheme={() => workspace.toggleTheme()}
/>
