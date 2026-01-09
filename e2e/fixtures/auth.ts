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
  // Find and click the logout button
  await page.getByRole('button', { name: /log out/i }).click()

  // Wait for redirect to login or homepage
  await expect(page).toHaveURL(/\/(login)?$/, { timeout: 10000 })
}

/**
 * Check if user is logged in by looking for auth-dependent UI elements
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Look for the Log Out button as indicator of logged-in state
    const logOutButton = page.getByRole('button', { name: /log out/i })
    await logOutButton.waitFor({ timeout: 2000 })
    return true
  } catch {
    return false
  }
}

/**
 * Navigate to bracket editor for a specific tournament.
 * Uses the dashboard: either clicks Edit on existing bracket, or creates new via wizard.
 */
export async function navigateToBracketEditor(
  page: Page,
  options: { state?: string; tournamentName?: string } = {}
): Promise<void> {
  const { state = 'Michigan', tournamentName } = options

  // Check if we already have an Edit button for an existing bracket
  const editLink = page.getByRole('link', { name: 'Edit' }).first()
  const hasEditLink = await editLink.isVisible().catch(() => false)

  if (hasEditLink) {
    await editLink.click()
  } else {
    // Use the Create Bracket wizard
    const stateDropdown = page.locator('select').first()
    await stateDropdown.selectOption({ label: state })

    // Wait for tournament dropdown to populate
    await page.waitForTimeout(500)

    const tournamentDropdown = page.locator('select').nth(1)
    if (tournamentName) {
      await tournamentDropdown.selectOption({ label: tournamentName })
    } else {
      // Select first available tournament
      await tournamentDropdown.selectOption({ index: 1 })
    }

    await page.getByRole('button', { name: 'Create Bracket' }).click()
  }

  // Wait for bracket editor to load
  await expect(page).toHaveURL(/\/bracket\/.*\/edit/, { timeout: 10000 })
  // Wait for either Opening Round (24-player) or Round of 16 (16-player) heading
  await expect(
    page.getByRole('heading', { name: 'Opening Round' }).or(
      page.getByRole('heading', { name: 'Round of 16' })
    )
  ).toBeVisible()
}
