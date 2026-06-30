import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { PlanPagePOM } from '../pages/PlanPagePOM'
import { CartPagePOM } from '../pages/CartPagePOM'

test.describe('Cart', () => {
  let home
  let planPage
  let cartPage

  test.beforeEach(async ({ page }) => {
    home     = new HomePage(page)
    planPage = new PlanPagePOM(page)
    cartPage = new CartPagePOM(page)
    await home.goto()
  })

  // Cart page renders 
  test('Cart page shows a heading and Order Summary section', async () => {
    await home.goToCart()
    await expect(cartPage.heading).toBeVisible()
    await expect(cartPage.orderSummaryHeading).toBeVisible()
  })

  test('Cart page shows empty message when no items are added', async () => {
    await home.goToCart()
    await expect(cartPage.emptyMessage).toBeVisible()
  })

  test('Cart page does not show a total row when empty', async () => {
    await home.goToCart()
    await expect(cartPage.totalRow).not.toBeVisible()
  })

  // Adding items

  test('adding a plan from Plans page makes it appear in the Cart', async ({ page }) => {
    await home.goToPlans()
    await planPage.addPlanToCart('Ultra 5G')
    await home.goToCart()
    await expect(cartPage.cartItem('Ultra 5G')).toBeVisible()
  })

  test('"Add to Cart" button changes to "Added" after clicking', async ({ page }) => {
    await home.goToPlans()
    const btn = planPage.addToCartButton('Ultra 5G')
    await btn.click()
    await expect(btn).toContainText('Added')
  })

  test('"Added" button is disabled after plan is added', async ({ page }) => {
    await home.goToPlans()
    const btn = planPage.addToCartButton('Ultra 5G')
    await btn.click()
    await expect(btn).toBeDisabled()
  })

  test('multiple plans can be added to the cart', async ({ page }) => {
    await home.goToPlans()
    await planPage.addPlanToCart('Ultra 5G')
    await planPage.addPlanToCart('Home Fiber')
    await home.goToCart()
    await expect(cartPage.cartItem('Ultra 5G')).toBeVisible()
    await expect(cartPage.cartItem('Home Fiber')).toBeVisible()
  })

  // Removing items

  test('removing a plan from the cart makes it disappear', async ({ page }) => {
    await home.goToPlans()
    await planPage.addPlanToCart('Ultra 5G')
    await home.goToCart()
    await cartPage.removePlan('Ultra 5G')
    await expect(cartPage.cartItem('Ultra 5G')).toHaveCount(0)
  })

  test('removing a plan shows empty message when cart becomes empty', async ({ page }) => {
    await home.goToPlans()
    await planPage.addPlanToCart('Ultra 5G')
    await home.goToCart()
    await cartPage.removePlan('Ultra 5G')
    await expect(cartPage.emptyMessage).toBeVisible()
  })

  test('removing one plan does not remove other plans', async ({ page }) => {
    await home.goToPlans()
    await planPage.addPlanToCart('Ultra 5G')
    await planPage.addPlanToCart('Home Fiber')
    await home.goToCart()
    await cartPage.removePlan('Ultra 5G')
    await expect(cartPage.cartItem('Home Fiber')).toBeVisible()
  })

  // Totals

  test('total row appears when at least one item is in the cart', async ({ page }) => {
    await home.goToPlans()
    await planPage.addPlanToCart('Ultra 5G')
    await home.goToCart()
    await expect(cartPage.totalRow).toBeVisible()
  })

  test('total reflects the price of a single added plan', async ({ page }) => {
    // Ultra 5G is $60/mo
    await home.goToPlans()
    await planPage.addPlanToCart('Ultra 5G')
    await home.goToCart()
    await expect(cartPage.totalAmount).toContainText('$60.00/mo')
  })

  test('total reflects the sum of multiple plan prices', async ({ page }) => {
    // Ultra 5G $60 + Home Fiber $45 = $105
    await home.goToPlans()
    await planPage.addPlanToCart('Ultra 5G')
    await planPage.addPlanToCart('Home Fiber')
    await home.goToCart()
    await expect(cartPage.totalAmount).toContainText('$105.00/mo')
  })

  test('total updates correctly after removing a plan', async ({ page }) => {
    await home.goToPlans()
    await planPage.addPlanToCart('Ultra 5G')
    await planPage.addPlanToCart('Home Fiber')
    await home.goToCart()
    await cartPage.removePlan('Ultra 5G')
    // Only Home Fiber $45 remains
    await expect(cartPage.totalAmount).toContainText('$45.00/mo')
  })

  // UserInfoBox

  test('Cart page shows a Your Information form', async () => {
    await home.goToCart()
    await expect(home.page.getByRole('heading', { name: /your information/i })).toBeVisible()
  })

  test('Your Information form has all required fields', async ({ page }) => {
    await home.goToCart()
    // Labels in UserInfoBox are not for/id-linked to inputs, so we match by placeholder
    await expect(page.getByPlaceholder('John Doe')).toBeVisible()
    await expect(page.getByPlaceholder('john@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('xxx-xxx-xxxx')).toBeVisible()
    await expect(page.getByPlaceholder('123 Main St')).toBeVisible()
  })

  test('Place Order button is visible on the Cart page', async () => {
    await home.goToCart()
    await expect(
      home.page.getByRole('button', { name: /place order/i })
    ).toBeVisible()
  })
})
