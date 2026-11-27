<script lang="ts">
  type Props = {
    name: string;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
  };

  let { name, color = 'bg-indigo-600', size = 'md' }: Props = $props();

  const initials = $derived(
    name
      .split(' ')
      .map((part) => {
        return part[0] ?? '';
      })
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );

  const sizeClasses: Record<NonNullable<Props['size']>, string> = {
    sm: 'h-7 w-7 text-[11px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
  };
</script>

<span
  title={name}
  class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white dark:ring-zinc-900 {color} {sizeClasses[
    size
  ]}"
>
  {initials}
</span>
