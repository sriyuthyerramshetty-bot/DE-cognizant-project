/**
 * Page Object Model for the Cart page (/cart).
 */
export class CartPagePOM {
  constructor(page) {
    this.page = page

    this.heading             = page.getByRole('heading', { name: /my cart/i })
    this.orderSummaryHeading = page.getByRole('heading', { name: /order summary/i })
    this.emptyMessage        = page.getByText('No items in cart.')

    // The total row is only rendered when cart.length > 0
    this.totalRow    = page.locator('.pt-4.border-t').filter({ hasText: 'Total' })
    this.totalAmount = page.locator('.pt-4.border-t').filter({ hasText: 'Total' })
      .locator('span').last()
  }

  async goto() {
    await this.page.goto('/cart')
  }

  /**
   * Locates a cart item row by plan name.
   * Each row is a flex container with class border-b pb-2.
   */
  cartItem(planName) {
    return this.page.locator('.border-b.pb-2').filter({ hasText: planName })
  }

  /** Clicks the Remove button for a given plan. */
  async removePlan(planName) {
    await this.cartItem(planName)
      .getByRole('button', { name: /remove/i })
      .click()
  }
}
