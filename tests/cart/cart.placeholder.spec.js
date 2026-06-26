import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CartPage } from '../pages/CartPage';
import { placeholder } from '../utils/placeholderTags';

test.describe.skip(placeholder('cart tests'), () => {
  test('cart loads', async ({ page }) => {
    const home = new HomePage(page);
    const cart = new CartPage(page);

    await home.goto();
    await home.goToCart();
    await cart.expectLoaded();
  });
});
