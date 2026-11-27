import { expect, test } from '@playwright/test';

test.describe('sveltekit-artboard E2E', () => {
  test('renders Artboard Studio at /__artboard with zero runtime errors', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err);
    });

    await page.goto('/__artboard');

    // Studio chrome & toolbar render cleanly (proves icons & scoped UI mounted)
    await expect(page.getByRole('heading', { name: 'Artboard Studio' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Interact' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pan' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Comment', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Grid' })).toBeVisible();

    // Debug & performance tools are hidden by default for a clean review workspace
    await expect(page.getByRole('button', { name: 'Stress Test' })).toBeHidden();
    await expect(page.locator('.ab-hud')).toBeHidden();

    // Studio UI theme toggles between dark and light independently of app themes
    const root = page.locator('.ab-root');
    await expect(root).toHaveAttribute('data-studio-theme', 'dark');
    await page.getByRole('button', { name: 'Toggle studio theme' }).click();
    await expect(root).toHaveAttribute('data-studio-theme', 'light');
    await page.getByRole('button', { name: 'Toggle studio theme' }).click();
    await expect(root).toHaveAttribute('data-studio-theme', 'dark');

    // Optional custom app themes selector (custom dropdown) applies class to artboard viewports
    const globalThemeBtn = page.getByRole('button', { name: 'Global app theme' });
    await expect(globalThemeBtn).toBeVisible();
    await globalThemeBtn.click();
    await page.getByRole('option', { name: 'Dark' }).click();
    await expect(page.locator('.ab-viewport').first()).toHaveClass(/\bdark\b/);

    // Consumer Svelte 5 components render inside visible artboards
    await expect(page.getByRole('heading', { name: '01 / Atoms' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Primary', exact: true })).toBeVisible();

    // Toggle Debug Mode ON -> reveals Stress Test button and Performance HUD
    await page.getByRole('button', { name: 'Toggle debug tools' }).click();
    await expect(page.getByRole('button', { name: 'Stress Test' })).toBeVisible();
    await expect(page.locator('.ab-hud')).toBeVisible();

    // IntersectionObserver HUD proves virtualization (only visible boards are mounted)
    const hudText = await page.locator('.ab-hud-num').first().innerText();
    const match = hudText.match(/^(\d+)\s*\/\s*(\d+)$/);
    expect(match).not.toBeNull();
    const mounted = Number(match?.[1]);
    const total = Number(match?.[2]);
    expect(total).toBeGreaterThanOrEqual(20);
    expect(mounted).toBeGreaterThan(0);
    expect(mounted).toBeLessThan(total);

    // Stress Test multiplies board count 3x while keeping virtualization active
    await page.getByRole('button', { name: 'Stress Test' }).click();
    await expect(page.getByRole('button', { name: /Stress \(\d+\)/ })).toBeVisible();
    const stressHudText = await page.locator('.ab-hud-num').first().innerText();
    const stressMatch = stressHudText.match(/^(\d+)\s*\/\s*(\d+)$/);
    expect(Number(stressMatch?.[2])).toBe(total * 3);
    expect(Number(stressMatch?.[1])).toBeLessThan(total * 3);

    // Toggle Debug Mode OFF -> hides HUD & Stress Test and resets board count
    await page.getByRole('button', { name: 'Toggle debug tools' }).click();
    await expect(page.locator('.ab-hud')).toBeHidden();
    await expect(page.getByRole('button', { name: /Stress/ })).toBeHidden();

    // Pan mode moves the canvas smoothly (including touch-action: none for mobile/tablet)
    await expect(page.locator('.ab-canvas')).toHaveCSS('touch-action', 'none');
    await page.getByRole('button', { name: 'Pan' }).click();
    const world = page.locator('.ab-world');
    const beforeTransform = await world.evaluate((el) => {
      return getComputedStyle(el).transform;
    });
    await page.mouse.move(700, 450);
    await page.mouse.down();
    await page.mouse.move(540, 350, { steps: 6 });
    await page.mouse.up();
    const afterTransform = await world.evaluate((el) => {
      return getComputedStyle(el).transform;
    });
    expect(afterTransform).not.toBe(beforeTransform);

    // Comment pin workflow works without clipping, saves to .artboard/comments/<id>.json, and appears in Comments tab
    await page.getByRole('button', { name: 'Comment', exact: true }).click();
    const firstFrame = page.locator('.ab-viewport').first();
    await firstFrame.click({ position: { x: 80, y: 110 } });
    await expect(page.getByPlaceholder('e.g. Increase padding on mobile...')).toBeVisible();
    await page.getByPlaceholder('e.g. Increase padding on mobile...').fill('E2E review note');
    await page.getByRole('button', { name: 'Post', exact: true }).click();
    const pinBadge = page.locator('.ab-pin-badge').last();
    await expect(pinBadge).toBeVisible();

    // Drag the pin to a new location -> leader line connects back to original click anchor
    const pinBox = await pinBadge.boundingBox();
    expect(pinBox).not.toBeNull();
    await page.mouse.move(pinBox!.x + pinBox!.width / 2, pinBox!.y + pinBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(pinBox!.x + 60, pinBox!.y + 40, { steps: 5 });
    await page.mouse.up();
    await expect(page.locator('.ab-leader-svg line').last()).toBeVisible();

    // Click pin to open popover and edit the comment text inline
    await pinBadge.click();
    await page.getByRole('button', { name: 'Edit comment' }).click();
    await page.getByLabel('Edit comment text').fill('Edited E2E note');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Edited E2E note')).toBeVisible();

    // Comments sidebar tab lists the edited comment, opens Agent Settings (2-line dropdown + Custom Cancel), and confirms delete
    await page.getByRole('button', { name: /Comments/ }).click();
    await expect(page.getByText('Edited E2E note').first()).toBeVisible();

    await page.getByRole('button', { name: 'Agent settings' }).click();
    const agentDialog = page.getByRole('dialog', { name: 'Agent Runner Settings' });
    await expect(agentDialog).toBeVisible();
    const modelTrigger = agentDialog.getByRole('button', { name: 'Select model' });
    await expect(modelTrigger).toBeVisible();
    await modelTrigger.click();
    await agentDialog.getByRole('option', { name: /Custom/ }).click();
    await expect(agentDialog.getByLabel('Custom model id')).toBeVisible();
    await agentDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(modelTrigger).toBeVisible();
    await agentDialog.getByRole('button', { name: 'Close settings' }).click();

    // Delete with confirmation prompt so workspace stays clean
    const editedCard = page.locator('.ab-cp-card', { hasText: 'Edited E2E note' }).first();
    await editedCard.locator('.ab-cp-icon-del').click();
    await expect(editedCard.getByText('Delete comment?')).toBeVisible();
    await editedCard.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByText('Edited E2E note')).toHaveCount(0);

    expect(pageErrors).toEqual([]);
  });

  test('renders all 4 normal SvelteKit app pages without runtime errors', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err);
    });

    await page.goto('/');
    await expect(page.getByText('Veloce Studio').first()).toBeVisible();

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Analytics Dashboard' })).toBeVisible();

    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Projects Catalog' })).toBeVisible();
    const asideBox = await page.locator('aside').boundingBox();
    const mainBox = await page.locator('main').boundingBox();
    expect(asideBox).not.toBeNull();
    expect(mainBox).not.toBeNull();
    expect(asideBox!.x).toBeLessThan(mainBox!.x);
    expect(Math.abs(asideBox!.y - mainBox!.y)).toBeLessThan(5);

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Workspace Settings' })).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('fits topbar controls cleanly within 360px mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/__artboard');

    const rightBar = page.locator('.ab-topbar-right');
    await expect(rightBar).toBeVisible();
    const rightBox = await rightBar.boundingBox();
    expect(rightBox).not.toBeNull();
    expect(rightBox!.x).toBeGreaterThanOrEqual(0);
    expect(rightBox!.x + rightBox!.width).toBeLessThanOrEqual(360);

    // Also verify when Debug Mode is enabled (adds Stress Test button)
    await page.getByRole('button', { name: 'Toggle debug tools' }).click();
    const rightBoxWithDebug = await rightBar.boundingBox();
    expect(rightBoxWithDebug).not.toBeNull();
    expect(rightBoxWithDebug!.x + rightBoxWithDebug!.width).toBeLessThanOrEqual(360);
  });
});
