import { test, expect } from '@playwright/test'
import { login } from './fixtures/auth'

/**
 * Admin Player Management Tests
 *
 * These tests verify the add player and inline edit functionality
 * in the admin tournament player management page.
 *
 * NOTE: The standard E2E test user (e2e-test@) is not an admin,
 * so these tests verify that non-admin users cannot access admin pages.
 * To test actual admin functionality, an admin test user would need
 * to be configured.
 */

test.describe('Admin Player Management', () => {
  test.describe('Access Control', () => {
    test('non-admin user cannot access tournament admin page', async ({ page }) => {
      await login(page)

      // Try to access a tournament admin page
      await page.goto('/admin/tournament/some-tournament-id')

      // Should be redirected away from admin
      await expect(page).not.toHaveURL(/\/admin\//)
    })

    test('unauthenticated user is redirected from tournament admin', async ({ page }) => {
      await page.goto('/admin/tournament/some-tournament-id')

      // Should be redirected to login
      await expect(page).toHaveURL('/login')
    })
  })

  // These tests document the expected behavior for admin users.
  // They are skipped since the E2E test user is not an admin.
  // To run these tests, configure an admin test user.
  test.describe('Admin Functionality (requires admin user)', () => {
    test.skip('admin can add a new player to tournament', async ({ page }) => {
      // This test would:
      // 1. Login as admin
      // 2. Navigate to tournament admin page
      // 3. Fill in "Add Player" form with player name
      // 4. Click "Add" button
      // 5. Verify player appears in the list

      // Login as admin (would need admin credentials)
      await login(page)
      await page.goto('/admin/tournament/test-tournament-id')

      // Find the Add Player form
      const playerNameInput = page.getByPlaceholder('Player name')
      const addButton = page.getByRole('button', { name: 'Add' })

      // Add a new player
      await playerNameInput.fill('Test Player Name')
      await addButton.click()

      // Wait for page to refresh and verify player appears
      await expect(page.getByText('Test Player Name')).toBeVisible()
    })

    test.skip('admin can inline edit a player name', async ({ page }) => {
      // This test would:
      // 1. Login as admin
      // 2. Navigate to tournament admin page with existing players
      // 3. Click on a player name to activate inline edit
      // 4. Change the name and press Enter
      // 5. Verify the name is updated

      await login(page)
      await page.goto('/admin/tournament/test-tournament-id')

      // Find a player name and click to edit
      const playerName = page.locator('span[title="Click to edit"]').first()
      await playerName.click()

      // Input should now be visible
      const editInput = page.locator('input[type="text"]').first()
      await expect(editInput).toBeVisible()
      await expect(editInput).toBeFocused()

      // Clear and type new name
      await editInput.clear()
      await editInput.fill('Updated Player Name')
      await editInput.press('Enter')

      // Verify the new name appears
      await expect(page.getByText('Updated Player Name')).toBeVisible()
    })

    test.skip('admin can cancel inline edit with Escape', async ({ page }) => {
      await login(page)
      await page.goto('/admin/tournament/test-tournament-id')

      // Click to edit
      const playerName = page.locator('span[title="Click to edit"]').first()
      const originalName = await playerName.textContent()
      await playerName.click()

      // Type something different
      const editInput = page.locator('input[type="text"]').first()
      await editInput.clear()
      await editInput.fill('This should not save')

      // Press Escape to cancel
      await editInput.press('Escape')

      // Original name should still be visible
      await expect(page.getByText(originalName!)).toBeVisible()
    })

    test.skip('add player button is disabled when at max capacity', async ({ page }) => {
      // This test would verify the disabled state when tournament is full

      await login(page)
      await page.goto('/admin/tournament/full-tournament-id')

      // Add button should be disabled
      const addButton = page.getByRole('button', { name: 'Add' })
      await expect(addButton).toBeDisabled()

      // Capacity message should be shown
      await expect(page.getByText('Tournament is at maximum capacity')).toBeVisible()
    })
  })
})
