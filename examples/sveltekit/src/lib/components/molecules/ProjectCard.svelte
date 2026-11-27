<script lang="ts">
  import { Calendar } from '@lucide/svelte';

  import type { ProjectItem, ProjectStatus } from '#lib/types/domain.ts';

  import Avatar from '#lib/components/atoms/Avatar.svelte';
  import Badge from '#lib/components/atoms/Badge.svelte';
  import ProgressBar from '#lib/components/atoms/ProgressBar.svelte';

  type Props = {
    project: ProjectItem;
    onselect?: (project: ProjectItem) => void;
  };

  let { project, onselect }: Props = $props();

  const statusConfig: Record<
    ProjectStatus,
    { label: string; tone: 'indigo' | 'amber' | 'emerald' | 'neutral' }
  > = {
    active: { label: 'Active', tone: 'indigo' },
    review: { label: 'In Review', tone: 'amber' },
    completed: { label: 'Completed', tone: 'emerald' },
    paused: { label: 'Paused', tone: 'neutral' },
  };

  const cfg = $derived(statusConfig[project.status]);
</script>

<button
  type="button"
  onclick={() => onselect?.(project)}
  class="group flex w-full cursor-pointer flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
>
  <div>
    <div class="flex items-start justify-between gap-2">
      <span
        class="text-[11px] font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400"
      >
        {project.category}
      </span>
      <Badge tone={cfg.tone} dot>{cfg.label}</Badge>
    </div>

    <h3
      class="mt-2 text-base font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400"
    >
      {project.name}
    </h3>
    <p class="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">{project.client}</p>
    <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
      {project.description}
    </p>
  </div>

  <div class="mt-4 space-y-3 border-t border-slate-100 pt-3 dark:border-zinc-800">
    <ProgressBar
      value={project.progress}
      tone={project.status === 'completed'
        ? 'emerald'
        : project.status === 'review'
          ? 'amber'
          : 'indigo'}
      showLabel
    />

    <div class="flex items-center justify-between gap-2">
      <div class="flex -space-x-2">
        {#each project.members as member (member.name)}
          <Avatar name={member.name} color={member.color} size="sm" />
        {/each}
      </div>

      <span class="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
        <Calendar class="h-3.5 w-3.5" />
        {project.dueDate}
      </span>
    </div>
  </div>
</button>
