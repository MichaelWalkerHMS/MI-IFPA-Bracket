import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'

test.describe('Admin', () => {
  test('non-admin user is blocked from admin pages', async ({ page }) => {
    // Login as regular user (e2e-test user is not an admin)
    await login(page)

    // Try to access admin page
    await page.goto('/admin')

    // Should be redirected away from admin (to home or login)
    await expect(page).not.toHaveURL(/\/admin/)
    // Could redirect to either home (/) or login (/login) depending on session state
    await expect(page).toHaveURL(/\/(login)?$/)
  })

  test('unauthenticated user is redirected to login from admin', async ({ page }) => {
    // Try to access admin without logging in
    await page.goto('/admin')

    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })

  test('admin tournament page also blocks non-admin', async ({ page }) => {
    await login(page)

    // Try to access a specific admin tournament page
    await page.goto('/admin/tournament/new')

    // Should be redirected away
    await expect(page).not.toHaveURL(/\/admin\//)
  })
})
