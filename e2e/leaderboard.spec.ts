import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'

test.describe('Leaderboard', () => {
  test('tournament page shows leaderboard section', async ({ page }) => {
    // Navigate to tournament (no login needed to view)
    await page.goto('/')
    await page.getByText('2026 Michigan Test').click()

    // Should see leaderboard heading
    await expect(page.getByText('LEADERBOARD')).toBeVisible()
  })

  test('user bracket appears on leaderboard after creation', async ({ page }) => {
    await login(page)

    // Navigate to tournament and create bracket
    await page.getByText('2026 Michigan Test').click()
    await page.getByRole('link', { name: /create your bracket|view.*edit.*bracket/i }).click()

    // Wait for bracket editor to load
    await expect(page.getByRole('heading', { name: 'Opening Round' })).toBeVisible()

    // Save the bracket (even empty)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })

    // Go back to tournament hub
    await page.getByRole('link', { name: /back to tournament/i }).click()

    // Should see leaderboard with our bracket
    await expect(page.getByText('LEADERBOARD')).toBeVisible()

    // Our user's bracket should appear in the leaderboard
    await expect(page.getByRole('link', { name: /e2e-test.*bracket/i })).toBeVisible()
  })

  test('leaderboard shows score column', async ({ page }) => {
    await page.goto('/')
    await page.getByText('2026 Michigan Test').click()

    // Should see Score header
    await expect(page.getByText('Score')).toBeVisible()
  })
})
