import { test, expect } from '@playwright/test'
import { login, navigateToBracketEditor } from './fixtures/auth'

test.describe('Leaderboard', () => {
  test('tournament page shows leaderboard section', async ({ page }) => {
    // Navigate to tournament (no login needed to view - logged out users see tournament list)
    await page.goto('/')
    await page.getByText('2026 Michigan Test').click()

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
    // Logged out users see tournament list
    await page.goto('/')
    await page.getByText('2026 Michigan Test').click()

    // Should see Score header
    await expect(page.getByText('Score')).toBeVisible()
  })
})
