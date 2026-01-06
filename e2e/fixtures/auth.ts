import { Page, expect } from '@playwright/test'

/**
 * Login as the E2E test user
 */
export async function login(page: Page): Promise<void> {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Missing E2E_TEST_EMAIL or E2E_TEST_PASSWORD in environment variables'
    )
  }

  await page.goto('/login')

  // Fill in login form
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)

  // Submit the form
  await page.getByRole('button', { name: /log in/i }).click()

  // Wait for successful login - should redirect to homepage
  await expect(page).toHaveURL('/', { timeout: 10000 })
}

/**
 * Logout the current user
 */
export async function logout(page: Page): Promise<void> {
  // Find and click the logout button/link
  await page.getByRole('button', { name: /sign out|logout/i }).click()

  // Wait for redirect to login or homepage
  await expect(page).toHaveURL(/\/(login)?$/, { timeout: 10000 })
}

/**
 * Check if user is logged in by looking for auth-dependent UI elements
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Look for a common logged-in indicator (adjust based on your UI)
    const signOutButton = page.getByRole('button', { name: /sign out|logout/i })
    await signOutButton.waitFor({ timeout: 2000 })
    return true
  } catch {
    return false
  }
}
