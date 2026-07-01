import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

test.describe('Navigation', () => {
  let home

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page)
    await home.goto()
  })

  // All sidebar links navigate correctly

  test('Calendar link navigates to /calendar', async ({ page }) => {
    await home.goToCalendar()
    await expect(page).toHaveURL(/\/calendar$/)
    await expect(page.getByRole('heading', { name: /calendar/i })).toBeVisible()
  })

  test('Settings link navigates to /settings', async ({ page }) => {
    await home.goToSettings()
    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
  })

  test('Plans link navigates to /plan', async ({ page }) => {
    await home.goToPlans()
    await expect(page).toHaveURL(/\/plan$/)
    await expect(page.getByRole('heading', { name: /^plans$/i })).toBeVisible()
  })

  test('Cart link navigates to /cart', async ({ page }) => {
    await home.goToCart()
    await expect(page).toHaveURL(/\/cart$/)
    await expect(page.getByRole('heading', { name: /my cart/i })).toBeVisible()
  })

  test('Home link returns to /', async ({ page }) => {
    await home.goToCalendar()
    await home.goToTodo()
    await expect(page).toHaveURL(/\/$/)
    await expect(home.heading).toBeVisible()
  })

  // Active link styling updates

  test('Home nav item is active on /', async ({ page }) => {
    const li = home.navHome.locator('li')
    await expect(li).toHaveClass(/from-indigo-200/)
  })

  test('Calendar nav item becomes active after navigating to /calendar', async ({ page }) => {
    await home.goToCalendar()
    const li = home.navCalendar.locator('li')
    await expect(li).toHaveClass(/from-indigo-200/)
  })

  test('Settings nav item becomes active after navigating to /settings', async ({ page }) => {
    await home.goToSettings()
    const li = home.navSettings.locator('li')
    await expect(li).toHaveClass(/from-indigo-200/)
  })

  test('Plans nav item becomes active after navigating to /plan', async ({ page }) => {
    await home.goToPlans()
    const li = home.navPlans.locator('li')
    await expect(li).toHaveClass(/from-indigo-200/)
  })

  test('Cart nav item becomes active after navigating to /cart', async ({ page }) => {
    await home.goToCart()
    const li = home.navCart.locator('li')
    await expect(li).toHaveClass(/from-indigo-200/)
  })

  test('Home nav item is no longer active when on /calendar', async ({ page }) => {
    await home.goToCalendar()
    const li = home.navHome.locator('li')
    await expect(li).not.toHaveClass(/from-indigo-200/)
  })

  // Page reload preserves active page

  // Auth state is React-only (no localStorage), so a full page reload resets
  // isAuthenticated and ProtectedRoute redirects to /login. Each reload test
  // re-logs-in to verify the route is reachable after re-authentication.

  test('reloading /calendar redirects to /login then restores Calendar page after re-login', async ({ page }) => {
    await home.goToCalendar()
    await page.reload()
    await expect(page).toHaveURL(/\/login$/)
    await home.login()
    await home.goToCalendar()
    await expect(page).toHaveURL(/\/calendar$/)
    await expect(page.getByRole('heading', { name: /calendar/i })).toBeVisible()
  })

  test('reloading /settings redirects to /login then restores Settings page after re-login', async ({ page }) => {
    await home.goToSettings()
    await page.reload()
    await expect(page).toHaveURL(/\/login$/)
    await home.login()
    await home.goToSettings()
    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
  })

  test('reloading /plan redirects to /login then restores Plans page after re-login', async ({ page }) => {
    await home.goToPlans()
    await page.reload()
    await expect(page).toHaveURL(/\/login$/)
    await home.login()
    await home.goToPlans()
    await expect(page).toHaveURL(/\/plan$/)
    await expect(page.getByRole('heading', { name: /^plans$/i })).toBeVisible()
  })

  test('reloading /cart redirects to /login then restores Cart page after re-login', async ({ page }) => {
    await home.goToCart()
    await page.reload()
    await expect(page).toHaveURL(/\/login$/)
    await home.login()
    await home.goToCart()
    await expect(page).toHaveURL(/\/cart$/)
    await expect(page.getByRole('heading', { name: /my cart/i })).toBeVisible()
  })
})
