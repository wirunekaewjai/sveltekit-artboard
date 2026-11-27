<script lang="ts">
  import { AlertTriangle } from '@lucide/svelte';

  import Button from '#lib/components/atoms/Button.svelte';
  import Input from '#lib/components/atoms/Input.svelte';
  import Dialog from '#lib/components/molecules/Dialog.svelte';

  type Props = {
    open: boolean;
    contained?: boolean;
    workspaceName: string;
    confirmationInput?: string;
    onconfirmationchange?: (value: string) => void;
    onclose?: () => void;
    onconfirm?: () => void;
  };

  let {
    open,
    contained = false,
    workspaceName,
    confirmationInput = '',
    onconfirmationchange,
    onclose,
    onconfirm,
  }: Props = $props();

  const canDelete = $derived(confirmationInput.trim() === workspaceName.trim());
</script>

<Dialog
  {open}
  {contained}
  size="sm"
  title="Delete Workspace"
  description="This action permanently deletes all projects, artboards, and review history."
  {onclose}
>
  <div class="space-y-4">
    <div
      class="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
    >
      <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        Type <strong class="font-semibold">{workspaceName}</strong> below to confirm permanent deletion.
      </p>
    </div>

    <Input
      label="Workspace Name Confirmation"
      placeholder={workspaceName}
      value={confirmationInput}
      oninput={(v) => onconfirmationchange?.(v)}
    />
  </div>

  {#snippet footer()}
    <Button variant="secondary" size="sm" onclick={onclose}>Cancel</Button>
    <Button variant="danger" size="sm" disabled={!canDelete} onclick={onconfirm}>
      Delete Permanently
    </Button>
  {/snippet}
</Dialog>
