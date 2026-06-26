import { selectors } from '../utils/selectorContract';

export class CartPage {
  constructor(page) {
    this.page = page;
    this.total = page.locator(selectors.cart.total);
    this.itemRow = page.locator(selectors.cart.itemRow);
  }

  async expectLoaded() {
    await this.total.waitFor();
  }
}
