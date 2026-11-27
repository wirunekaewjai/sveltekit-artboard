<script lang="ts">
  import { Bell, CheckCircle2, ShieldAlert, User } from '@lucide/svelte';

  import type { NavRouteId, NotificationSettings, UserProfile } from '#lib/types/domain.ts';

  import Avatar from '#lib/components/atoms/Avatar.svelte';
  import Button from '#lib/components/atoms/Button.svelte';
  import Input from '#lib/components/atoms/Input.svelte';
  import Toggle from '#lib/components/atoms/Toggle.svelte';
  import AppShell from '#lib/components/organisms/AppShell.svelte';
  import DeleteWorkspaceDialog from '#lib/components/organisms/DeleteWorkspaceDialog.svelte';

  export type SettingsTab = 'profile' | 'notifications' | 'danger';

  type Props = {
    activeTab: SettingsTab;
    profile: UserProfile;
    notifications: NotificationSettings;
    savedNotice?: boolean;
    deleteDialogOpen?: boolean;
    dialogContained?: boolean;
    deleteConfirmText?: string;
    darkMode?: boolean;
    ontabchange?: (tab: SettingsTab) => void;
    onprofilechange?: (patch: Partial<UserProfile>) => void;
    onnotificationchange?: (patch: Partial<NotificationSettings>) => void;
    onsave?: () => void;
    onopendelete?: () => void;
    onclosedelete?: () => void;
    ondeleteconfirmtextchange?: (value: string) => void;
    onconfirmdelete?: () => void;
    onnavigate?: (route: NavRouteId) => void;
    ontoggletheme?: () => void;
  };

  let {
    activeTab,
    profile,
    notifications,
    savedNotice = false,
    deleteDialogOpen = false,
    dialogContained = false,
    deleteConfirmText = '',
    darkMode = false,
    ontabchange,
    onprofilechange,
    onnotificationchange,
    onsave,
    onopendelete,
    onclosedelete,
    ondeleteconfirmtextchange,
    onconfirmdelete,
    onnavigate,
    ontoggletheme,
  }: Props = $props();

  const tabs: Array<{ id: SettingsTab; label: string; icon: typeof User }> = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Danger Zone', icon: ShieldAlert },
  ];
</script>

<div class="relative min-h-full w-full">
  <AppShell
    activeRoute="/settings"
    pageTitle="Workspace Settings"
    pageSubtitle="Configure your personal profile, notification preferences, and workspace controls."
    userName={profile.fullName}
    userRole={profile.role}
    workspaceName={profile.workspaceName}
    {darkMode}
    {onnavigate}
    {ontoggletheme}
  >
    <div class="max-w-3xl space-y-6">
      <!-- Tab Bar -->
      <div class="flex flex-wrap gap-1 border-b border-slate-200 pb-3 dark:border-zinc-800">
        {#each tabs as tab (tab.id)}
          {@const Icon = tab.icon}
          <button
            type="button"
            onclick={() => ontabchange?.(tab.id)}
            class="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors {activeTab ===
            tab.id
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}"
          >
            <Icon class="h-3.5 w-3.5" />
            {tab.label}
          </button>
        {/each}
      </div>

      {#if savedNotice}
        <div
          class="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          <CheckCircle2 class="h-4 w-4 shrink-0" />
          Changes saved to workspace settings.
        </div>
      {/if}

      {#if activeTab === 'profile'}
        <div
          class="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs @2xl:p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div class="flex items-center gap-4">
            <Avatar name={profile.fullName} color="bg-indigo-600" size="lg" />
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-zinc-50">
                {profile.fullName}
              </p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">{profile.role}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 @xl:grid-cols-2">
            <Input
              label="Full Name"
              value={profile.fullName}
              oninput={(fullName) => onprofilechange?.({ fullName })}
            />
            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              oninput={(email) => onprofilechange?.({ email })}
            />
            <Input
              label="Workspace Name"
              value={profile.workspaceName}
              oninput={(workspaceName) => onprofilechange?.({ workspaceName })}
            />
            <Input
              label="Timezone"
              value={profile.timezone}
              oninput={(timezone) => onprofilechange?.({ timezone })}
            />
          </div>

          <div class="flex justify-end border-t border-slate-100 pt-4 dark:border-zinc-800">
            <Button onclick={onsave}>Save Profile</Button>
          </div>
        </div>
      {:else if activeTab === 'notifications'}
        <div
          class="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs @2xl:p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Toggle
            label="Design Review Comments"
            description="Receive instant alerts when a reviewer pins an annotation on your artboards."
            checked={notifications.designReviews}
            onchange={(designReviews) => onnotificationchange?.({ designReviews })}
          />
          <div class="border-t border-slate-100 pt-4 dark:border-zinc-800">
            <Toggle
              label="Weekly Velocity Digest"
              description="Summary of completed components, tokens, and project progress every Monday."
              checked={notifications.weeklyDigest}
              onchange={(weeklyDigest) => onnotificationchange?.({ weeklyDigest })}
            />
          </div>
          <div class="border-t border-slate-100 pt-4 dark:border-zinc-800">
            <Toggle
              label="Production Build Alerts"
              description="Notify when a production build succeeds or detects bundle regressions."
              checked={notifications.deployAlerts}
              onchange={(deployAlerts) => onnotificationchange?.({ deployAlerts })}
            />
          </div>
          <div class="border-t border-slate-100 pt-4 dark:border-zinc-800">
            <Toggle
              label="Direct Mentions"
              description="Send an email whenever someone mentions your handle in a project thread."
              checked={notifications.mentionEmails}
              onchange={(mentionEmails) => onnotificationchange?.({ mentionEmails })}
            />
          </div>

          <div class="flex justify-end border-t border-slate-100 pt-4 dark:border-zinc-800">
            <Button onclick={onsave}>Save Preferences</Button>
          </div>
        </div>
      {:else}
        <div
          class="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 @2xl:p-6 dark:border-rose-500/30 dark:bg-rose-950/20"
        >
          <h3 class="text-sm font-semibold text-rose-800 dark:text-rose-300">
            Delete Workspace Permanently
          </h3>
          <p class="mt-1 text-xs leading-relaxed text-rose-700/90 dark:text-rose-300/80">
            Once deleted, all projects, design systems, and review logs under
            <strong>{profile.workspaceName}</strong> will be permanently removed and cannot be recovered.
          </p>
          <div class="mt-4">
            <Button variant="danger" size="sm" onclick={onopendelete}>Delete Workspace</Button>
          </div>
        </div>
      {/if}
    </div>
  </AppShell>

  <DeleteWorkspaceDialog
    open={deleteDialogOpen}
    contained={dialogContained}
    workspaceName={profile.workspaceName}
    confirmationInput={deleteConfirmText}
    onconfirmationchange={ondeleteconfirmtextchange}
    onclose={onclosedelete}
    onconfirm={onconfirmdelete}
  />
</div>
