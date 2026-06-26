import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { placeholder } from '../utils/placeholderTags';

test.describe.skip(placeholder('navigation tests'), () => {
  test('can navigate to cart', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.goToCart();
  });

  test('can navigate to todo', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.goToTodo();
  });
});
