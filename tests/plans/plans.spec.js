import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../utils/mockAuth';

test.describe('Plans page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.getByRole('link', { name: 'Plans' }).click();
    await expect(page.getByRole('heading', { name: 'Plans' })).toBeVisible();
  });

  test('lists all plans by default', async ({ page }) => {
    await expect(page.getByText('Ultra 5G')).toBeVisible();
    await expect(page.getByText('Home Fiber')).toBeVisible();
    await expect(page.getByText('Everyday Plan')).toBeVisible();
  });

  test('search filters the plan list', async ({ page }) => {
    await page.getByPlaceholder('Search for plans...').fill('fiber plus');

    await expect(page.getByText('Fiber Plus')).toBeVisible();
    await expect(page.getByText('Ultra 5G')).toBeHidden();
  });

  test('shows a message when no plans match the search', async ({ page }) => {
    await page.getByPlaceholder('Search for plans...').fill('nonexistent plan xyz');
    await expect(page.getByText('No plans found. Try adjusting your search.')).toBeVisible();
  });

  test('filter dropdown narrows plans by type', async ({ page }) => {
    await page.getByRole('button', { name: 'Filter and sort plans' }).click();
    await page.getByRole('option', { name: 'Home Internet' }).click();

    await expect(page.getByText('Home Fiber')).toBeVisible();
    await expect(page.getByText('Ultra 5G')).toBeHidden();
  });

  test('sorting by price ascending puts the cheapest plan first', async ({ page }) => {
    await page.getByRole('button', { name: 'Filter and sort plans' }).click();
    await page.getByRole('option', { name: 'Price' }).click();

    // Starter Plan ($25/mo) is the cheapest. (Skip the header row's "Name".)
    const firstRowName = page.locator('div.px-6.pb-6 h2.text-left').first();
    await expect(firstRowName).toHaveText('Starter Plan');

    // Flip to descending — Fiber Plus ($65/mo) is the most expensive.
    await page.getByRole('button', { name: 'Sort ascending' }).click();
    await expect(firstRowName).toHaveText('Fiber Plus');
  });

  test('can toggle between list and card view', async ({ page }) => {
    // List view has the Name/Type/... header row.
    await expect(page.getByText('Network', { exact: true })).toBeVisible();

    await page.locator('button:has(svg)', { hasText: '' }).filter({ has: page.locator('.lucide-grid-2x2') }).first().click();

    // Card view removes the header and shows big plan cards.
    await expect(page.getByText('Network', { exact: true })).toBeHidden();
    await expect(page.getByRole('button', { name: /Add to Cart/ }).first()).toBeVisible();
  });
});
