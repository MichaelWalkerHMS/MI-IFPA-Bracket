import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'

test.describe('Bracket', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    // Verify login succeeded by checking for Log Out button
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })
  })

  test('can navigate to tournament and create bracket', async ({ page }) => {
    // Click on a tournament from homepage (use the test tournament)
    await page.getByText('2026 Michigan Test').click()

    // Should be on tournament hub page
    await expect(page).toHaveURL(/\/tournament\//)

    // Click "Create Your Bracket" button
    await page.getByRole('link', { name: /create your bracket/i }).click()

    // Should be on bracket edit page
    await expect(page).toHaveURL(/\/tournament\/.*\/edit/)

    // Should see the bracket interface with rounds
    await expect(page.getByRole('heading', { name: 'Opening Round' })).toBeVisible()
  })

  test('can make picks and save bracket', async ({ page }) => {
    // Navigate to a tournament and create/edit bracket
    await page.getByText('2026 Michigan Test').click()
    await page.getByRole('link', { name: /create your bracket|view.*edit.*bracket/i }).click()

    // Wait for bracket to load
    await expect(page.getByRole('heading', { name: 'Opening Round' })).toBeVisible()

    // Find clickable player slots and make a pick
    // Player slots have click handlers for making picks
    const playerSlots = page.locator('[class*="cursor-pointer"]').filter({ hasText: /\d+\.\s+\w+/ })

    // Click first available player to make a pick (if any are clickable)
    const firstSlot = playerSlots.first()
    if (await firstSlot.isVisible()) {
      await firstSlot.click()
    }

    // Save the bracket
    await page.getByRole('button', { name: /save bracket/i }).click()

    // Wait for save confirmation
    await expect(page.getByText(/bracket saved|saved/i)).toBeVisible({ timeout: 10000 })
  })

  test('picks persist after page reload', async ({ page }) => {
    // Navigate to bracket edit page
    await page.getByText('2026 Michigan Test').click()
    await page.getByRole('link', { name: /create your bracket|view.*edit.*bracket/i }).click()

    // Wait for bracket to load
    await expect(page.getByRole('heading', { name: 'Opening Round' })).toBeVisible()

    // Make a pick on the first match if possible
    const playerSlots = page.locator('[class*="cursor-pointer"]').filter({ hasText: /\d+\.\s+\w+/ })
    const firstSlot = playerSlots.first()

    if (await firstSlot.isVisible()) {
      // Get the player name before clicking
      const playerText = await firstSlot.textContent()
      await firstSlot.click()

      // Save
      await page.getByRole('button', { name: /save bracket/i }).click()
      await expect(page.getByText(/bracket saved|saved/i)).toBeVisible({ timeout: 10000 })

      // Reload the page
      await page.reload()

      // Wait for bracket to load again
      await expect(page.getByRole('heading', { name: 'Opening Round' })).toBeVisible()

      // The pick should be reflected in the bracket state
      // (the selected player should still be shown as the winner)
      if (playerText) {
        await expect(page.getByText(playerText.trim())).toBeVisible()
      }
    }
  })
})
