<script lang="ts">
  import { Check, ChevronDown, Palette } from '@lucide/svelte';

  import type { ArtboardTheme } from '#src/registry.ts';

  type Props = {
    themes: ArtboardTheme[];
    value: string;
    label: string;
    size?: 'xs' | 'sm';
    showIcon?: boolean;
    onchange: (themeId: string) => void;
    onopenchange?: (open: boolean) => void;
  };

  let {
    themes,
    value,
    label,
    size = 'sm',
    showIcon = false,
    onchange,
    onopenchange,
  }: Props = $props();

  let open = $state(false);
  let rootEl = $state<HTMLDivElement | null>(null);

  const selectedTheme = $derived(
    themes.find((t) => {
      return t.id === value;
    }) ?? themes[0],
  );

  function setOpen(next: boolean): void {
    open = next;
    onopenchange?.(next);
  }

  function selectTheme(id: string): void {
    onchange(id);
    setOpen(false);
  }

  $effect(() => {
    if (!open) {
      return;
    }

    const onDocPointerDown = (e: PointerEvent): void => {
      if (rootEl && !rootEl.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('pointerdown', onDocPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onDocPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  });
</script>

<div bind:this={rootEl} class="ab-select-root">
  <button
    type="button"
    aria-label={label}
    aria-haspopup="listbox"
    aria-expanded={open}
    class="ab-select-trigger"
    class:ab-select-xs={size === 'xs'}
    class:ab-select-open={open}
    onclick={(e) => {
      e.stopPropagation();
      setOpen(!open);
    }}
  >
    {#if showIcon}
      <Palette size={13} />
    {/if}
    <span class="ab-select-label">{selectedTheme?.label ?? ''}</span>
    <span class="ab-select-chevron" class:ab-select-chevron-open={open}>
      <ChevronDown size={size === 'xs' ? 11 : 13} />
    </span>
  </button>

  {#if open}
    <div
      role="listbox"
      aria-label={label}
      class="ab-select-menu"
      class:ab-select-menu-xs={size === 'xs'}
    >
      {#each themes as themeOption (themeOption.id)}
        {@const isSelected = themeOption.id === selectedTheme?.id}
        <button
          type="button"
          role="option"
          aria-selected={isSelected}
          class="ab-select-option"
          class:ab-select-option-active={isSelected}
          onclick={(e) => {
            e.stopPropagation();
            selectTheme(themeOption.id);
          }}
        >
          <span class="ab-select-option-text">{themeOption.label}</span>
          {#if isSelected}
            <Check size={12} />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .ab-select-root {
    position: relative;
    display: inline-flex;
  }

  .ab-select-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    padding: 0 8px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    color: var(--ab-text);
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }

  .ab-select-trigger:hover,
  .ab-select-open {
    background: var(--ab-hover);
    border-color: var(--ab-border);
  }

  .ab-select-xs {
    height: 22px;
    gap: 4px;
    border-radius: 6px;
    border-color: var(--ab-border);
    background: var(--ab-surface);
    padding: 0 6px;
    font-size: 10px;
  }

  .ab-select-label {
    white-space: nowrap;
  }

  .ab-select-chevron {
    display: inline-flex;
    color: var(--ab-text-muted);
    transition: transform 0.15s ease;
  }

  .ab-select-chevron-open {
    transform: rotate(180deg);
  }

  .ab-select-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 60;
    min-width: 132px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-radius: 10px;
    border: 1px solid var(--ab-border);
    background: var(--ab-surface-solid);
    padding: 4px;
    box-shadow: var(--ab-chrome-shadow);
    backdrop-filter: blur(12px);
  }

  .ab-select-menu-xs {
    min-width: 112px;
    border-radius: 8px;
  }

  .ab-select-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    border: none;
    border-radius: 6px;
    background: transparent;
    padding: 6px 8px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    color: var(--ab-text);
    text-align: left;
    cursor: pointer;
    transition: background 0.12s ease;
  }

  .ab-select-menu-xs .ab-select-option {
    padding: 5px 7px;
    font-size: 11px;
  }

  .ab-select-option:hover {
    background: var(--ab-hover);
  }

  .ab-select-option-active {
    background: rgba(99, 102, 241, 0.16);
    color: var(--ab-accent-text);
  }

  .ab-select-option-active:hover {
    background: rgba(99, 102, 241, 0.22);
  }

  .ab-select-option-text {
    white-space: nowrap;
  }
</style>
