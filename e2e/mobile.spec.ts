import { test, expect, devices } from '@playwright/test'
import { login } from './fixtures/auth'

// Configure all tests in this file to use iPhone 13 device
test.use({ ...devices['iPhone 13'] })

test.describe('Mobile', () => {

  test('homepage loads on mobile viewport', async ({ page }) => {
    await page.goto('/')

    // Should see tournament list
    await expect(page.getByText('2026 Michigan Test')).toBeVisible()
  })

  test('can navigate to tournament on mobile', async ({ page }) => {
    await page.goto('/')

    // Tap tournament
    await page.getByText('2026 Michigan Test').tap()

    // Should be on tournament page
    await expect(page).toHaveURL(/\/tournament\//)
  })

  test('bracket is accessible on mobile', async ({ page }) => {
    await login(page)

    // Navigate to tournament
    await page.getByText('2026 Michigan Test').tap()
    await page.getByRole('link', { name: /create your bracket|view.*edit.*bracket/i }).tap()

    // Bracket should load
    await expect(page.getByRole('heading', { name: 'Opening Round' })).toBeVisible()
  })

  test('can make picks on mobile', async ({ page }) => {
    await login(page)

    // Navigate to bracket
    await page.getByText('2026 Michigan Test').tap()
    await page.getByRole('link', { name: /create your bracket|view.*edit.*bracket/i }).tap()
    await expect(page.getByRole('heading', { name: 'Opening Round' })).toBeVisible()

    // Find and tap a player slot
    const playerSlots = page.locator('[class*="cursor-pointer"]').filter({ hasText: /\d+\.\s+\w+/ })
    const firstSlot = playerSlots.first()

    if (await firstSlot.isVisible()) {
      await firstSlot.tap()
    }

    // Save bracket via tap
    await page.getByRole('button', { name: /save bracket/i }).tap()
    await expect(page.getByText(/bracket saved|saved/i)).toBeVisible({ timeout: 10000 })
  })

  test('login form works on mobile', async ({ page }) => {
    await page.goto('/login')

    // Form should be visible and usable
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
  })
})
