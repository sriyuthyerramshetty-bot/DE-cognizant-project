import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../utils/mockAuth';

const AVA = { phone: '5551234001', name: 'Ava Thompson' };

// Adding to the cart requires an active customer, so each test sets one up.
async function setActiveCustomer(page) {
  await page.getByRole('link', { name: 'Customers' }).click();
  await page.getByRole('button', { name: '+ Add Customer' }).click();
  await page.getByPlaceholder('Phone number').fill(AVA.phone);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(AVA.name)).toBeVisible();
}

async function addPlanToCart(page, planName) {
  await page.getByRole('link', { name: 'Plans' }).click();
  // In list view each row has a checkbox that adds the plan to the cart.
  const row = page.locator('div.grid', { hasText: planName }).first();
  await row.getByRole('checkbox').check();
}

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('shows the empty state when nothing is in the cart', async ({ page }) => {
    await page.getByRole('link', { name: 'Cart' }).click();

    await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();
    await expect(page.getByText('No items in cart.')).toBeVisible();
  });

  test('adding a plan shows it in the active customer cart with a total', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');

    await page.getByRole('link', { name: 'Cart' }).click();

    await expect(page.getByRole('heading', { name: `${AVA.name}'s Cart` })).toBeVisible();
    await expect(page.getByText('Ultra 5G')).toBeVisible();
    await expect(page.getByText('$60.00/mo')).toBeVisible();
  });

  test('cart total sums multiple plans', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');   // $60
    await addPlanToCart(page, 'Home Fiber'); // $45

    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText('$105.00/mo')).toBeVisible();
  });

  test('removing a plan updates the cart', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');

    await page.getByRole('link', { name: 'Cart' }).click();
    await page.getByRole('button', { name: 'Remove' }).click();

    await expect(page.getByText('No items in cart.')).toBeVisible();
  });

  test('a plan already in the cart cannot be added twice', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');

    const row = page.locator('div.grid', { hasText: 'Ultra 5G' }).first();
    const checkbox = row.getByRole('checkbox');
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toBeDisabled();
  });

  test('checkout buttons stay disabled until the form is valid', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');
    await page.getByRole('link', { name: 'Cart' }).click();

    const placeOrder = page.getByRole('button', { name: 'Place Order' });
    const saveCheckout = page.getByRole('button', { name: 'Save Checkout' });

    await expect(placeOrder).toBeDisabled();
    await expect(saveCheckout).toBeDisabled();

    await page.getByPlaceholder('Enter your full name').fill('Test Buyer');
    await page.getByPlaceholder('Enter your email').fill('buyer@example.com');
    await page.getByPlaceholder('xxx-xxx-xxxx').fill('555-123-4567');
    await page.getByPlaceholder('Enter your address').fill('1 Main St, Austin, TX');

    await expect(placeOrder).toBeEnabled();
    await expect(saveCheckout).toBeEnabled();
  });

  test('checkout buttons are disabled when the cart is empty even with a valid form', async ({ page }) => {
    await page.getByRole('link', { name: 'Cart' }).click();

    await page.getByPlaceholder('Enter your full name').fill('Test Buyer');
    await page.getByPlaceholder('Enter your email').fill('buyer@example.com');
    await page.getByPlaceholder('xxx-xxx-xxxx').fill('555-123-4567');
    await page.getByPlaceholder('Enter your address').fill('1 Main St, Austin, TX');

    await expect(page.getByRole('button', { name: 'Place Order' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Save Checkout' })).toBeDisabled();
  });
});
