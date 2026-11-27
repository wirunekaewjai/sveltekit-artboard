<script lang="ts">
  import type { Snippet } from 'svelte';

  import {
    FolderKanban,
    LayoutDashboard,
    Menu,
    Moon,
    Settings,
    Sparkles,
    Sun,
    X,
  } from '@lucide/svelte';

  import type { NavRouteId } from '#lib/types/domain.ts';

  import Avatar from '#lib/components/atoms/Avatar.svelte';

  type Props = {
    activeRoute: NavRouteId;
    pageTitle: string;
    pageSubtitle?: string;
    userName: string;
    userRole: string;
    workspaceName: string;
    darkMode?: boolean;
    onnavigate?: (route: NavRouteId) => void;
    ontoggletheme?: () => void;
    headerAction?: Snippet;
    children: Snippet;
  };

  let {
    activeRoute,
    pageTitle,
    pageSubtitle,
    userName,
    userRole,
    workspaceName,
    darkMode = false,
    onnavigate,
    ontoggletheme,
    headerAction,
    children,
  }: Props = $props();

  let mobileMenuOpen = $state(false);

  const navItems: Array<{ id: NavRouteId; label: string; icon: typeof LayoutDashboard }> = [
    { id: '/', label: 'Landing', icon: Sparkles },
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/projects', label: 'Projects', icon: FolderKanban },
    { id: '/settings', label: 'Settings', icon: Settings },
  ];

  function handleNav(route: NavRouteId) {
    mobileMenuOpen = false;
    onnavigate?.(route);
  }
</script>

<div class="@container relative min-h-screen w-full">
  <div
    class="flex min-h-screen w-full flex-col bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 @5xl:flex-row"
  >
    <!-- Desktop Sidebar (@5xl = 1024px+) -->
    <aside
      class="hidden w-60 shrink-0 flex-col justify-between border-r border-slate-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 @5xl:flex"
    >
      <div>
        <div class="flex items-center gap-2.5 px-2 py-1">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm"
          >
            VS
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              {workspaceName}
            </p>
            <p class="text-[11px] text-slate-500 dark:text-zinc-400">Pro Workspace</p>
          </div>
        </div>

        <nav class="mt-6 space-y-1" aria-label="Workspace navigation">
          {#each navItems as item (item.id)}
            {@const Icon = item.icon}
            <button
              type="button"
              onclick={() => handleNav(item.id)}
              class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors {activeRoute ===
              item.id
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'}"
            >
              <Icon class="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          {/each}
        </nav>
      </div>

      <div class="space-y-3 border-t border-slate-100 pt-4 dark:border-zinc-800">
        {#if ontoggletheme}
          <button
            type="button"
            onclick={ontoggletheme}
            class="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span>{darkMode ? 'Dark Theme' : 'Light Theme'}</span>
            {#if darkMode}
              <Moon class="h-3.5 w-3.5 text-indigo-400" />
            {:else}
              <Sun class="h-3.5 w-3.5 text-amber-500" />
            {/if}
          </button>
        {/if}

        <div class="flex items-center gap-2.5 px-1">
          <Avatar name={userName} color="bg-indigo-600" size="sm" />
          <div class="min-w-0">
            <p class="truncate text-xs font-semibold text-slate-900 dark:text-zinc-100">
              {userName}
            </p>
            <p class="truncate text-[11px] text-slate-500 dark:text-zinc-400">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile / Tablet Topbar (< @5xl) -->
    <header
      class="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 @5xl:hidden"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-[11px] font-bold text-white"
        >
          VS
        </div>
        <span class="text-sm font-bold text-slate-900 dark:text-zinc-50">{workspaceName}</span>
      </div>

      <div class="flex items-center gap-1.5">
        {#if ontoggletheme}
          <button
            type="button"
            onclick={ontoggletheme}
            aria-label="Toggle theme"
            class="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {#if darkMode}
              <Moon class="h-4 w-4" />
            {:else}
              <Sun class="h-4 w-4" />
            {/if}
          </button>
        {/if}
        <button
          type="button"
          onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
          aria-label="Toggle menu"
          class="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {#if mobileMenuOpen}
            <X class="h-4 w-4" />
          {:else}
            <Menu class="h-4 w-4" />
          {/if}
        </button>
      </div>
    </header>

    {#if mobileMenuOpen}
      <nav
        class="border-b border-slate-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900 @5xl:hidden"
      >
        <div class="flex flex-wrap gap-1">
          {#each navItems as item (item.id)}
            {@const Icon = item.icon}
            <button
              type="button"
              onclick={() => handleNav(item.id)}
              class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium {activeRoute ===
              item.id
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                : 'text-slate-600 dark:text-zinc-400'}"
            >
              <Icon class="h-3.5 w-3.5" />
              {item.label}
            </button>
          {/each}
        </div>
      </nav>
    {/if}

    <!-- Main Content -->
    <main class="min-w-0 flex-1 p-4 @2xl:p-6 @5xl:p-8">
      <div class="mb-6 flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between">
        <div>
          <h1
            class="text-xl font-bold tracking-tight text-slate-900 @2xl:text-2xl dark:text-zinc-50"
          >
            {pageTitle}
          </h1>
          {#if pageSubtitle}
            <p class="mt-0.5 text-xs text-slate-500 @2xl:text-sm dark:text-zinc-400">
              {pageSubtitle}
            </p>
          {/if}
        </div>
        {#if headerAction}
          <div class="shrink-0">{@render headerAction()}</div>
        {/if}
      </div>

      {@render children()}
    </main>
  </div>
</div>
