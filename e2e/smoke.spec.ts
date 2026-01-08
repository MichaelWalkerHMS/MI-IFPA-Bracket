import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')

  // Verify the page loads with expected content
  await expect(page).toHaveTitle(/IFPA|Bracket|Predictor/i)
})

test('footer appears on all pages with privacy link', async ({ page }) => {
  // Check footer on homepage
  await page.goto('/')
  await expect(page.getByRole('contentinfo')).toBeVisible()
  await expect(page.getByRole('contentinfo').getByRole('link', { name: /Privacy Policy/i })).toBeVisible()

  // Check footer on login page
  await page.goto('/login')
  await expect(page.getByRole('contentinfo').getByRole('link', { name: /Privacy Policy/i })).toBeVisible()

  // Check footer on about page
  await page.goto('/about')
  await expect(page.getByRole('contentinfo').getByRole('link', { name: /Privacy Policy/i })).toBeVisible()
})

test('nav links appear in header on homepage', async ({ page }) => {
  await page.goto('/')

  // Verify About and FAQ links are visible
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'FAQ' })).toBeVisible()
})

test('can navigate using nav links', async ({ page }) => {
  await page.goto('/')

  // Click About link and verify navigation
  await page.getByRole('link', { name: 'About' }).click()
  await expect(page).toHaveURL('/about')
  await expect(page.getByRole('heading', { name: /About IFPA Bracket Predictor/i })).toBeVisible()

  // Click FAQ link and verify navigation
  await page.getByRole('link', { name: 'FAQ' }).click()
  await expect(page).toHaveURL('/faq')
  await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible()

  // Click Privacy link in footer and verify navigation
  await page.getByRole('contentinfo').getByRole('link', { name: /Privacy Policy/i }).click()
  await expect(page).toHaveURL('/privacy')
  await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible()
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
