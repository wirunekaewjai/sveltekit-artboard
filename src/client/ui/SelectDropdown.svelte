<script lang="ts">
  import { Check, ChevronDown } from '@lucide/svelte';

  export type DropdownOption = {
    value: string | null;
    label: string;
    subtitle?: string;
    separatorBefore?: boolean;
  };

  type Props = {
    ariaLabel: string;
    menuLabel: string;
    value: string | null;
    displayLabel: string;
    displaySubtitle?: string;
    options: readonly DropdownOption[];
    open: boolean;
    disabled?: boolean;
    ontoggle: () => void;
    onselect: (value: string | null) => void;
  };

  let {
    ariaLabel,
    menuLabel,
    value,
    displayLabel,
    displaySubtitle,
    options,
    open,
    disabled = false,
    ontoggle,
    onselect,
  }: Props = $props();
</script>

<div class="ab-dd-wrap">
  <button
    type="button"
    aria-label={ariaLabel}
    aria-haspopup="listbox"
    aria-expanded={open}
    {disabled}
    class="ab-dd-trigger"
    onclick={(e) => {
      e.stopPropagation();
      ontoggle();
    }}
  >
    <div class="ab-dd-trigger-text">
      <span class="ab-dd-primary">{displayLabel}</span>
      {#if displaySubtitle}
        <span class="ab-dd-sub">{displaySubtitle}</span>
      {/if}
    </div>
    <span class="ab-dd-chev" class:ab-dd-chev-open={open}>
      <ChevronDown size={14} />
    </span>
  </button>

  {#if open}
    <div role="listbox" aria-label={menuLabel} class="ab-dd-menu">
      {#each options as opt (opt.value ?? '__null__')}
        {@const active = opt.value !== '__custom__' && value === opt.value}
        {#if opt.separatorBefore}
          <div class="ab-dd-sep"></div>
        {/if}
        <button
          type="button"
          role="option"
          aria-selected={active}
          class="ab-dd-opt"
          class:ab-dd-opt-active={active}
          onclick={(e) => {
            e.stopPropagation();
            onselect(opt.value);
          }}
        >
          {#if opt.subtitle}
            <div class="ab-dd-opt-lines">
              <span class="ab-dd-opt-label">{opt.label}</span>
              <span class="ab-dd-opt-id">{opt.subtitle}</span>
            </div>
          {:else}
            <span class="ab-dd-opt-label">{opt.label}</span>
          {/if}
          {#if active}
            <Check size={13} />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .ab-dd-wrap {
    position: relative;
  }

  .ab-dd-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    min-height: 38px;
    border: 1px solid var(--ab-border);
    border-radius: 8px;
    background: var(--ab-input-bg);
    padding: 6px 10px;
    text-align: left;
    color: var(--ab-text);
    cursor: pointer;
  }

  .ab-dd-trigger:hover {
    border-color: #6366f1;
  }

  .ab-dd-trigger-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .ab-dd-primary {
    font-size: 12px;
    font-weight: 600;
    color: var(--ab-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-dd-sub {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    color: var(--ab-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-dd-chev {
    display: inline-flex;
    color: var(--ab-text-muted);
    flex-shrink: 0;
    transition: transform 0.15s ease;
  }

  .ab-dd-chev-open {
    transform: rotate(180deg);
  }

  .ab-dd-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 90;
    max-height: 240px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-radius: 10px;
    border: 1px solid var(--ab-border);
    background: var(--ab-surface-solid);
    padding: 4px;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  }

  .ab-dd-opt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    border: none;
    border-radius: 7px;
    background: transparent;
    padding: 7px 9px;
    text-align: left;
    color: var(--ab-text);
    cursor: pointer;
  }

  .ab-dd-opt:hover {
    background: var(--ab-hover);
  }

  .ab-dd-opt-active {
    background: rgba(99, 102, 241, 0.16);
    color: var(--ab-accent-text);
  }

  .ab-dd-opt-lines {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .ab-dd-opt-label {
    font-size: 12px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-dd-opt-id {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    color: var(--ab-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-dd-sep {
    height: 1px;
    margin: 3px 4px;
    background: var(--ab-border-subtle);
  }
</style>
