import { test, expect } from '@playwright/test';
import { mockFirebaseAuth, loginAsTestUser, TEST_USER } from '../utils/mockAuth';

test.describe('Authentication', () => {
  test('login page renders the sign-in form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Verizon Employee Portal' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('protected routes redirect to /login when signed out', async ({ page }) => {
    for (const path of ['/plan', '/cart', '/customers']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    }
  });

  test('shows an error message for invalid credentials', async ({ page }) => {
    await mockFirebaseAuth(page);
    await page.goto('/login');

    await page.getByPlaceholder('Enter your email').fill('wrong@example.com');
    await page.getByPlaceholder('Enter your password').fill('badpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByRole('alert')).toHaveText('Invalid email or password.');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('successful login navigates to the To-Do page', async ({ page }) => {
    await loginAsTestUser(page);

    await expect(page.getByRole('heading', { name: /Good Morning/ })).toBeVisible();
  });

  test('password visibility can be toggled', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.getByPlaceholder('Enter your password');

    await passwordInput.fill('secret');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('logout returns the user to the login page', async ({ page }) => {
    await loginAsTestUser(page);

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Session is gone — visiting a protected page redirects back to login.
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('sidebar shows the logged-in user', async ({ page }) => {
    await loginAsTestUser(page);

    await expect(page.getByText(TEST_USER.email)).toBeVisible();
  });
});
