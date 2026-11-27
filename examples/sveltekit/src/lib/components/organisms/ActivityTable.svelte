<script lang="ts">
  import type { ActivityItem } from '#lib/types/domain.ts';

  import Avatar from '#lib/components/atoms/Avatar.svelte';
  import Badge from '#lib/components/atoms/Badge.svelte';

  type Props = {
    items: ActivityItem[];
  };

  let { items }: Props = $props();

  const statusTone: Record<ActivityItem['status'], 'emerald' | 'amber' | 'rose'> = {
    completed: 'emerald',
    pending: 'amber',
    warning: 'rose',
  };
</script>

<div
  class="@container overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
>
  <div class="border-b border-slate-100 px-5 py-4 dark:border-zinc-800">
    <h2 class="text-sm font-semibold text-slate-900 dark:text-zinc-50">
      Recent Workspace Activity
    </h2>
    <p class="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
      Latest design reviews, handoffs, and deployments
    </p>
  </div>

  <!-- Table View (@2xl = 672px+) -->
  <div class="hidden @2xl:block">
    <table class="w-full text-left text-xs">
      <thead
        class="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400"
      >
        <tr>
          <th class="px-5 py-2.5 font-medium">Member</th>
          <th class="px-5 py-2.5 font-medium">Activity</th>
          <th class="px-5 py-2.5 font-medium">Status</th>
          <th class="px-5 py-2.5 text-right font-medium">When</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
        {#each items as item (item.id)}
          <tr class="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
            <td class="px-5 py-3">
              <div class="flex items-center gap-2.5">
                <Avatar name={item.actor} color={item.actorColor} size="sm" />
                <span class="font-medium text-slate-900 dark:text-zinc-100">{item.actor}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-slate-600 dark:text-zinc-300">
              {item.action}
              <span class="font-medium text-slate-900 dark:text-zinc-100">{item.target}</span>
            </td>
            <td class="px-5 py-3">
              <Badge tone={statusTone[item.status]} dot>{item.status}</Badge>
            </td>
            <td class="px-5 py-3 text-right text-slate-500 dark:text-zinc-400">
              {item.timestamp}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Compact Card Stack (< @2xl) -->
  <div class="divide-y divide-slate-100 @2xl:hidden dark:divide-zinc-800">
    {#each items as item (item.id)}
      <div class="flex items-start gap-3 px-4 py-3.5">
        <Avatar name={item.actor} color={item.actorColor} size="sm" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <p class="truncate text-xs font-semibold text-slate-900 dark:text-zinc-100">
              {item.actor}
            </p>
            <Badge tone={statusTone[item.status]}>{item.status}</Badge>
          </div>
          <p class="mt-0.5 text-xs text-slate-600 dark:text-zinc-300">
            {item.action} <span class="font-medium">{item.target}</span>
          </p>
          <p class="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">{item.timestamp}</p>
        </div>
      </div>
    {/each}
  </div>
</div>
