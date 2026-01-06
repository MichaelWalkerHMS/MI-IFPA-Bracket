import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'

test.describe('Authentication', () => {
  test('can login with valid credentials', async ({ page }) => {
    await login(page)

    // Should be on homepage after login
    await expect(page).toHaveURL('/')

    // Should see logout option
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible()
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

    // Click logout
    await page.getByRole('button', { name: /log out/i }).click()

    // Should redirect to login or homepage
    await expect(page).toHaveURL(/\/(login)?$/, { timeout: 10000 })
  })
})
