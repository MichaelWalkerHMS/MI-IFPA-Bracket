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

test('about page loads', async ({ page }) => {
  await page.goto('/about')

  // Verify the page loads with expected content
  await expect(page.getByRole('heading', { name: /About IFPA Bracket Predictor/i })).toBeVisible()
  await expect(page.getByText(/What is this/i)).toBeVisible()
  await expect(page.getByText(/How it works/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible()
})

test('privacy page loads', async ({ page }) => {
  await page.goto('/privacy')

  // Verify the page loads with expected content
  await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible()
  await expect(page.getByText(/Data We Collect/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible()
})

test('faq page loads', async ({ page }) => {
  await page.goto('/faq')

  // Verify the page loads with expected content
  await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible()
  await expect(page.getByText(/How does scoring work/i)).toBeVisible()
  await expect(page.getByText(/What happens when a tournament locks/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible()
})
