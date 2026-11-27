<script lang="ts">
  import { Bot, Loader2, Plus, X } from '@lucide/svelte';

  import type { ModelOption } from '#src/client/api-client.ts';
  import type { DropdownOption } from '#src/client/ui/SelectDropdown.svelte';
  import type {
    AgentInfo,
    AgentSettingsPatch,
    EffortLevel,
    McpServerOption,
    Provider,
  } from '#src/core/agent-state.ts';

  import SelectDropdown from '#src/client/ui/SelectDropdown.svelte';
  import { EFFORT_LEVELS, hasEffortSuffix } from '#src/core/agent-state.ts';

  type Props = {
    open: boolean;
    agentInfo: AgentInfo | null;
    loadModels: (provider: Provider) => Promise<ModelOption[] | null>;
    loadMcpServers: (provider: Provider) => Promise<McpServerOption[]>;
    onupdate: (patch: AgentSettingsPatch) => Promise<void>;
    onclose: () => void;
  };

  let { open, agentInfo, loadModels, loadMcpServers, onupdate, onclose }: Props = $props();

  let models = $state<ModelOption[] | null>(null);
  let loadingModels = $state(false);
  let mcpServers = $state<McpServerOption[]>([]);
  let loadingMcp = $state(false);
  let customMcpInput = $state('');
  let modelMenuOpen = $state(false);
  let effortMenuOpen = $state(false);
  let customModelMode = $state(false);
  let customModelInput = $state('');
  let saving = $state(false);

  const settings = $derived(agentInfo?.settings);
  const available = $derived(agentInfo?.available);
  const showEffort = $derived(!hasEffortSuffix(settings?.model));
  const allowedMcp = $derived(settings?.allowedMcp ?? []);

  const customMcpRules = $derived(
    allowedMcp.filter((rule) => {
      return !mcpServers.some((server) => {
        return server.name === rule;
      });
    }),
  );

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

  const modelDropdownOptions = $derived.by((): DropdownOption[] => {
    const list: DropdownOption[] = [
      { value: null, label: 'CLI default', subtitle: 'Use provider default' },
    ];
    for (const m of models ?? []) {
      list.push({ value: m.id, label: m.label, subtitle: m.id });
    }
    list.push({
      value: '__custom__',
      label: 'Custom…',
      subtitle: 'Enter any model ID manually',
      separatorBefore: true,
    });
    return list;
  });

  const effortDropdownOptions: DropdownOption[] = [
    { value: null, label: 'CLI default' },
    ...EFFORT_LEVELS.map((lvl) => {
      return { value: lvl, label: lvl };
    }),
  ];

  $effect(() => {
    if (!open || !settings) {
      modelMenuOpen = false;
      effortMenuOpen = false;
      return;
    }
    const provider = settings.provider;
    let active = true;
    loadingModels = true;
    loadingMcp = true;
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

    void loadMcpServers(provider)
      .then((servers) => {
        if (active) {
          mcpServers = servers;
        }
      })
      .catch(() => {
        if (active) {
          mcpServers = [];
        }
      })
      .finally(() => {
        if (active) {
          loadingMcp = false;
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

  function handleToggleMcp(rule: string): void {
    const next = allowedMcp.includes(rule)
      ? allowedMcp.filter((item) => {
          return item !== rule;
        })
      : [...allowedMcp, rule];
    void applyPatch({ allowedMcp: next });
  }

  async function handleAddCustomMcp(): Promise<void> {
    const trimmed = customMcpInput.trim();
    if (!trimmed) {
      return;
    }
    customMcpInput = '';
    if (allowedMcp.includes(trimmed)) {
      return;
    }
    await applyPatch({ allowedMcp: [...allowedMcp, trimmed] });
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

        {#if loadingModels}
          <div class="ab-loading-block" aria-live="polite">
            <span class="ab-spin"><Loader2 size={15} color="#818cf8" /></span>
            <span>Loading available models…</span>
          </div>
        {:else}
          <div class="ab-field">
            <span class="ab-field-label">Model</span>
            {#if models && !customModelMode}
              <SelectDropdown
                ariaLabel="Select model"
                menuLabel="Models"
                value={settings.model}
                displayLabel={selectedModelOption ? selectedModelOption.label : 'CLI default'}
                displaySubtitle={selectedModelOption?.id}
                options={modelDropdownOptions}
                open={modelMenuOpen}
                disabled={saving}
                ontoggle={() => {
                  effortMenuOpen = false;
                  modelMenuOpen = !modelMenuOpen;
                }}
                onselect={handleSelectModel}
              />
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
              <SelectDropdown
                ariaLabel="Select effort"
                menuLabel="Effort levels"
                value={settings.effort}
                displayLabel={settings.effort ?? 'CLI default'}
                options={effortDropdownOptions}
                open={effortMenuOpen}
                disabled={saving}
                ontoggle={() => {
                  modelMenuOpen = false;
                  effortMenuOpen = !effortMenuOpen;
                }}
                onselect={(lvl) => {
                  effortMenuOpen = false;
                  void applyPatch({ effort: lvl as EffortLevel | null });
                }}
              />
            </div>
          {/if}
        {/if}

        <div class="ab-field ab-mcp-section">
          <div>
            <span class="ab-field-label">MCP Permissions</span>
            <p class="ab-field-hint">
              Allow headless agent runs to call selected MCP servers or tools.
            </p>
          </div>

          {#if loadingMcp}
            <div class="ab-mcp-loading">
              <span class="ab-spin"><Loader2 size={13} color="#818cf8" /></span>
              <span>Scanning MCP servers…</span>
            </div>
          {:else if mcpServers.length > 0}
            <div class="ab-mcp-list">
              {#each mcpServers as server (server.name)}
                <label class="ab-mcp-row">
                  <input
                    type="checkbox"
                    checked={allowedMcp.includes(server.name)}
                    disabled={saving}
                    onchange={() => {
                      handleToggleMcp(server.name);
                    }}
                    class="ab-modal-check"
                  />
                  <span class="ab-mcp-name">{server.name}</span>
                  <span class="ab-mcp-source">{server.source}</span>
                </label>
              {/each}
            </div>
          {:else}
            <p class="ab-mcp-empty">No MCP servers detected for this provider.</p>
          {/if}

          {#if customMcpRules.length > 0}
            <div class="ab-mcp-chips">
              {#each customMcpRules as rule (rule)}
                <span class="ab-mcp-chip">
                  <span>{rule}</span>
                  <button
                    type="button"
                    aria-label="Remove {rule}"
                    class="ab-mcp-chip-del"
                    disabled={saving}
                    onclick={() => {
                      handleToggleMcp(rule);
                    }}
                  >
                    <X size={11} />
                  </button>
                </span>
              {/each}
            </div>
          {/if}

          <div class="ab-custom-row">
            <input
              type="text"
              aria-label="Add MCP rule"
              bind:value={customMcpInput}
              placeholder="server, server:tool, or *"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleAddCustomMcp();
                }
              }}
              class="ab-field-input"
            />
            <button
              type="button"
              class="ab-save-btn ab-add-mcp-btn"
              disabled={saving || !customMcpInput.trim()}
              onclick={() => {
                void handleAddCustomMcp();
              }}
            >
              <Plus size={13} />
              Add
            </button>
          </div>
        </div>
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
    max-height: 75vh;
    overflow-y: auto;
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

  .ab-mcp-section {
    border-top: 1px solid var(--ab-border-subtle);
    padding-top: 12px;
    gap: 8px;
  }

  .ab-mcp-loading {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--ab-text-muted);
    padding: 4px 0;
  }

  .ab-mcp-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 150px;
    overflow-y: auto;
  }

  .ab-mcp-row {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--ab-border-subtle);
    border-radius: 7px;
    background: var(--ab-input-bg);
    padding: 6px 9px;
    cursor: pointer;
    font-size: 11.5px;
  }

  .ab-mcp-row:hover {
    border-color: var(--ab-border);
  }

  .ab-mcp-name {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11.5px;
    color: var(--ab-text);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ab-mcp-source {
    border-radius: 4px;
    background: var(--ab-pill-bg);
    padding: 1px 5px;
    font-size: 9.5px;
    font-weight: 600;
    color: var(--ab-text-muted);
    flex-shrink: 0;
  }

  .ab-mcp-empty {
    margin: 0;
    font-size: 11px;
    color: var(--ab-text-subtle);
  }

  .ab-mcp-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .ab-mcp-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px solid rgba(99, 102, 241, 0.45);
    border-radius: 6px;
    background: rgba(99, 102, 241, 0.14);
    padding: 2px 6px 2px 8px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: var(--ab-accent-text);
  }

  .ab-mcp-chip-del {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    padding: 1px;
    color: inherit;
    cursor: pointer;
    opacity: 0.75;
  }

  .ab-mcp-chip-del:hover {
    opacity: 1;
  }

  .ab-add-mcp-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .ab-add-mcp-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
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
