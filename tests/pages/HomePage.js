import { selectors } from '../utils/selectorContract';

export class HomePage {
  constructor(page) {
    this.page = page;
    this.navCart = page.locator(selectors.home.navCart);
    this.navTodo = page.locator(selectors.home.navTodo);
  }

  async goto() {
    await this.page.goto('/');
  }

  async goToCart() {
    await this.navCart.click();
  }

  async goToTodo() {
    await this.navTodo.click();
  }
}
