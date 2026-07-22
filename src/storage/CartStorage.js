const CART_STORAGE_KEY = 'cartsByCustomerId'
const CHECKOUT_SAVED_STORAGE_KEY = 'savedCheckoutByCustomerId'

export class CartStorage {
  loadCarts() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  saveCarts(cartByCustomerId) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartByCustomerId))
  }

  loadSavedCheckout() {
    try {
      const stored = localStorage.getItem(CHECKOUT_SAVED_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  saveSavedCheckout(savedCheckoutByCustomerId) {
    localStorage.setItem(CHECKOUT_SAVED_STORAGE_KEY, JSON.stringify(savedCheckoutByCustomerId))
  }

  getCartForCustomer(cartByCustomerId, customerId) {
    if (!customerId) {
      return []
    }
    return cartByCustomerId[customerId] ?? []
  }

  isCheckoutSavedForCustomer(savedCheckoutByCustomerId, customerId) {
    if (!customerId) {
      return false
    }
    return Boolean(savedCheckoutByCustomerId[customerId])
  }

  addToCart(cartByCustomerId, customerId, plan) {
    if (!customerId) {
      return cartByCustomerId
    }

    const currentCart = cartByCustomerId[customerId] ?? []

    if (currentCart.some((cartPlan) => cartPlan.id === plan.id)) {
      return cartByCustomerId
    }

    return {
      ...cartByCustomerId,
      [customerId]: [...currentCart, { ...plan, lines: 1 }],
    }
  }

  addLine(cartByCustomerId, customerId, plan) {
    if (!customerId) {
      return cartByCustomerId
    }

    const currentCart = cartByCustomerId[customerId] ?? []
    const exists = currentCart.some((cartPlan) => cartPlan.id === plan.id)

    const nextCart = exists
      ? currentCart.map((cartPlan) =>
          cartPlan.id === plan.id
            ? { ...cartPlan, lines: (cartPlan.lines ?? 1) + 1 }
            : cartPlan
        )
      : [...currentCart, { ...plan, lines: 1 }]

    return {
      ...cartByCustomerId,
      [customerId]: nextCart,
    }
  }

  removeLine(cartByCustomerId, customerId, planId) {
    if (!customerId) {
      return cartByCustomerId
    }

    const currentCart = cartByCustomerId[customerId] ?? []
    const target = currentCart.find((cartPlan) => cartPlan.id === planId)

    if (!target) {
      return cartByCustomerId
    }

    const nextCart =
      (target.lines ?? 1) <= 1
        ? currentCart.filter((cartPlan) => cartPlan.id !== planId)
        : currentCart.map((cartPlan) =>
            cartPlan.id === planId
              ? { ...cartPlan, lines: cartPlan.lines - 1 }
              : cartPlan
          )

    return {
      ...cartByCustomerId,
      [customerId]: nextCart,
    }
  }

  removeFromCart(cartByCustomerId, customerId, planId) {
    if (!customerId) {
      return cartByCustomerId
    }

    const currentCart = cartByCustomerId[customerId] ?? []

    return {
      ...cartByCustomerId,
      [customerId]: currentCart.filter((plan) => plan.id !== planId),
    }
  }

  markCheckoutSaved(savedCheckoutByCustomerId, customerId) {
    if (!customerId) {
      return savedCheckoutByCustomerId
    }

    return {
      ...savedCheckoutByCustomerId,
      [customerId]: true,
    }
  }

  clearCheckoutSaved(savedCheckoutByCustomerId, customerId) {
    if (!customerId) {
      return savedCheckoutByCustomerId
    }

    if (!savedCheckoutByCustomerId[customerId]) {
      return savedCheckoutByCustomerId
    }

    const nextSavedMap = { ...savedCheckoutByCustomerId }
    delete nextSavedMap[customerId]
    return nextSavedMap
  }

  clearCartForCustomer(cartByCustomerId, customerId) {
    if (!customerId) {
      return cartByCustomerId
    }

    const nextCarts = { ...cartByCustomerId }
    delete nextCarts[customerId]
    return nextCarts
  }
}
