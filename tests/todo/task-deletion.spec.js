import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

test.describe('Task Deletion', () => {
  let home

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page)
    await home.goto()
  })

  // Single deletion

  test('deleting the default task removes it from the list', async () => {
    // Hover to expose the delete button, then delete
    await home.deleteTask('Jogging')
    await expect(home.taskRow('Jogging')).toHaveCount(0)
  })

  test('deleting a task does not remove other tasks', async () => {
    await home.addTask('Keep this')
    await home.deleteTask('Jogging')
    await expect(home.taskRow('Keep this')).toBeVisible()
  })

  // Multiple deletions

  test('multiple tasks can be deleted one after another', async () => {
    await home.addTask('Task One')
    await home.addTask('Task Two')
    await home.deleteTask('Task One')
    await home.deleteTask('Task Two')
    await expect(home.taskRow('Task One')).toHaveCount(0)
    await expect(home.taskRow('Task Two')).toHaveCount(0)
  })

  // Empty state

  test('deleting all tasks leaves no task rows visible', async () => {
    await home.deleteTask('Jogging')
    await expect(home.page.locator('[data-task-row-id]')).toHaveCount(0)
  })

  test('"Add New Task" button remains enabled after all tasks are deleted', async () => {
    await home.deleteTask('Jogging')
    await expect(home.addTaskButton).toBeEnabled()
  })

  // Deletion of completed tasks

  test('a completed task can be deleted from the Completed view', async () => {
    await home.addTask('Temp task')
    await home.completeTask('Temp task')
    await home.switchView('completed')
    await home.deleteTask('Temp task')
    await expect(home.taskRow('Temp task')).toHaveCount(0)
  })

  test('deleting from Completed view does not affect Active tasks', async () => {
    await home.addTask('Active task')
    await home.addTask('Done task')
    await home.completeTask('Done task')
    await home.switchView('completed')
    await home.deleteTask('Done task')
    await home.switchView('active')
    await expect(home.taskRow('Active task')).toBeVisible()
  })

  // New task then delete 

  test('a task added then immediately deleted is gone', async () => {
    await home.addTask('Ephemeral task')
    await home.deleteTask('Ephemeral task')
    await expect(home.taskRow('Ephemeral task')).toHaveCount(0)
  })
})
