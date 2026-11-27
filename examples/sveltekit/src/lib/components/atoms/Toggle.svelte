<script lang="ts">
  type Props = {
    checked?: boolean;
    label: string;
    description?: string;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
  };

  let { checked = false, label, description, disabled = false, onchange }: Props = $props();
</script>

<div class="flex items-start justify-between gap-4">
  <div class="min-w-0">
    <p class="text-sm font-medium text-slate-900 dark:text-zinc-100">{label}</p>
    {#if description}
      <p class="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{description}</p>
    {/if}
  </div>
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    {disabled}
    onclick={() => onchange?.(!checked)}
    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-zinc-950 {checked
      ? 'bg-indigo-600 dark:bg-indigo-500'
      : 'bg-slate-200 dark:bg-zinc-700'}"
  >
    <span
      class="inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 {checked
        ? 'translate-x-5.5'
        : 'translate-x-1'}"
    ></span>
  </button>
</div>
