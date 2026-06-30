import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

test.describe('Home page — smoke tests', () => {
  let home

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page)
    await home.goto()
  })

  // Layout

  test('page has a sidebar and a main content area', async () => {
    await expect(home.sidebar).toBeVisible()
    await expect(home.mainSection).toBeVisible()
  })

  // Sidebar navigation links

  test('sidebar shows all five navigation links', async () => {
    await expect(home.navHome).toBeVisible()
    await expect(home.navCalendar).toBeVisible()
    await expect(home.navSettings).toBeVisible()
    await expect(home.navPlans).toBeVisible()
    await expect(home.navCart).toBeVisible()
  })

  test('Home nav link is marked active on the home route', async ({ page }) => {
    // The active SidebarItem gets the indigo gradient classes
    const homeLink = page.getByRole('link', { name: /home/i })
    const li = homeLink.locator('li')
    await expect(li).toHaveClass(/from-indigo-200/)
  })

  // Page heading & subtitle

  test('shows the greeting heading', async () => {
    await expect(home.heading).toBeVisible()
    await expect(home.heading).toContainText('Good Morning')
  })

  test('shows the motivational subtitle', async () => {
    await expect(home.subHeading).toBeVisible()
  })

  // Controls
  test('task category dropdown is visible and defaults to Active', async () => {
    await expect(home.categorySelect).toBeVisible()
    await expect(home.categorySelect).toHaveValue('active')
  })

  test('"Add New Task" button is visible and enabled by default', async () => {
    await expect(home.addTaskButton).toBeVisible()
    await expect(home.addTaskButton).toBeEnabled()
  })

  // Default task

  test('default "Jogging" task is rendered in the list', async () => {
    await expect(home.taskRow('Jogging')).toBeVisible()
  })

  test('default task has a complete button', async () => {
    const completeBtn = home.page.getByRole('button', {
      name: /complete jogging/i,
    })
    await expect(completeBtn).toBeVisible()
  })

  // User info in sidebar footer

  test('sidebar footer shows user name and email', async ({ page }) => {
    await expect(page.getByText('John Doe')).toBeVisible()
    await expect(page.getByText('johndoe@gmail.com')).toBeVisible()
  })
})
