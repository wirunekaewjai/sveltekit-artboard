<script lang="ts">
  import type { Snippet } from 'svelte';

  import { X } from '@lucide/svelte';

  type Props = {
    open: boolean;
    title: string;
    description?: string;
    /**
     * When true, renders positioned `absolute inset-0` inside its parent container
     * instead of `fixed inset-0` over the entire viewport — enabling clean preview
     * inside Artboard frames.
     */
    contained?: boolean;
    size?: 'sm' | 'md' | 'lg';
    onclose?: () => void;
    children: Snippet;
    footer?: Snippet;
  };

  let {
    open,
    title,
    description,
    contained = false,
    size = 'md',
    onclose,
    children,
    footer,
  }: Props = $props();

  const sizeClasses: Record<NonNullable<Props['size']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };
</script>

{#if open}
  <div
    role="dialog"
    aria-modal="true"
    aria-label={title}
    class="{contained
      ? 'absolute inset-0 z-30'
      : 'fixed inset-0 z-50'} flex items-center justify-center p-4"
  >
    <button
      type="button"
      aria-label="Close dialog backdrop"
      onclick={() => onclose?.()}
      class="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-[2px]"
    ></button>

    <div
      class="relative z-10 flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 {sizeClasses[
        size
      ]}"
    >
      <div
        class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-zinc-800"
      >
        <div>
          <h2 class="text-base font-semibold text-slate-900 dark:text-zinc-50">{title}</h2>
          {#if description}
            <p class="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{description}</p>
          {/if}
        </div>
        {#if onclose}
          <button
            type="button"
            onclick={onclose}
            aria-label="Close dialog"
            class="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X class="h-4 w-4" />
          </button>
        {/if}
      </div>

      <div class="px-5 py-4">{@render children()}</div>

      {#if footer}
        <div
          class="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/80"
        >
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
