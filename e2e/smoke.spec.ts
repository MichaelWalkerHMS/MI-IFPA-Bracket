import { test, expect } from '@playwright/test'
import { openMobileMenuIfNeeded, closeMobileMenuIfOpen } from './fixtures/auth'

test('homepage loads', async ({ page }) => {
  await page.goto('/')

  // Verify the page loads with expected content
  await expect(page).toHaveTitle(/Pinball Brackets/i)
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

  // On mobile, nav links are inside the hamburger menu
  await openMobileMenuIfNeeded(page)

  // Verify About and FAQ links are visible
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'FAQ' })).toBeVisible()

  // Close mobile menu if opened
  await closeMobileMenuIfOpen(page)
})

test('can navigate to About using nav link', async ({ page }) => {
  await page.goto('/')

  // On mobile, nav links are inside the hamburger menu
  await openMobileMenuIfNeeded(page)

  // Click About link in header nav and verify navigation
  await page.getByRole('link', { name: 'About' }).click()
  await expect(page).toHaveURL('/about')
  await expect(page.getByRole('heading', { name: /About/i })).toBeVisible()
})

test('can navigate to FAQ using nav link', async ({ page }) => {
  await page.goto('/')

  // On mobile, nav links are inside the hamburger menu
  await openMobileMenuIfNeeded(page)

  // Click FAQ link in header nav and verify navigation
  await page.getByRole('link', { name: 'FAQ' }).click()
  await expect(page).toHaveURL('/faq')
  await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible()
})

test('can navigate to Privacy using footer link', async ({ page }) => {
  await page.goto('/')

  // Click Privacy link in footer and verify navigation
  const privacyLink = page.getByRole('contentinfo').getByRole('link', { name: /Privacy Policy/i })
  await privacyLink.scrollIntoViewIfNeeded()
  await privacyLink.click()
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
  await expect(page.getByRole('heading', { name: /About/i })).toBeVisible()
  await expect(page.getByText(/What is this/i)).toBeVisible()
  await expect(page.getByText(/How it works/i)).toBeVisible()
  // On mobile shows "← Back", on desktop shows "← Back to Home"
  await expect(page.getByRole('link', { name: /Back/i })).toBeVisible()
})

test('privacy page loads', async ({ page }) => {
  await page.goto('/privacy')

  // Verify the page loads with expected content
  await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible()
  await expect(page.getByText(/Data We Collect/i)).toBeVisible()
  // On mobile shows "← Back", on desktop shows "← Back to Home"
  await expect(page.getByRole('link', { name: /Back/i })).toBeVisible()
})

test('faq page loads', async ({ page }) => {
  await page.goto('/faq')

  // Verify the page loads with expected content
  await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible()
  await expect(page.getByText(/How does scoring work/i)).toBeVisible()
  await expect(page.getByText(/What happens when a tournament locks/i)).toBeVisible()
  // On mobile shows "← Back", on desktop shows "← Back to Home"
  await expect(page.getByRole('link', { name: /Back/i })).toBeVisible()
})
