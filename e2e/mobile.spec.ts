import { test, expect, devices } from '@playwright/test'
import { login, navigateToBracketEditor } from './fixtures/auth'

// Configure mobile viewport (use project's browser, not webkit)
const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['iPhone 13']
test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch })

test.describe('Mobile', () => {

  test('homepage loads on mobile viewport', async ({ page }) => {
    // Logged-out users see tournament list
    await page.goto('/')

    // Should see tournament list
    await expect(page.getByText('2026 Michigan Test')).toBeVisible()
  })

  test('can navigate to tournament on mobile', async ({ page }) => {
    // Logged-out users see tournament list
    await page.goto('/')

    // Tap tournament
    await page.getByText('2026 Michigan Test').tap()

    // Should be on tournament page
    await expect(page).toHaveURL(/\/tournament\//)
  })

  test('bracket is accessible on mobile', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })

    // Navigate to bracket editor via dashboard
    await navigateToBracketEditor(page)

    // Bracket should load (navigateToBracketEditor already checks this)
  })

  test('can make picks on mobile', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })

    // Navigate to bracket editor via dashboard
    await navigateToBracketEditor(page)

    // Find and tap a player slot
    const playerSlots = page.locator('[class*="cursor-pointer"]').filter({ hasText: /\d+\.\s+\w+/ })
    const firstSlot = playerSlots.first()

    if (await firstSlot.isVisible()) {
      await firstSlot.tap()
    }

    // Save bracket via tap
    await page.getByRole('button', { name: 'Save' }).tap()
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })
  })

  test('login form works on mobile', async ({ page }) => {
    await page.goto('/login')

    // Form should be visible and usable
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
  })
})
