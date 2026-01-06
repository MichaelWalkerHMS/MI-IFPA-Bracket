import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')

  // Verify the page loads with expected content
  await expect(page).toHaveTitle(/IFPA|Bracket|Predictor/i)
})

test('login page loads', async ({ page }) => {
  await page.goto('/login')

  // Verify login form elements exist
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
  await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
})

test('signup page loads', async ({ page }) => {
  await page.goto('/signup')

  // Verify signup form elements exist
  await expect(page.getByLabel('Your Name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})
