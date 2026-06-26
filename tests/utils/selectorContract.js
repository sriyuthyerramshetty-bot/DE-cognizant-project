export const selectors = {
  home: {
    navCart: '[data-testid="nav-cart"]',
    navTodo: '[data-testid="nav-todo"]',
  },

  cart: {
    total: '[data-testid="cart-total"]',
    itemRow: '[data-testid="cart-item-row"]',
  },

  todo: {
    input: '[data-testid="todo-input"]',
    addButton: '[data-testid="todo-add"]',
    item: '[data-testid="todo-item"]',
  }
};
