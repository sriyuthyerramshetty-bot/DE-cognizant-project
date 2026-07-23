import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../utils/mockAuth';

test.describe('Calendar page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.getByRole('link', { name: 'Calendar' }).click();
  });

  test('calendar page renders with title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible();
  });

  test('calendar header displays all day abbreviations', async ({ page }) => {
    // The CalendarHeader component should display day abbreviations
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (const day of dayLabels) {
      await expect(page.getByText(day, { exact: true })).toBeVisible();
    }
  });

  test('calendar page has a container for calendar content', async ({ page }) => {
    // The calendar container should be present on the page
    const calendarContainer = page.locator('[class*="border"][class*="rounded"][class*="shadow"]').first();
    await expect(calendarContainer).toBeVisible();
  });

  test('calendar is accessible via navigation link', async ({ page }) => {
    // Navigate away and back to verify the link works
    await page.getByRole('link', { name: 'Plans' }).click();
    await expect(page.getByRole('heading', { name: 'Plans' })).toBeVisible();

    // Navigate back to calendar
    await page.getByRole('link', { name: 'Calendar' }).click();
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible();
  });
});
