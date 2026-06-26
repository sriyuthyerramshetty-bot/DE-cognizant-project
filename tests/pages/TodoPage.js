import { selectors } from '../utils/selectorContract';

export class TodoPage {
  constructor(page) {
    this.page = page;
    this.input = page.locator(selectors.todo.input);
    this.addButton = page.locator(selectors.todo.addButton);
    this.item = page.locator(selectors.todo.item);
  }

  async expectLoaded() {
    await this.input.waitFor();
  }
}
