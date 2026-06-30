/**
 * Page Object Model for the Plans page (/plan).
 */
export class PlanPagePOM {
  constructor(page) {
    this.page = page

    this.heading        = page.getByRole('heading', { name: /^plans$/i })
    this.searchInput    = page.getByPlaceholder('Search for plans...')
    this.filterDropdown = page.getByRole('combobox', { name: /filter and sort plans/i })
    this.noResults      = page.getByText(/no plans found/i)
  }

  async goto() {
    await this.page.goto('/plan')
  }

  /** Locates a plan card by plan name (the h2 inside the card). */
  planCard(planName) {
    return this.page.locator('.h-48').filter({ hasText: planName })
  }

  /**
   * Locates the "Add to Cart" / "Added" button inside a plan card.
   * Matches either text so it works before and after adding.
   */
  addToCartButton(planName) {
    return this.planCard(planName).getByRole('button', { name: /add to cart|added/i })
  }

  /** Adds a plan to the cart if it has not already been added. */
  async addPlanToCart(planName) {
    const btn = this.addToCartButton(planName)
    await btn.waitFor({ state: 'visible' })
    const text = await btn.textContent()
    if (!text?.toLowerCase().includes('added')) {
      await btn.click()
    }
  }
}
