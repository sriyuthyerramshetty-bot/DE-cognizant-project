import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../utils/mockAuth';

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('navigates to each page from the sidebar', async ({ page }) => {
    const routes = [
      { link: 'Customers', url: '/customers', heading: 'View Customers' },
      { link: 'Plans', url: '/plan', heading: 'Plans' },
      { link: 'Cart', url: '/cart', heading: /Cart/ },
      { link: 'Calendar', url: '/calendar', heading: 'Calendar' },
      { link: 'Settings', url: '/settings', heading: 'Settings' },
      { link: 'To-Do List', url: '/', heading: /Good Morning/ },
    ];

    for (const { link, url, heading } of routes) {
      await page.getByRole('link', { name: link }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
  });

  test('sidebar can collapse and expand', async ({ page }) => {
    const portalLabel = page.getByText('Verizon Employee Portal');
    await expect(portalLabel).toBeVisible();

    // The chevron toggle is the first button in the sidebar header.
    const toggle = page.locator('aside nav > div:first-child button');
    await toggle.click();
    // Collapsed: the label's width animates to 0 (still in DOM but hidden).
    await expect(portalLabel).toHaveCSS('width', '0px');

    await toggle.click();
    await expect(portalLabel).toBeVisible();
  });
});
