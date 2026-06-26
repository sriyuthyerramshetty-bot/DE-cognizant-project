import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { TodoPage } from '../pages/TodoPage';
import { placeholder } from '../utils/placeholderTags';

test.describe.skip(placeholder('todo tests'), () => {
  test('todo page loads', async ({ page }) => {
    const home = new HomePage(page);
    const todo = new TodoPage(page);

    await home.goto();
    await home.goToTodo();
    await todo.expectLoaded();
  });
});
