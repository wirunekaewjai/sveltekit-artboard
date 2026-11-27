<script lang="ts">
  import { Bot, Check, ChevronDown, Loader2, X } from '@lucide/svelte';

  import type { ModelOption } from '#src/client/api-client.ts';
  import type {
    AgentInfo,
    AgentSettingsPatch,
    EffortLevel,
    Provider,
  } from '#src/core/agent-state.ts';

  import { EFFORT_LEVELS, hasEffortSuffix } from '#src/core/agent-state.ts';

  type Props = {
    open: boolean;
    agentInfo: AgentInfo | null;
    loadModels: (provider: Provider) => Promise<ModelOption[] | null>;
    onupdate: (patch: AgentSettingsPatch) => Promise<void>;
    onclose: () => void;
  };

  let { open, agentInfo, loadModels, onupdate, onclose }: Props = $props();

  let models = $state<ModelOption[] | null>(null);
  let loadingModels = $state(false);
  let modelMenuOpen = $state(false);
  let effortMenuOpen = $state(false);
  let customModelMode = $state(false);
  let customModelInput = $state('');
  let saving = $state(false);

  const settings = $derived(agentInfo?.settings);
  const available = $derived(agentInfo?.available);
  const showEffort = $derived(!hasEffortSuffix(settings?.model));

  const selectedModelOption = $derived.by((): ModelOption | null => {
    const id = settings?.model;
    if (!id) {
      return null;
    }
    const found = models?.find((m) => {
      return m.id === id;
    });
    return found ?? { id, label: id };
  });

  $effect(() => {
    if (!open || !settings) {
      modelMenuOpen = false;
      effortMenuOpen = false;
      return;
    }
    const provider = settings.provider;
    let active = true;
    loadingModels = true;
    modelMenuOpen = false;
    effortMenuOpen = false;

    void loadModels(provider)
      .then((list) => {
        if (!active) {
          return;
        }
        models = list;
        const current = settings.model;
        if (
          current &&
          list &&
          !list.some((m) => {
            return m.id === current;
          })
        ) {
          customModelMode = true;
          customModelInput = current;
        } else {
          customModelMode = false;
        }
      })
      .finally(() => {
        if (active) {
          loadingModels = false;
        }
      });

    return () => {
      active = false;
    };
  });

  async function applyPatch(patch: AgentSettingsPatch): Promise<void> {
    saving = true;
    try {
      await onupdate(patch);
    } finally {
      saving = false;
    }
  }

  function handleSelectModel(val: string | null): void {
    modelMenuOpen = false;
    if (val === '__custom__') {
      customModelMode = true;
      customModelInput = settings?.model ?? '';
      return;
    }
    customModelMode = false;
    void applyPatch({ model: val });
  }

  function handleCancelCustom(): void {
    customModelMode = false;
    customModelInput = settings?.model ?? '';
  }

  async function handleSaveCustom(): Promise<void> {
    const trimmed = customModelInput.trim() || null;
    await applyPatch({ model: trimmed });
    if (!trimmed) {
      customModelMode = false;
    }
  }
</script>

{#if open && settings}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="ab-modal-backdrop" onclick={onclose}>
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Agent Runner Settings"
      class="ab-modal"
      onclick={(e) => {
        e.stopPropagation();
        modelMenuOpen = false;
        effortMenuOpen = false;
      }}
    >
      <div class="ab-modal-head">
        <div class="ab-modal-title-wrap">
          <Bot size={16} color="#818cf8" />
          <h2 class="ab-modal-title">Agent Runner Settings</h2>
        </div>
        <button type="button" aria-label="Close settings" class="ab-modal-close" onclick={onclose}>
          <X size={15} />
        </button>
      </div>

      <div class="ab-modal-body">
        <label class="ab-toggle-row">
          <div>
            <p class="ab-field-label">Enable Agent Runner</p>
            <p class="ab-field-hint">
              Allow sending open comments to a local CLI (off by default).
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.enabled}
            disabled={saving}
            onchange={(e) => {
              void applyPatch({ enabled: (e.currentTarget as HTMLInputElement).checked });
            }}
            class="ab-modal-check"
          />
        </label>

        <div class="ab-field">
          <span class="ab-field-label">Provider</span>
          <div class="ab-provider-grid">
            <button
              type="button"
              class="ab-provider-btn"
              class:ab-provider-active={settings.provider === 'claude'}
              disabled={saving}
              onclick={() => {
                void applyPatch({ provider: 'claude' });
              }}
            >
              <span>Claude Code</span>
              <span
                class="ab-avail-dot"
                class:ab-avail-ok={available?.claude}
                title={available?.claude ? 'Installed' : 'CLI not found'}
              ></span>
            </button>
            <button
              type="button"
              class="ab-provider-btn"
              class:ab-provider-active={settings.provider === 'antigravity'}
              disabled={saving}
              onclick={() => {
                void applyPatch({ provider: 'antigravity' });
              }}
            >
              <span>Antigravity (agy)</span>
              <span
                class="ab-avail-dot"
                class:ab-avail-ok={available?.antigravity}
                title={available?.antigravity ? 'Installed' : 'CLI not found'}
              ></span>
            </button>
          </div>
        </div>

        <!-- Blocking loader while fetching models so Model & Effort never flash/swap -->
        {#if loadingModels}
          <div class="ab-loading-block" aria-live="polite">
            <span class="ab-spin"><Loader2 size={15} color="#818cf8" /></span>
            <span>Loading available models…</span>
          </div>
        {:else}
          <div class="ab-field">
            <span class="ab-field-label">Model</span>
            {#if models && !customModelMode}
              <div class="ab-dd-wrap">
                <button
                  type="button"
                  aria-label="Select model"
                  aria-haspopup="listbox"
                  aria-expanded={modelMenuOpen}
                  disabled={saving}
                  class="ab-dd-trigger"
                  onclick={(e) => {
                    e.stopPropagation();
                    effortMenuOpen = false;
                    modelMenuOpen = !modelMenuOpen;
                  }}
                >
                  <div class="ab-dd-trigger-text">
                    <span class="ab-dd-primary">
                      {selectedModelOption ? selectedModelOption.label : 'CLI default'}
                    </span>
                    {#if selectedModelOption}
                      <span class="ab-dd-sub">{selectedModelOption.id}</span>
                    {/if}
                  </div>
                  <span class="ab-dd-chev" class:ab-dd-chev-open={modelMenuOpen}>
                    <ChevronDown size={14} />
                  </span>
                </button>

                {#if modelMenuOpen}
                  <div role="listbox" aria-label="Models" class="ab-dd-menu">
                    <button
                      type="button"
                      role="option"
                      aria-selected={!settings.model}
                      class="ab-dd-opt"
                      class:ab-dd-opt-active={!settings.model}
                      onclick={(e) => {
                        e.stopPropagation();
                        handleSelectModel(null);
                      }}
                    >
                      <div class="ab-dd-opt-lines">
                        <span class="ab-dd-opt-label">CLI default</span>
                        <span class="ab-dd-opt-id">Use provider default</span>
                      </div>
                      {#if !settings.model}
                        <Check size={13} />
                      {/if}
                    </button>

                    {#each models as m (m.id)}
                      {@const active = settings.model === m.id}
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        class="ab-dd-opt"
                        class:ab-dd-opt-active={active}
                        onclick={(e) => {
                          e.stopPropagation();
                          handleSelectModel(m.id);
                        }}
                      >
                        <div class="ab-dd-opt-lines">
                          <span class="ab-dd-opt-label">{m.label}</span>
                          <span class="ab-dd-opt-id">{m.id}</span>
                        </div>
                        {#if active}
                          <Check size={13} />
                        {/if}
                      </button>
                    {/each}

                    <div class="ab-dd-sep"></div>

                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      class="ab-dd-opt"
                      onclick={(e) => {
                        e.stopPropagation();
                        handleSelectModel('__custom__');
                      }}
                    >
                      <div class="ab-dd-opt-lines">
                        <span class="ab-dd-opt-label">Custom…</span>
                        <span class="ab-dd-opt-id">Enter any model ID manually</span>
                      </div>
                    </button>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="ab-custom-row">
                <input
                  type="text"
                  aria-label="Custom model id"
                  bind:value={customModelInput}
                  placeholder="Model id (empty = CLI default)"
                  onkeydown={(e) => {
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      handleCancelCustom();
                    } else if (e.key === 'Enter') {
                      void handleSaveCustom();
                    }
                  }}
                  class="ab-field-input"
                />
                <button
                  type="button"
                  class="ab-save-btn"
                  disabled={saving}
                  onclick={() => {
                    void handleSaveCustom();
                  }}
                >
                  Save
                </button>
                {#if models}
                  <button
                    type="button"
                    class="ab-cancel-btn"
                    disabled={saving}
                    onclick={handleCancelCustom}
                  >
                    Cancel
                  </button>
                {/if}
              </div>
            {/if}
          </div>

          {#if showEffort}
            <div class="ab-field">
              <span class="ab-field-label">Effort</span>
              <div class="ab-dd-wrap">
                <button
                  type="button"
                  aria-label="Select effort"
                  aria-haspopup="listbox"
                  aria-expanded={effortMenuOpen}
                  disabled={saving}
                  class="ab-dd-trigger"
                  onclick={(e) => {
                    e.stopPropagation();
                    modelMenuOpen = false;
                    effortMenuOpen = !effortMenuOpen;
                  }}
                >
                  <span class="ab-dd-primary">{settings.effort ?? 'CLI default'}</span>
                  <span class="ab-dd-chev" class:ab-dd-chev-open={effortMenuOpen}>
                    <ChevronDown size={14} />
                  </span>
                </button>

                {#if effortMenuOpen}
                  <div role="listbox" aria-label="Effort levels" class="ab-dd-menu">
                    <button
                      type="button"
                      role="option"
                      aria-selected={!settings.effort}
                      class="ab-dd-opt"
                      class:ab-dd-opt-active={!settings.effort}
                      onclick={(e) => {
                        e.stopPropagation();
                        effortMenuOpen = false;
                        void applyPatch({ effort: null });
                      }}
                    >
                      <span class="ab-dd-opt-label">CLI default</span>
                      {#if !settings.effort}
                        <Check size={13} />
                      {/if}
                    </button>

                    {#each EFFORT_LEVELS as lvl (lvl)}
                      {@const active = settings.effort === lvl}
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        class="ab-dd-opt"
                        class:ab-dd-opt-active={active}
                        onclick={(e) => {
                          e.stopPropagation();
                          effortMenuOpen = false;
                          void applyPatch({ effort: lvl as EffortLevel });
                        }}
                      >
                        <span class="ab-dd-opt-label">{lvl}</span>
                        {#if active}
                          <Check size={13} />
                        {/if}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .ab-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
    padding: 16px;
  }

  .ab-modal {
    width: 100%;
    max-width: 420px;
    border-radius: 14px;
    border: 1px solid var(--ab-border);
    background: var(--ab-surface-solid);
    color: var(--ab-text);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
    overflow: visible;
  }

  .ab-modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--ab-border-subtle);
    padding: 14px 16px;
  }

  .ab-modal-title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ab-modal-title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
  }

  .ab-modal-close {
    display: inline-flex;
    border: none;
    border-radius: 6px;
    background: transparent;
    padding: 4px;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-modal-close:hover {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-modal-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ab-toggle-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
  }

  .ab-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ab-field-label {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--ab-text);
  }

  .ab-field-hint {
    margin: 2px 0 0;
    font-size: 11px;
    color: var(--ab-text-muted);
  }

  .ab-modal-check {
    width: 16px;
    height: 16px;
    accent-color: #4f46e5;
    cursor: pointer;
  }

  .ab-provider-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .ab-provider-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    border: 1px solid var(--ab-border);
    border-radius: 8px;
    background: var(--ab-input-bg);
    padding: 8px 10px;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--ab-text);
    cursor: pointer;
  }

  .ab-provider-active {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.16);
    color: var(--ab-accent-text);
  }

  .ab-avail-dot {
    width: 7px;
    height: 7px;
    border-radius: 9999px;
    background: #52525b;
    flex-shrink: 0;
  }

  .ab-avail-ok {
    background: #10b981;
  }

  .ab-loading-block {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 92px;
    border-radius: 10px;
    border: 1px dashed var(--ab-border);
    background: var(--ab-input-bg);
    font-size: 12px;
    color: var(--ab-text-muted);
  }

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

  .ab-field-input {
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    height: 36px;
    border: 1px solid var(--ab-border);
    border-radius: 8px;
    background: var(--ab-input-bg);
    padding: 0 10px;
    font-size: 12px;
    color: var(--ab-text);
  }

  .ab-field-input:focus {
    outline: none;
    border-color: #6366f1;
  }

  .ab-custom-row {
    display: flex;
    gap: 6px;
  }

  .ab-save-btn {
    border: none;
    border-radius: 8px;
    background: #4f46e5;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
  }

  .ab-cancel-btn {
    border: 1px solid var(--ab-border);
    border-radius: 8px;
    background: transparent;
    padding: 0 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--ab-text-muted);
    cursor: pointer;
  }

  .ab-cancel-btn:hover {
    background: var(--ab-hover);
    color: var(--ab-text);
  }

  .ab-spin {
    display: inline-flex;
    animation: ab-spin 1s linear infinite;
  }

  @keyframes ab-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
