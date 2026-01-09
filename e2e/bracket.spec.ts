import { test, expect } from '@playwright/test'
import { login, logout, navigateToBracketEditor } from './fixtures/auth'

test.describe('Bracket', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    // Verify login succeeded by checking for Log Out button
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 10000 })
    // Also verify we see the dashboard (logged-in view)
    await expect(page.getByRole('heading', { name: 'My Brackets' })).toBeVisible({ timeout: 10000 })
  })

  test('can navigate to tournament leaderboard from dashboard', async ({ page }) => {
    // Re-verify we're logged in and on dashboard (redundant but helps debug flakiness)
    await expect(page.getByRole('heading', { name: 'My Brackets' })).toBeVisible()

    // Check if we already have a bracket with leaderboard link
    const leaderboardLink = page.getByRole('link', { name: 'Leaderboard' }).first()
    const hasLeaderboardLink = await leaderboardLink.isVisible().catch(() => false)

    if (!hasLeaderboardLink) {
      // Create a bracket first via the dashboard wizard
      await expect(page.getByRole('heading', { name: 'Create New Bracket' })).toBeVisible()

      const stateDropdown = page.locator('select').first()
      await stateDropdown.selectOption({ label: 'Michigan' })

      const tournamentDropdown = page.locator('select').nth(1)
      await tournamentDropdown.selectOption({ index: 1 })

      // Wait for bracket name to be auto-populated or fill manually
      const bracketNameInput = page.getByPlaceholder('Enter bracket name')
      try {
        await expect(bracketNameInput).toHaveValue(/Michigan.*#\d+/, { timeout: 5000 })
      } catch {
        // If auto-generation fails, fill in a name manually
        await bracketNameInput.fill('Test Bracket')
      }

      await page.getByRole('button', { name: 'Create Bracket' }).click()
      await expect(page).toHaveURL(/\/bracket\/.*\/edit/, { timeout: 10000 })

      // Navigate back to dashboard
      await page.goto('/')
      await page.waitForLoadState('networkidle')
    }

    // Now click the leaderboard link
    await page.getByRole('link', { name: 'Leaderboard' }).first().click()
    await expect(page).toHaveURL(/\/tournament\//, { timeout: 10000 })

    // Should see leaderboard section
    await expect(page.getByText('LEADERBOARD')).toBeVisible()
  })

  test('can make picks and save bracket', async ({ page }) => {
    // Create or navigate to bracket edit page via dashboard
    const editLink = page.getByRole('link', { name: 'Edit' }).first()
    const hasEditLink = await editLink.isVisible().catch(() => false)

    if (hasEditLink) {
      await editLink.click()
    } else {
      // Create a new bracket via wizard
      const stateDropdown = page.locator('select').first()
      await stateDropdown.selectOption({ label: 'Michigan' })

      const tournamentDropdown = page.locator('select').nth(1)
      await tournamentDropdown.selectOption({ index: 1 })

      await page.getByRole('button', { name: 'Create Bracket' }).click()
    }

    // Wait for bracket to load
    await expect(page).toHaveURL(/\/bracket\/.*\/edit/, { timeout: 10000 })
    // Check for either Opening Round (24-player) or Round of 16 (both formats)
    const openingRound = page.getByRole('heading', { name: 'Opening Round' })
    const roundOf16 = page.getByRole('heading', { name: 'Round of 16' })
    await expect(openingRound.or(roundOf16)).toBeVisible()

    // Find clickable player slots and make a pick
    // Player slots have click handlers for making picks
    const playerSlots = page.locator('[class*="cursor-pointer"]').filter({ hasText: /\d+\.\s+\w+/ })

    // Click first available player to make a pick (if any are clickable)
    const firstSlot = playerSlots.first()
    if (await firstSlot.isVisible()) {
      await firstSlot.click()
    }

    // Save the bracket
    await page.getByRole('button', { name: 'Save' }).click()

    // Wait for save confirmation
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })
  })

  test('picks persist after page reload', async ({ page }) => {
    // Navigate to bracket edit page via dashboard
    const editLink = page.getByRole('link', { name: 'Edit' }).first()
    const hasEditLink = await editLink.isVisible().catch(() => false)

    if (hasEditLink) {
      await editLink.click()
    } else {
      // Create a new bracket via wizard
      const stateDropdown = page.locator('select').first()
      await stateDropdown.selectOption({ label: 'Michigan' })

      const tournamentDropdown = page.locator('select').nth(1)
      await tournamentDropdown.selectOption({ index: 1 })

      await page.getByRole('button', { name: 'Create Bracket' }).click()
    }

    // Wait for bracket to load
    await expect(page).toHaveURL(/\/bracket\/.*\/edit/, { timeout: 10000 })
    // Check for either Opening Round (24-player) or Round of 16 (both formats)
    const openingRound = page.getByRole('heading', { name: 'Opening Round' })
    const roundOf16 = page.getByRole('heading', { name: 'Round of 16' })
    await expect(openingRound.or(roundOf16)).toBeVisible()

    // Make a pick on the first match if possible
    const playerSlots = page.locator('[class*="cursor-pointer"]').filter({ hasText: /\d+\.\s+\w+/ })
    const firstSlot = playerSlots.first()

    if (await firstSlot.isVisible()) {
      // Get the player name before clicking
      const playerText = await firstSlot.textContent()
      await firstSlot.click()

      // Save
      await page.getByRole('button', { name: 'Save' }).click()
      await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })

      // Reload the page
      await page.reload()

      // Wait for bracket to load again
      await expect(openingRound.or(roundOf16)).toBeVisible()

      // The pick should be reflected in the bracket state
      // (the selected player should still be shown as the winner)
      if (playerText) {
        await expect(page.getByText(playerText.trim())).toBeVisible()
      }
    }
  })

  test('public/private toggle shows slider and explainer popup', async ({ page }) => {
    // Navigate to bracket edit page using helper
    await navigateToBracketEditor(page)

    // The toggle slider should be visible - look for the toggle button
    const toggleButton = page.getByRole('button', { name: /make private|make public/i })
    await expect(toggleButton).toBeVisible()

    // Should show "Public" initially (exact match to avoid matching other elements)
    await expect(page.getByText('Public', { exact: true })).toBeVisible()

    // Click to make private
    await toggleButton.click()

    // Should now show "Private" label (exact match)
    await expect(page.getByText('Private', { exact: true })).toBeVisible()

    // The explainer popup should appear
    await expect(page.getByText('Private brackets:')).toBeVisible()
    await expect(page.getByText('Only visible to you')).toBeVisible()
    await expect(page.getByText(/Won't appear on public leaderboard/i)).toBeVisible()

    // Dismiss the explainer
    await page.getByRole('button', { name: 'Got it' }).click()
    await expect(page.getByText('Private brackets:')).not.toBeVisible()

    // Toggle back to public
    await toggleButton.click()
    await expect(page.getByText('Public', { exact: true })).toBeVisible()
  })

  test('arrows are visible between rounds', async ({ page }) => {
    // Navigate to bracket edit page using helper
    await navigateToBracketEditor(page)

    // Arrow connectors should be present between rounds (using data-testid)
    const arrowConnectors = page.getByTestId('round-arrow-connector')

    // 24-player has 4 arrows: Opening→R16, R16→QF, QF→SF, SF→Finals
    // 16-player has 3 arrows: R16→QF, QF→SF, SF→Finals
    await expect(arrowConnectors.first()).toBeVisible()
    const arrowCount = await arrowConnectors.count()
    expect(arrowCount === 3 || arrowCount === 4).toBe(true)
  })

  test('can delete own bracket with confirmation', async ({ page }) => {
    // Wait for the dashboard to be fully loaded before proceeding
    await expect(page.getByRole('heading', { name: 'My Brackets' })).toBeVisible()

    // Create a new bracket specifically for deletion test
    // This avoids issues with shared brackets from other tests
    const stateDropdown = page.locator('select').first()
    await stateDropdown.selectOption({ label: 'Michigan' })

    const tournamentDropdown = page.locator('select').nth(1)
    await tournamentDropdown.selectOption({ index: 1 })

    // Give it a unique name so we can identify it
    const bracketNameInput = page.getByPlaceholder('Enter bracket name')
    await bracketNameInput.fill('Delete Test Bracket ' + Date.now())

    await page.getByRole('button', { name: 'Create Bracket' }).click()
    await expect(page).toHaveURL(/\/bracket\/.*\/edit/, { timeout: 10000 })
    const bracketEditUrl = page.url()

    // Save the bracket first so it exists and has an ID
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })

    // Delete button should be visible after save
    const deleteButton = page.getByRole('button', { name: 'Delete Bracket' })
    await expect(deleteButton).toBeVisible()

    // Click delete button
    await deleteButton.click()

    // Confirmation modal should appear
    await expect(page.getByText('Delete Bracket?')).toBeVisible()
    await expect(page.getByText('This will permanently delete your bracket')).toBeVisible()

    // Click Cancel first to test cancel works
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('Delete Bracket?')).not.toBeVisible()

    // We're still on the bracket page
    expect(page.url()).toBe(bracketEditUrl)

    // Now actually delete
    await deleteButton.click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    // Should redirect to home
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })
})

test.describe('Bracket (logged out)', () => {
  test('logged out user sees CTA on public bracket page', async ({ page }) => {
    // First login and create/navigate to a bracket
    await login(page)
    await page.waitForLoadState('networkidle')
    await navigateToBracketEditor(page)

    // Extract bracket ID from URL
    const match = page.url().match(/\/bracket\/(.*)\/edit/)
    const bracketId = match?.[1] || ''

    // Save if needed (new brackets need to be saved)
    const saveButton = page.getByRole('button', { name: 'Save' })
    if (await saveButton.isEnabled()) {
      await saveButton.click()
      await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })
    }

    // Ensure it's public (toggle if needed)
    const isPrivate = await page.getByText('Private', { exact: true }).isVisible().catch(() => false)
    if (isPrivate) {
      const toggleButton = page.getByRole('button', { name: /make public/i })
      await toggleButton.click()
      await page.getByRole('button', { name: 'Save' }).click()
      await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10000 })
    }

    // Logout
    await logout(page)

    // Visit the bracket page (view mode, not edit)
    await page.goto(`/bracket/${bracketId}`)
    await page.waitForLoadState('networkidle')

    // Should see the CTA for logged out users
    await expect(page.getByText('Want to make your own predictions?')).toBeVisible()
    await expect(page.getByText('Create your bracket and compete on the leaderboard!')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Create Your Bracket' })).toBeVisible()

    // CTA link should go to home page
    await page.getByRole('link', { name: 'Create Your Bracket' }).click()
    await expect(page).toHaveURL('/')
  })
})
