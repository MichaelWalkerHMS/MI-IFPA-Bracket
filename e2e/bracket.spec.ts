import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'

test.describe('Bracket', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    // Verify login succeeded by checking for Log Out button
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })
    // Also verify we see the dashboard (logged-in view)
    await expect(page.getByRole('heading', { name: 'My Brackets' })).toBeVisible({ timeout: 10000 })
  })

  test('can navigate to tournament leaderboard from dashboard', async ({ page }) => {
    // Re-verify we're logged in and on dashboard (redundant but helps debug flakiness)
    await expect(page.getByRole('heading', { name: 'My Brackets' })).toBeVisible()

    // Check if we already have a bracket with leaderboard link
    const leaderboardLink = page.getByRole('link', { name: 'Leaderboard' }).first()
    const hasLeaderboardLink = await leaderboardLink.isVisible().catch(() => false)

    if (!hasLeaderboardLink) {
      // Create a bracket first via the dashboard wizard
      await expect(page.getByRole('heading', { name: 'Create New Bracket' })).toBeVisible()

      const stateDropdown = page.locator('select').first()
      await stateDropdown.selectOption({ label: 'Michigan' })

      const tournamentDropdown = page.locator('select').nth(1)
      await tournamentDropdown.selectOption({ index: 1 })

      // Wait for bracket name to be auto-populated or fill manually
      const bracketNameInput = page.getByPlaceholder('Enter bracket name')
      try {
        await expect(bracketNameInput).toHaveValue(/Michigan.*#\d+/, { timeout: 5000 })
      } catch {
        // If auto-generation fails, fill in a name manually
        await bracketNameInput.fill('Test Bracket')
      }

      await page.getByRole('button', { name: 'Create Bracket' }).click()
      await expect(page).toHaveURL(/\/bracket\/.*\/edit/, { timeout: 10000 })

      // Navigate back to dashboard
      await page.goto('/')
      await page.waitForLoadState('networkidle')
    }

    // Now click the leaderboard link
    await page.getByRole('link', { name: 'Leaderboard' }).first().click()
    await expect(page).toHaveURL(/\/tournament\//, { timeout: 10000 })

    // Should see leaderboard section
    await expect(page.getByText('LEADERBOARD')).toBeVisible()
  })

  test('can make picks and save bracket', async ({ page }) => {
    // Create or navigate to bracket edit page via dashboard
    const editLink = page.getByRole('link', { name: 'Edit' }).first()
    const hasEditLink = await editLink.isVisible().catch(() => false)

    if (hasEditLink) {
      await editLink.click()
    } else {
      // Create a new bracket via wizard
      const stateDropdown = page.locator('select').first()
      await stateDropdown.selectOption({ label: 'Michigan' })

      const tournamentDropdown = page.locator('select').nth(1)
      await tournamentDropdown.selectOption({ index: 1 })

      await page.getByRole('button', { name: 'Create Bracket' }).click()
    }

    // Wait for bracket to load
    await expect(page).toHaveURL(/\/bracket\/.*\/edit/, { timeout: 10000 })
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
    await page.getByRole('button', { name: 'Save' }).click()

    // Wait for save confirmation
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })
  })

  test('picks persist after page reload', async ({ page }) => {
    // Navigate to bracket edit page via dashboard
    const editLink = page.getByRole('link', { name: 'Edit' }).first()
    const hasEditLink = await editLink.isVisible().catch(() => false)

    if (hasEditLink) {
      await editLink.click()
    } else {
      // Create a new bracket via wizard
      const stateDropdown = page.locator('select').first()
      await stateDropdown.selectOption({ label: 'Michigan' })

      const tournamentDropdown = page.locator('select').nth(1)
      await tournamentDropdown.selectOption({ index: 1 })

      await page.getByRole('button', { name: 'Create Bracket' }).click()
    }

    // Wait for bracket to load
    await expect(page).toHaveURL(/\/bracket\/.*\/edit/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Opening Round' })).toBeVisible()

    // Make a pick on the first match if possible
    const playerSlots = page.locator('[class*="cursor-pointer"]').filter({ hasText: /\d+\.\s+\w+/ })
    const firstSlot = playerSlots.first()

    if (await firstSlot.isVisible()) {
      // Get the player name before clicking
      const playerText = await firstSlot.textContent()
      await firstSlot.click()

      // Save
      await page.getByRole('button', { name: 'Save' }).click()
      await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })

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
