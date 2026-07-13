import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../utils/mockAuth';

test.describe('To-Do list', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('shows the initial task', async ({ page }) => {
    await expect(page.getByText('Jogging')).toBeVisible();
  });

  test('can add a new task', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Task' }).click();

    const input = page.getByPlaceholder('Enter task name');
    await input.fill('Write Playwright tests');
    await input.press('Enter');

    await expect(page.getByText('Write Playwright tests')).toBeVisible();
  });

  test('Add Task is disabled while an unnamed task is pending', async ({ page }) => {
    const addButton = page.getByRole('button', { name: '+ Add Task' });
    await addButton.click();

    await expect(addButton).toBeDisabled();

    // Naming and committing the task re-enables the button.
    const input = page.getByPlaceholder('Enter task name');
    await input.fill('Named task');
    await input.press('Enter');
    await expect(addButton).toBeEnabled();
  });

  test('completing a task moves it to the Completed view', async ({ page }) => {
    await page.getByRole('button', { name: 'Complete Jogging' }).click();

    // Task animates out of the active list.
    await expect(page.getByText('Jogging')).toBeHidden();

    // Switch to the completed view and find it there.
    await page.getByLabel('Task category').selectOption('completed');
    await expect(page.getByText('Jogging')).toBeVisible();
  });

  test('a completed task can be restored', async ({ page }) => {
    await page.getByRole('button', { name: 'Complete Jogging' }).click();
    await page.getByLabel('Task category').selectOption('completed');
    await expect(page.getByText('Jogging')).toBeVisible();

    // Un-complete it, then check the active view again.
    await page.getByRole('button', { name: 'Complete Jogging' }).click();
    await page.getByLabel('Task category').selectOption('active');
    await expect(page.getByText('Jogging')).toBeVisible();
  });

  test('can delete a task', async ({ page }) => {
    const row = page.getByText('Jogging');
    await row.hover();
    await page.getByRole('button', { name: 'Delete Jogging' }).click();

    await expect(page.getByText('Jogging')).toBeHidden();
  });

  test('can edit an existing task name', async ({ page }) => {
    await page.getByText('Jogging').hover();
    await page.getByRole('button', { name: 'Edit Jogging' }).click();

    const input = page.getByPlaceholder('Enter task name');
    await input.fill('Morning Run');
    await input.press('Enter');

    await expect(page.getByText('Morning Run')).toBeVisible();
    await expect(page.getByText('Jogging')).toBeHidden();
  });

  test('Add Task is disabled in the Completed view', async ({ page }) => {
    await page.getByLabel('Task category').selectOption('completed');
    await expect(page.getByRole('button', { name: '+ Add Task' })).toBeDisabled();
  });
});
