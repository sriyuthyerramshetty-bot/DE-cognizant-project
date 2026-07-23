import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../utils/mockAuth';

const AVA = { phone: '5551234001', name: 'Ava Thompson' };

// Adding to the cart requires an active customer, so each test sets one up.
async function setActiveCustomer(page) {
  await page.getByRole('link', { name: 'Customers' }).click();
  await page.getByRole('button', { name: '+ Add Customer' }).click();
  await page.getByPlaceholder('Phone number').fill(AVA.phone);
  // Use exact match for the Save button in the form, not the global reset button
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
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
  });

  test('checkout buttons stay disabled until the form is valid', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');
    await page.getByRole('link', { name: 'Cart' }).click();

    const placeOrder = page.getByRole('button', { name: 'Place Order' });

    await expect(placeOrder).toBeDisabled();

    await page.getByPlaceholder('Enter your full name').fill('Test Buyer');
    await page.getByPlaceholder('Enter your email').fill('buyer@example.com');
    await page.getByPlaceholder('xxx-xxx-xxxx').fill('555-123-4567');
    await page.getByPlaceholder('Enter your address').fill('1 Main St, Austin, TX');

    await expect(placeOrder).toBeEnabled();
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

  test('can adjust plan line count in cart using plus/minus buttons', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');

    await page.getByRole('link', { name: 'Cart' }).click();

    // In the cart, find the Ultra 5G plan row and its line counter
    const planRow = page.locator('div').filter({ hasText: /Ultra 5G.*\$/ }).first();
    
    // Click plus button to add a line
    await planRow.getByRole('button', { name: 'Add a line' }).click();

    // Total should now be $120 ($60 * 2)
    await expect(page.getByText('$120.00/mo')).toBeVisible();

    // Click plus again
    await planRow.getByRole('button', { name: 'Add a line' }).click();
    await expect(page.getByText('$180.00/mo')).toBeVisible();

    // Click minus button to remove a line
    await planRow.getByRole('button', { name: 'Remove a line' }).click();
    await expect(page.getByText('$120.00/mo')).toBeVisible();
  });

  test('minus button is disabled when line count is zero', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');

    await page.getByRole('link', { name: 'Cart' }).click();

    const planRow = page.locator('div').filter({ hasText: /Ultra 5G.*\$/ }).first();
    const minusButton = planRow.getByRole('button', { name: 'Remove a line' });

    // Start with 1 line, minus button should be enabled
    await expect(minusButton).toBeEnabled();

    // Remove the line
    await minusButton.click();

    // Plan should be removed from cart
    await expect(page.getByText('Ultra 5G')).toBeHidden();
    await expect(page.getByText('No items in cart.')).toBeVisible();
  });

  test('can adjust multiple plan line counts simultaneously', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');   // $60/mo
    await addPlanToCart(page, 'Home Fiber'); // $45/mo

    await page.getByRole('link', { name: 'Cart' }).click();

    // Initial total: $105
    await expect(page.getByText('$105.00/mo')).toBeVisible();

    // Find the Ultra 5G row and add a line
    const ultraRow = page.locator('div').filter({ hasText: /Ultra 5G.*\$/ }).first();
    await ultraRow.getByRole('button', { name: 'Add a line' }).click();

    // Total should now be $165 ($120 + $45)
    await expect(page.getByText('$165.00/mo')).toBeVisible();
  });

  test('save checkout button creates a todo item and shows success notification', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');

    await page.getByRole('link', { name: 'Cart' }).click();

    // Fill in the form
    await page.getByPlaceholder('Enter your full name').fill('Test Buyer');
    await page.getByPlaceholder('Enter your email').fill('buyer@example.com');
    await page.getByPlaceholder('xxx-xxx-xxxx').fill('555-123-4567');
    await page.getByPlaceholder('Enter your address').fill('1 Main St, Austin, TX');

    // Click Save Checkout
    await page.getByRole('button', { name: 'Save Checkout' }).click();

    // Should show success notification
    await expect(page.getByRole('status')).toContainText('Todo item created successfully!');

    // The notification should have an action button
    await expect(page.getByRole('button', { name: 'Set due date?' })).toBeVisible();
  });

  test('save checkout notification can open due date picker', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');

    await page.getByRole('link', { name: 'Cart' }).click();

    // Fill in the form
    await page.getByPlaceholder('Enter your full name').fill('Test Buyer');
    await page.getByPlaceholder('Enter your email').fill('buyer@example.com');
    await page.getByPlaceholder('xxx-xxx-xxxx').fill('555-123-4567');
    await page.getByPlaceholder('Enter your address').fill('1 Main St, Austin, TX');

    // Click Save Checkout
    await page.getByRole('button', { name: 'Save Checkout' }).click();

    // Wait for notification to appear
    await expect(page.getByRole('status')).toContainText('Todo item created successfully!');

    // Click "Set due date?" button in the notification
    await page.getByRole('button', { name: 'Set due date?' }).click();

    // Should show a popover with due date input
    await expect(page.getByText('Set due date (optional)')).toBeVisible();

    // Should have a Done button
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  test('save checkout button is disabled after checkout is saved', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');

    await page.getByRole('link', { name: 'Cart' }).click();

    // Fill in the form
    await page.getByPlaceholder('Enter your full name').fill('Test Buyer');
    await page.getByPlaceholder('Enter your email').fill('buyer@example.com');
    await page.getByPlaceholder('xxx-xxx-xxxx').fill('555-123-4567');
    await page.getByPlaceholder('Enter your address').fill('1 Main St, Austin, TX');

    const saveCheckoutButton = page.getByRole('button', { name: 'Save Checkout' });
    await expect(saveCheckoutButton).toBeEnabled();

    // Click Save Checkout
    await saveCheckoutButton.click();

    // Button should be disabled after saving
    await expect(saveCheckoutButton).toBeDisabled();
  });

  test('save checkout can be updated by adding more lines', async ({ page }) => {
    await setActiveCustomer(page);
    await addPlanToCart(page, 'Ultra 5G');

    await page.getByRole('link', { name: 'Cart' }).click();

    // Fill in the form
    await page.getByPlaceholder('Enter your full name').fill('Test Buyer');
    await page.getByPlaceholder('Enter your email').fill('buyer@example.com');
    await page.getByPlaceholder('xxx-xxx-xxxx').fill('555-123-4567');
    await page.getByPlaceholder('Enter your address').fill('1 Main St, Austin, TX');

    // Save checkout
    await page.getByRole('button', { name: 'Save Checkout' }).click();
    await expect(page.getByRole('status')).toContainText('Todo item created successfully!');

    // Add a line to the plan using the correct scoped selector
    const planRow = page.locator('div').filter({ hasText: /Ultra 5G.*\$/ }).first();
    await planRow.getByRole('button', { name: 'Add a line' }).click();

    // Save Checkout button should now be enabled again since cart changed
    const saveCheckoutButton = page.getByRole('button', { name: 'Save Checkout' });
    await expect(saveCheckoutButton).toBeEnabled();

    // Saving again should update the todo (show update message)
    await saveCheckoutButton.click();
    await expect(page.getByRole('status')).toContainText('Todo item updated successfully!');
  });
});
