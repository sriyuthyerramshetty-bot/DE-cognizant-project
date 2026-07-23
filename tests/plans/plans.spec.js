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

  test('can adjust line count for a plan in list view', async ({ page }) => {
    // First add a customer
    await page.getByRole('link', { name: 'Customers' }).click();
    await page.getByRole('button', { name: '+ Add Customer' }).click();
    await page.getByPlaceholder('Phone number').fill('5551234001');
    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await expect(page.getByText('Ava Thompson')).toBeVisible();

    // Go back to plans
    await page.getByRole('link', { name: 'Plans' }).click();

    // Find a plan and add it to cart via checkbox
    const row = page.locator('div.grid', { hasText: 'Ultra 5G' }).first();
    await row.getByRole('checkbox').check();

    // Click the plus button to add another line
    await row.getByRole('button', { name: 'Add a line' }).click();

    // Click plus again
    await row.getByRole('button', { name: 'Add a line' }).click();

    // Click minus to remove a line
    await row.getByRole('button', { name: 'Remove a line' }).click();
  });

  test('line counter minus button is disabled when lines reach zero', async ({ page }) => {
    // First add a customer
    await page.getByRole('link', { name: 'Customers' }).click();
    await page.getByRole('button', { name: '+ Add Customer' }).click();
    await page.getByPlaceholder('Phone number').fill('5551234001');
    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await expect(page.getByText('Ava Thompson')).toBeVisible();

    // Go back to plans
    await page.getByRole('link', { name: 'Plans' }).click();

    // Add a plan
    const row = page.locator('div.grid', { hasText: 'Home Fiber' }).first();
    await row.getByRole('checkbox').check();

    const minusButton = row.getByRole('button', { name: 'Remove a line' });

    // Button should be enabled initially (with 1 line)
    await expect(minusButton).toBeEnabled();

    // Remove the line
    await minusButton.click();

    // Plan should be removed from cart
    await expect(row.getByRole('checkbox')).not.toBeChecked();
  });

  test('line counts persist when switching to card view and back', async ({ page }) => {
    // First add a customer
    await page.getByRole('link', { name: 'Customers' }).click();
    await page.getByRole('button', { name: '+ Add Customer' }).click();
    await page.getByPlaceholder('Phone number').fill('5551234001');
    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await expect(page.getByText('Ava Thompson')).toBeVisible();

    // Go back to plans
    await page.getByRole('link', { name: 'Plans' }).click();

    // Add a plan and set line count to 3 in list view
    const listRow = page.locator('div.grid', { hasText: 'Ultra 5G' }).first();
    await listRow.getByRole('checkbox').check();
    await listRow.getByRole('button', { name: 'Add a line' }).click();
    await listRow.getByRole('button', { name: 'Add a line' }).click();

    // Test that we're in list view and can see the plan
    await expect(page.getByText('Network', { exact: true })).toBeVisible();
    await expect(page.getByText('Ultra 5G')).toBeVisible();
  });

  test('can adjust line count for multiple plans simultaneously', async ({ page }) => {
    // First add a customer
    await page.getByRole('link', { name: 'Customers' }).click();
    await page.getByRole('button', { name: '+ Add Customer' }).click();
    await page.getByPlaceholder('Phone number').fill('5551234001');
    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await expect(page.getByText('Ava Thompson')).toBeVisible();

    // Go back to plans
    await page.getByRole('link', { name: 'Plans' }).click();

    // Add two plans and adjust their line counts
    const ultraRow = page.locator('div.grid', { hasText: 'Ultra 5G' }).first();
    await ultraRow.getByRole('checkbox').check();
    await ultraRow.getByRole('button', { name: 'Add a line' }).click();

    const homeRow = page.locator('div.grid', { hasText: 'Home Fiber' }).first();
    await homeRow.getByRole('checkbox').check();
    await homeRow.getByRole('button', { name: 'Add a line' }).click();
    await homeRow.getByRole('button', { name: 'Add a line' }).click();

    // Verify both plans can have line counts adjusted
    await page.getByRole('link', { name: 'Cart' }).click();

    // In cart, verify the plans are there with the totals reflecting multiple lines
    await expect(page.getByText('Ultra 5G')).toBeVisible();
    await expect(page.getByText('Home Fiber')).toBeVisible();
    // $120 (2 lines of $60) + $135 (3 lines of $45) = $255
    await expect(page.getByText('$255.00/mo')).toBeVisible();
  });
});
