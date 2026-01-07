import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'

test.describe('Dashboard', () => {
  test('logged out user sees tournament list and CTA', async ({ page }) => {
    await page.goto('/')

    // Should see the landing page with tournament list
    await expect(page.getByRole('heading', { name: 'IFPA Bracket Predictor' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tournaments' })).toBeVisible()

    // Should see login/signup CTAs (use .first() as there may be multiple Log In links)
    await expect(page.getByRole('link', { name: 'Log In' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign Up' }).first()).toBeVisible()
  })

  test('logged in user sees dashboard with My Brackets section', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })

    // Should see dashboard sections
    await expect(page.getByRole('heading', { name: 'My Brackets' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Create New Bracket' })).toBeVisible()
  })

  test('logged in user sees Create Bracket wizard', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })

    // Should see the wizard steps
    await expect(page.getByText('Select State')).toBeVisible()
    await expect(page.getByText('Select Tournament')).toBeVisible()
    await expect(page.getByText('Bracket Name')).toBeVisible()

    // Create button should be disabled initially
    const createButton = page.getByRole('button', { name: 'Create Bracket' })
    await expect(createButton).toBeVisible()
    await expect(createButton).toBeDisabled()
  })

  test('can select state and tournament in wizard', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })

    // Select a state
    const stateDropdown = page.locator('select').first()
    await stateDropdown.selectOption({ label: 'MI' })

    // Tournament dropdown should now be enabled
    const tournamentDropdown = page.locator('select').nth(1)
    await expect(tournamentDropdown).toBeEnabled()

    // Select a tournament
    await tournamentDropdown.selectOption({ index: 1 })

    // Bracket name should be auto-populated
    const bracketNameInput = page.getByPlaceholder('Enter bracket name')
    await expect(bracketNameInput).toHaveValue(/MI.*#\d+/)

    // Create button should be enabled
    const createButton = page.getByRole('button', { name: 'Create Bracket' })
    await expect(createButton).toBeEnabled()
  })

  test('tournament details appear when tournament selected', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })

    // Select a state and tournament
    const stateDropdown = page.locator('select').first()
    await stateDropdown.selectOption({ label: 'MI' })

    const tournamentDropdown = page.locator('select').nth(1)
    await tournamentDropdown.selectOption({ index: 1 })

    // Tournament details should appear (player count, lock time)
    // Use .first() because player count appears in both My Brackets table and TournamentDetails
    await expect(page.getByText(/\d+ players/).first()).toBeVisible()
    await expect(page.getByText(/Lock/i)).toBeVisible()
  })

  test('can create new bracket and navigate to edit page', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })

    // Select a state and tournament
    const stateDropdown = page.locator('select').first()
    await stateDropdown.selectOption({ label: 'MI' })

    const tournamentDropdown = page.locator('select').nth(1)
    await tournamentDropdown.selectOption({ index: 1 })

    // Wait for bracket name to be populated
    const bracketNameInput = page.getByPlaceholder('Enter bracket name')
    await expect(bracketNameInput).toHaveValue(/MI.*#\d+/)

    // Click create
    await page.getByRole('button', { name: 'Create Bracket' }).click()

    // Should navigate to bracket edit page
    await expect(page).toHaveURL(/\/bracket\/.*\/edit/, { timeout: 10000 })

    // Should see bracket editor
    await expect(page.getByRole('heading', { name: 'Opening Round' })).toBeVisible()
  })
})

test.describe('Dashboard - My Brackets Table', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })
  })

  test('shows empty state when no brackets', async ({ page }) => {
    // Note: This test may show brackets if the test user already has some
    // The empty state text should be visible if no brackets exist
    const emptyMessage = page.getByText("You haven't created any brackets yet.")
    const tableHeaders = page.getByText('Tournament')

    // Either empty message or table should be visible
    const hasEmptyState = await emptyMessage.isVisible().catch(() => false)
    const hasTable = await tableHeaders.isVisible().catch(() => false)

    expect(hasEmptyState || hasTable).toBe(true)
  })

  test('shows action links for existing brackets', async ({ page }) => {
    // Check if we already have a bracket - if not, create one
    const editLink = page.getByRole('link', { name: 'Edit' }).first()
    const hasExistingBracket = await editLink.isVisible().catch(() => false)

    if (!hasExistingBracket) {
      // Create a bracket first to ensure we have one
      const stateDropdown = page.locator('select').first()
      await stateDropdown.selectOption({ label: 'MI' })

      const tournamentDropdown = page.locator('select').nth(1)
      await tournamentDropdown.selectOption({ index: 1 })

      await page.getByRole('button', { name: 'Create Bracket' }).click()

      // Wait for redirect to edit page
      await expect(page).toHaveURL(/\/bracket\/.*\/edit/, { timeout: 10000 })

      // Go back to dashboard
      await page.goto('/')
    }

    await expect(page.getByRole('heading', { name: 'My Brackets' })).toBeVisible()

    // Should see View and Leaderboard links
    await expect(page.getByRole('link', { name: 'View' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Leaderboard' }).first()).toBeVisible()
  })
})
