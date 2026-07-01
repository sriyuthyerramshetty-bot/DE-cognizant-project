import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

test.describe('Login / Auth', () => {
  // ── Login page renders correctly ──────────────────────────────────────────

  test('login page shows the portal heading', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /verizon employee portal/i })).toBeVisible()
  })

  test('login page shows email and password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
  })

  test('login page shows the Sign In button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('visiting a protected route while logged out redirects to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
  })

  // ── Successful login ──────────────────────────────────────────────────────

  test('valid email and password redirects to home page', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Enter your email').fill('test@test.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: /good morning/i })).toBeVisible()
  })

  // ── Invalid email format ──────────────────────────────────────────────────

  test('email input without @ prevents form submission and stays on /login', async ({ page }) => {
    await page.goto('/login')
    // type="email" on the input — browser native validation blocks submission
    await page.getByPlaceholder('Enter your email').fill('notanemail')
    await page.getByPlaceholder('Enter your password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Should still be on the login page
    await expect(page).toHaveURL(/\/login$/)
  })

  test('email input is marked invalid by the browser when @ is missing', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Enter your email').fill('notanemail')
    // The input has type="email" so it gets the CSS :invalid pseudo-class
    await expect(page.locator('input[type="email"]:invalid')).toBeAttached()
  })

  // ── Logout ────────────────────────────────────────────────────────────────

  test('logout button is visible in the sidebar after login', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await expect(home.logoutButton).toBeVisible()
  })

  test('clicking logout redirects to /login', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.logoutButton.click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('after logout, visiting a protected route redirects to /login', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await home.logoutButton.click()
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
  })
})
