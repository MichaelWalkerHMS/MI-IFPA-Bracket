import { test, expect } from '@playwright/test'
import { login, logout, verifyLoggedIn } from './fixtures/auth'

test.describe('Authentication', () => {
  test('can login with valid credentials', async ({ page }) => {
    await login(page)

    // Should be on homepage after login
    await expect(page).toHaveURL('/')

    // Should see logout option (verifyLoggedIn handles mobile menu)
    await verifyLoggedIn(page)
  })

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /log in/i }).click()

    // Should show error message
    await expect(page.getByText(/incorrect|invalid|error/i)).toBeVisible({ timeout: 10000 })

    // Should still be on login page
    await expect(page).toHaveURL('/login')
  })

  test('can logout after login', async ({ page }) => {
    await login(page)

    // Click logout (logout() handles mobile hamburger menu automatically)
    await logout(page)

    // Logout function already verifies redirect, but double-check URL
    await expect(page).toHaveURL(/\/(login)?$/, { timeout: 10000 })
  })
})
