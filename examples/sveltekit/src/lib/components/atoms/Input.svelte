<script lang="ts">
  type Props = {
    id?: string;
    label?: string;
    value?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'search' | 'password';
    hint?: string;
    error?: string;
    disabled?: boolean;
    oninput?: (value: string) => void;
  };

  let {
    id,
    label,
    value = '',
    placeholder = '',
    type = 'text',
    hint,
    error,
    disabled = false,
    oninput,
  }: Props = $props();

  const inputId = $derived(id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`);
</script>

<div class="flex flex-col gap-1.5">
  {#if label}
    <label for={inputId} class="text-xs font-medium text-slate-700 dark:text-zinc-300">
      {label}
    </label>
  {/if}
  <input
    id={inputId}
    {type}
    {value}
    {placeholder}
    {disabled}
    oninput={(e) => oninput?.((e.currentTarget as HTMLInputElement).value)}
    class="h-9.5 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 {error
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-zinc-700 dark:focus:border-indigo-400'}"
  />
  {#if error}
    <p class="text-xs text-rose-600 dark:text-rose-400">{error}</p>
  {:else if hint}
    <p class="text-xs text-slate-500 dark:text-zinc-400">{hint}</p>
  {/if}
</div>
