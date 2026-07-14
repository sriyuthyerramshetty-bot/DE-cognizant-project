import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

test.describe('Task Completion', () => {
  let home

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page)
    await home.goto()
  })

  // Completing a task

  test('clicking the complete button removes the task from the Active view', async () => {
    await home.completeTask('Jogging')
    // After animation the row is gone from Active view
    await expect(home.taskRow('Jogging')).toHaveCount(0)
  })

  test('completed task appears in the Completed view', async () => {
    await home.completeTask('Jogging')
    await home.switchView('completed')
    await expect(home.taskRow('Jogging')).toBeVisible()
  })

  test('completed task name has a line-through style', async () => {
    await home.completeTask('Jogging')
    await home.switchView('completed')
    const taskText = home.taskRow('Jogging').locator('p', { hasText: 'Jogging' })
    await expect(taskText).toHaveClass(/line-through/)
  })

  test('completed task name has muted text colour', async () => {
    await home.completeTask('Jogging')
    await home.switchView('completed')
    const taskText = home.taskRow('Jogging').locator('p', { hasText: 'Jogging' })
    await expect(taskText).toHaveClass(/text-gray-400/)
  })

  // Restoring a completed task

  test('clicking the complete button on a completed task restores it', async () => {
    await home.completeTask('Jogging')
    await home.switchView('completed')
    // The complete button acts as a toggle — clicking again restores the task
    await home.completeTask('Jogging')
    await home.switchView('active')
    await expect(home.taskRow('Jogging')).toBeVisible()
  })

  test('restored task no longer has line-through styling', async () => {
    await home.completeTask('Jogging')
    await home.switchView('completed')
    await home.completeTask('Jogging')
    await home.switchView('active')
    const taskText = home.taskRow('Jogging').locator('p', { hasText: 'Jogging' })
    await expect(taskText).not.toHaveClass(/line-through/)
  })

  // Newly added task completion

  test('a freshly added task can be completed', async () => {
    await home.addTask('New task')
    await home.completeTask('New task')
    await expect(home.taskRow('New task')).toHaveCount(0)
    await home.switchView('completed')
    await expect(home.taskRow('New task')).toBeVisible()
  })

  // Category counts

  test('completing the only active task leaves an empty Active view', async () => {
    await home.completeTask('Jogging')
    // No task rows should be visible in Active view
    await expect(home.page.locator('[data-task-row-id]')).toHaveCount(0)
  })
})
