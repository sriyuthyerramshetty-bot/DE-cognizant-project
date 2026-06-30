import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

test.describe('Task Creation', () => {
  let home

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page)
    await home.goto()
  })

  test('clicking "Add New Task" shows an editable text input', async () => {
    await home.addTaskButton.click()
    await expect(home.taskNameInput).toBeVisible()
  })

  test('new task appears in the list after typing a name and pressing Enter', async () => {
    await home.addTask('Buy groceries')
    await expect(home.taskRow('Buy groceries')).toBeVisible()
  })

  test('input field is removed after a task is committed', async () => {
    await home.addTask('Learn Playwright')
    // The editing input should no longer be in the DOM
    await expect(home.taskNameInput).not.toBeAttached()
  })

  test('newly added task name is shown as text (not inside an input)', async () => {
    await home.addTask('Evening walk')
    const taskText = home.taskRow('Evening walk').locator('p', { hasText: 'Evening walk' })
    await expect(taskText).toBeVisible()
  })

  test('new task is placed in the Active view (default category)', async () => {
    await home.addTask('Morning run')
    await expect(home.categorySelect).toHaveValue('active')
    await expect(home.taskRow('Morning run')).toBeVisible()
  })

  test('new task does not appear in the Completed view', async () => {
    await home.addTask('Read a book')
    await home.switchView('completed')
    await expect(home.taskRow('Read a book')).toHaveCount(0)
  })

  test('"Add New Task" button is disabled while an unnamed task is pending', async () => {
    await home.addTaskButton.click()
    // No name typed yet — button must be disabled to prevent duplicate empty tasks
    await expect(home.addTaskButton).toBeDisabled()
  })

  test('"Add New Task" button is disabled when viewing Completed tasks', async () => {
    await home.switchView('completed')
    await expect(home.addTaskButton).toBeDisabled()
  })

  test('pressing Enter on an empty input does not commit the task', async () => {
    await home.addTaskButton.click()
    await home.taskNameInput.press('Enter')
    // Input must still be present — empty task was not committed
    await expect(home.taskNameInput).toBeVisible()
  })

  test('multiple tasks can be added sequentially', async () => {
    await home.addTask('Task Alpha')
    await home.addTask('Task Beta')
    await expect(home.taskRow('Task Alpha')).toBeVisible()
    await expect(home.taskRow('Task Beta')).toBeVisible()
  })
})
