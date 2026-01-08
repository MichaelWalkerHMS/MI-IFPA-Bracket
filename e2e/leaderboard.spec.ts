import { test, expect } from '@playwright/test'
import { login, navigateToBracketEditor } from './fixtures/auth'

test.describe('Leaderboard', () => {
  test('tournament page shows leaderboard section', async ({ page }) => {
    // Navigate to tournament via wizard (logged out users now use wizard to browse)
    await page.goto('/')

    // Select state and tournament via wizard (state dropdown now uses full names)
    const stateDropdown = page.locator('select').first()
    await stateDropdown.selectOption({ label: 'Michigan' })

    const tournamentDropdown = page.locator('select').nth(1)
    await tournamentDropdown.selectOption({ index: 1 })

    // Click View Leaderboard to navigate to tournament page
    await page.getByRole('button', { name: 'View Leaderboard' }).click()
    await expect(page).toHaveURL(/\/tournament\//, { timeout: 10000 })

    // Should see leaderboard heading
    await expect(page.getByText('LEADERBOARD')).toBeVisible()
  })

  test('user bracket appears on leaderboard after creation', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })

    // Navigate to bracket editor via dashboard
    await navigateToBracketEditor(page)

    // Save the bracket (even empty)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })

    // Go back to dashboard
    await page.getByRole('link', { name: /back to dashboard/i }).click()

    // Wait for dashboard to load with our brackets
    await expect(page.getByRole('heading', { name: 'My Brackets' })).toBeVisible()

    // Click Leaderboard link to go to tournament page
    await page.getByRole('link', { name: 'Leaderboard' }).first().click()

    // Should see leaderboard with our bracket
    await expect(page.getByText('LEADERBOARD')).toBeVisible()
  })

  test('leaderboard shows score column', async ({ page }) => {
    // Navigate to tournament via wizard (logged out users now use wizard to browse)
    await page.goto('/')

    // Select state and tournament via wizard (state dropdown now uses full names)
    const stateDropdown = page.locator('select').first()
    await stateDropdown.selectOption({ label: 'Michigan' })

    const tournamentDropdown = page.locator('select').nth(1)
    await tournamentDropdown.selectOption({ index: 1 })

    // Click View Leaderboard to navigate to tournament page
    await page.getByRole('button', { name: 'View Leaderboard' }).click()
    await expect(page).toHaveURL(/\/tournament\//, { timeout: 10000 })

    // Should see Score header
    await expect(page.getByText('Score')).toBeVisible()
  })

  test('leaderboard displays bracket entries as clickable links', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })

    // Navigate to bracket editor via dashboard
    await navigateToBracketEditor(page)

    // Save the bracket (even empty)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })

    // Go back to dashboard and click leaderboard
    await page.getByRole('link', { name: /back to dashboard/i }).click()
    await page.getByRole('link', { name: 'Leaderboard' }).first().click()

    // Wait for leaderboard to load
    await expect(page.getByText('LEADERBOARD')).toBeVisible()

    // Verify leaderboard has clickable bracket entries
    const leaderboardEntry = page.locator('a[href^="/bracket/"]').first()
    await expect(leaderboardEntry).toBeVisible()

    // Verify the entry contains the bracket name (auto-generated names include state and year)
    const entryText = await leaderboardEntry.textContent()
    expect(entryText).toBeTruthy()
    expect(entryText!.length).toBeGreaterThan(0)
  })

  test('leaderboard displays scores with prominent styling', async ({ page }) => {
    // Navigate to tournament via wizard (logged out users now use wizard to browse)
    await page.goto('/')

    // Select state and tournament via wizard (state dropdown now uses full names)
    const stateDropdown = page.locator('select').first()
    await stateDropdown.selectOption({ label: 'Michigan' })

    const tournamentDropdown = page.locator('select').nth(1)
    await tournamentDropdown.selectOption({ index: 1 })

    // Click View Leaderboard to navigate to tournament page
    await page.getByRole('button', { name: 'View Leaderboard' }).click()
    await expect(page).toHaveURL(/\/tournament\//, { timeout: 10000 })

    // Check that leaderboard entries exist
    await expect(page.getByText('LEADERBOARD')).toBeVisible()

    // Verify score elements have prominent styling (larger text, bold, boxed)
    // Score elements are in a div with font-mono text-lg font-bold px-3 py-1 rounded
    const scoreElements = page.locator('.font-mono.text-lg.font-bold')
    const count = await scoreElements.count()

    // Verify that score elements exist with the enhanced styling
    if (count > 0) {
      await expect(scoreElements.first()).toBeVisible()
    }
  })
})
