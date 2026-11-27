<script lang="ts">
  type Props = {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    compact?: boolean;
    onconfirm: () => void;
    oncancel: () => void;
  };

  let {
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    compact = false,
    onconfirm,
    oncancel,
  }: Props = $props();
</script>

<div class="ab-confirm" class:ab-confirm-compact={compact}>
  <span>{message}</span>
  <div class="ab-confirm-actions">
    <button type="button" class="ab-confirm-cancel" onclick={oncancel}>{cancelLabel}</button>
    <button type="button" class="ab-confirm-danger" onclick={onconfirm}>{confirmLabel}</button>
  </div>
</div>

<style>
  .ab-confirm {
    margin-top: 10px;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-radius: 8px;
    border: 1px solid rgba(244, 63, 94, 0.35);
    background: rgba(244, 63, 94, 0.1);
    padding: 8px 10px;
    font-size: 11.5px;
    color: #fb7185;
  }

  .ab-confirm-compact {
    margin-top: 6px;
    gap: 6px;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 10.5px;
  }

  .ab-confirm-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .ab-confirm-compact .ab-confirm-actions {
    gap: 4px;
  }

  .ab-confirm-cancel {
    border: 1px solid var(--ab-border);
    border-radius: 5px;
    background: var(--ab-surface-solid);
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 500;
    color: var(--ab-text);
    cursor: pointer;
  }

  .ab-confirm-compact .ab-confirm-cancel {
    padding: 3px 7px;
    font-size: 10px;
    font-weight: 600;
  }

  .ab-confirm-cancel:hover {
    background: var(--ab-hover);
  }

  .ab-confirm-danger {
    border: 1px solid #e11d48;
    border-radius: 5px;
    background: #e11d48;
    padding: 3px 9px;
    font-size: 11px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
  }

  .ab-confirm-compact .ab-confirm-danger {
    padding: 3px 7px;
    font-size: 10px;
  }

  .ab-confirm-danger:hover {
    background: #f43f5e;
  }
</style>
