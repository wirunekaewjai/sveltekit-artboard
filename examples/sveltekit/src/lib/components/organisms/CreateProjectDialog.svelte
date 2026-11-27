<script lang="ts">
  import Button from '#lib/components/atoms/Button.svelte';
  import Input from '#lib/components/atoms/Input.svelte';
  import Dialog from '#lib/components/molecules/Dialog.svelte';

  type Props = {
    open: boolean;
    contained?: boolean;
    projectName?: string;
    clientName?: string;
    category?: string;
    errorMessage?: string;
    submitting?: boolean;
    onnamechange?: (value: string) => void;
    onclientchange?: (value: string) => void;
    oncategorychange?: (value: string) => void;
    onclose?: () => void;
    onsubmit?: () => void;
  };

  let {
    open,
    contained = false,
    projectName = '',
    clientName = '',
    category = 'Design System',
    errorMessage,
    submitting = false,
    onnamechange,
    onclientchange,
    oncategorychange,
    onclose,
    onsubmit,
  }: Props = $props();

  const categories = ['Design System', 'Web App', 'Mobile UI', 'Brand Refresh'];
</script>

<Dialog
  {open}
  {contained}
  title="Create New Project"
  description="Set up a new design review workspace for your team."
  {onclose}
>
  <div class="space-y-4">
    <Input
      label="Project Name"
      placeholder="e.g. Checkout Redesign v3"
      value={projectName}
      error={errorMessage}
      oninput={(v) => onnamechange?.(v)}
    />
    <Input
      label="Client / Squad"
      placeholder="e.g. Core Commerce"
      value={clientName}
      oninput={(v) => onclientchange?.(v)}
    />

    <div class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-slate-700 dark:text-zinc-300">Category</span>
      <div class="grid grid-cols-2 gap-2">
        {#each categories as cat (cat)}
          <button
            type="button"
            onclick={() => oncategorychange?.(cat)}
            class="cursor-pointer rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors {category ===
            cat
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'}"
          >
            {cat}
          </button>
        {/each}
      </div>
    </div>
  </div>

  {#snippet footer()}
    <Button variant="secondary" size="sm" onclick={onclose}>Cancel</Button>
    <Button variant="primary" size="sm" loading={submitting} onclick={onsubmit}>
      Create Project
    </Button>
  {/snippet}
</Dialog>
