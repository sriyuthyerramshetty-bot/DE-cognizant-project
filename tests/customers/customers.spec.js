import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../utils/mockAuth';

// Known customer from server/data/customers.json
const AVA = { phone: '5551234001', name: 'Ava Thompson' };
const NOAH = { phone: '5551234002', name: 'Noah Patel' };

async function addCustomer(page, phone) {
  await page.getByRole('button', { name: '+ Add Customer' }).click();
  await page.getByPlaceholder('Phone number').fill(phone);
  await page.getByRole('button', { name: 'Save' }).click();
}

test.describe('Customers page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.getByRole('link', { name: 'Customers' }).click();
    await expect(page.getByRole('heading', { name: 'View Customers' })).toBeVisible();
  });

  test('can add a customer by phone number', async ({ page }) => {
    await addCustomer(page, AVA.phone);
    await expect(page.getByText(AVA.name)).toBeVisible();
  });

  test('shows an error for an unknown phone number', async ({ page }) => {
    await addCustomer(page, '0000000000');
    await expect(page.getByText('No customer found for that phone number.')).toBeVisible();
  });

  test('newly added customer becomes the active selection', async ({ page }) => {
    await addCustomer(page, AVA.phone);
    await expect(page.getByRole('button', { name: `Select ${AVA.name}` })).toHaveAttribute('aria-pressed', 'true');
  });

  test('can switch the active customer', async ({ page }) => {
    await addCustomer(page, AVA.phone);
    await addCustomer(page, NOAH.phone);

    // Noah, being newest, is active — select Ava instead.
    await page.getByRole('button', { name: `Select ${AVA.name}` }).click();
    await expect(page.getByRole('button', { name: `Select ${AVA.name}` })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: `Select ${NOAH.name}` })).toHaveAttribute('aria-pressed', 'false');
  });

  test('can remove a customer', async ({ page }) => {
    await addCustomer(page, AVA.phone);
    await page.getByRole('button', { name: `Remove ${AVA.name}` }).click();
    await expect(page.getByText(AVA.name)).toBeHidden();
  });

  test('customer info dialog shows details', async ({ page }) => {
    await addCustomer(page, AVA.phone);

    // The info button is the icon button with the lucide info icon.
    await page.locator('button:has(svg.lucide-info)').click();

    await expect(page.getByText('Customer ID:')).toBeVisible();
    await expect(page.getByText('ava.thompson@example.com')).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('Customer ID:')).toBeHidden();
  });
});
