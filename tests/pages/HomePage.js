/**
 * Page Object Model for the Home (Todo) page.
 * Encapsulates locators and actions so specs stay concise and readable.
 */
export class HomePage {
  constructor(page) {
    this.page = page

    // Layout 
    this.sidebar     = page.locator('aside')
    this.mainSection = page.locator('section.flex-1')

    // Sidebar navigation links
    this.navHome     = page.getByRole('link', { name: /home/i })
    this.navCalendar = page.getByRole('link', { name: /calendar/i })
    this.navSettings = page.getByRole('link', { name: /settings/i })
    this.navPlans    = page.getByRole('link', { name: /plans/i })
    this.navCart     = page.getByRole('link', { name: /cart/i })

    // Home-page content
    this.heading        = page.getByRole('heading', { name: /good morning/i })
    this.subHeading     = page.getByText(/where would you like to start today/i)
    this.categorySelect = page.getByRole('combobox', { name: /task category/i })
    this.addTaskButton  = page.getByRole('button', { name: /add new task/i })

    // Task editing
    // The text input that appears when a task is in editing mode
    this.taskNameInput = page.locator('[data-task-name-input="true"]')

    // Sidebar logout button
    this.logoutButton = page.getByRole('button', { name: /sign out/i })
  }

  // ── Auth helpers ───────────────────────────────────────────────────────────

  /** Fills the login form and waits for the home route. */
  async login() {
    await this.page.getByPlaceholder('Enter your email').fill('test@test.com')
    await this.page.getByPlaceholder('Enter your password').fill('password123')
    await this.page.getByRole('button', { name: /sign in/i }).click()
    await this.page.waitForURL(/\/$/, { timeout: 10_000 })
  }

  /** Navigates to the app — logs in first since all routes are protected. */
  async goto() {
    await this.page.goto('/login')
    await this.login()
  }

  // Task locators

  /** The task row container (has the data-task-row-id attribute). */
  taskRow(taskName) {
    return this.page.locator('[data-task-row-id]').filter({ hasText: taskName })
  }

  /** The "Complete <name>" button for a task. */
  completeButton(taskName) {
    return this.page.getByRole('button', { name: `Complete ${taskName}` })
  }

  /** The "Edit <name>" button for a task. */
  editButton(taskName) {
    return this.page.getByRole('button', { name: `Edit ${taskName}` })
  }

  /** The "Delete <name>" button for a task. */
  deleteButton(taskName) {
    return this.page.getByRole('button', { name: `Delete ${taskName}` })
  }

  // Task actions
  /**
   * Clicks "+ Add New Task", types a name and presses Enter to commit.
   * Waits for the input to appear before typing.
   */
  async addTask(taskName) {
    await this.addTaskButton.click()
    await this.taskNameInput.waitFor({ state: 'visible' })
    await this.taskNameInput.fill(taskName)
    await this.taskNameInput.press('Enter')
  }

  /**
   * Clicks the complete/restore toggle for a task.
   * For active tasks this completes them; for completed tasks it restores them.
   */
  async completeTask(taskName) {
    await this.completeButton(taskName).click()
  }

  /**
   * Hovers over the task row to expose the Delete button, then clicks it.
   * Works for both editing-mode tasks (always visible) and normal tasks (hover-only).
   */
  async deleteTask(taskName) {
    const row = this.taskRow(taskName)
    await row.hover()
    await this.deleteButton(taskName).click()
  }

  /** Changes the Active / Completed view dropdown. */
  async switchView(view) {
    await this.categorySelect.selectOption(view)
  }

  // Navigation helpers

  async goToCart() {
    await this.navCart.click()
    await this.page.waitForURL(/\/cart$/)
  }

  async goToTodo() {
    await this.navHome.click()
    await this.page.waitForURL(/\/$/)
  }

  async goToCalendar() {
    await this.navCalendar.click()
    await this.page.waitForURL(/\/calendar$/)
  }

  async goToSettings() {
    await this.navSettings.click()
    await this.page.waitForURL(/\/settings$/)
  }

  async goToPlans() {
    await this.navPlans.click()
    await this.page.waitForURL(/\/plan$/)
  }
}
