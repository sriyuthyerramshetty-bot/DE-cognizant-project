const CARTS_CACHE_KEY = 'todo-app.carts-cache'
const CART_ITEMS_CACHE_KEY = 'todo-app.cart-items-cache'
const PLANS_CACHE_KEY = 'todo-app.plans-cache'

const CARTS_TABLE = 'carts'
const CART_ITEMS_TABLE = 'cart_items'
const PLANS_TABLE = 'plans'

export class CartStorage {
  constructor(connection) {
    this.connection = connection
  }

  isBrowser() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }

  parseStoredJson(key, fallbackValue) {
    if (!this.isBrowser()) {
      return fallbackValue
    }

    try {
      const raw = window.localStorage.getItem(key)

      if (!raw) {
        return fallbackValue
      }

      const parsed = JSON.parse(raw)
      return parsed ?? fallbackValue
    } catch {
      return fallbackValue
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  // ============ Cache Methods ============

  loadCachedCarts() {
    return this.parseStoredJson(CARTS_CACHE_KEY, [])
  }

  saveCachedCarts(carts) {
    if (!this.isBrowser()) return
    window.localStorage.setItem(CARTS_CACHE_KEY, JSON.stringify(carts))
  }

  updateCachedCart(cart) {
    if (!this.isBrowser() || !cart) return

    const cached = this.loadCachedCarts()
    const index = cached.findIndex((c) => c.id === cart.id)

    if (index >= 0) {
      cached[index] = cart
    } else {
      cached.unshift(cart)
    }

    this.saveCachedCarts(cached)
  }

  loadCachedPlans() {
    return this.parseStoredJson(PLANS_CACHE_KEY, [])
  }

  saveCachedPlans(plans) {
    if (!this.isBrowser()) return
    window.localStorage.setItem(PLANS_CACHE_KEY, JSON.stringify(plans))
  }

  // ============ Transform Helpers ============

  transformCartFromDb(dbCart) {
    if (!dbCart) return null

    return {
      id: dbCart.id,
      customerId: dbCart.customer_id,
      status: dbCart.status ?? 'draft',
      createdAt: dbCart.created_at,
      updatedAt: dbCart.updated_at,
    }
  }

  transformCartToDb(cart) {
    const dbCart = {}

    if (cart.id !== undefined) dbCart.id = cart.id
    if (cart.customerId !== undefined) dbCart.customer_id = cart.customerId
    if (cart.status !== undefined) dbCart.status = cart.status
    if (cart.updatedAt !== undefined) dbCart.updated_at = cart.updatedAt

    return dbCart
  }

  transformCartItemFromDb(dbItem) {
    if (!dbItem) return null

    return {
      id: dbItem.id,
      cartId: dbItem.cart_id,
      planId: dbItem.plan_id,
      lineCount: dbItem.line_count ?? 1,
      createdAt: dbItem.created_at,
    }
  }

  transformCartItemToDb(item) {
    const dbItem = {}

    if (item.id !== undefined) dbItem.id = item.id
    if (item.cartId !== undefined) dbItem.cart_id = item.cartId
    if (item.planId !== undefined) dbItem.plan_id = item.planId
    if (item.lineCount !== undefined) dbItem.line_count = item.lineCount

    return dbItem
  }

  transformPlanFromDb(dbPlan) {
    if (!dbPlan) return null

    return {
      id: dbPlan.id,
      name: dbPlan.name ?? '',
      type: dbPlan.type ?? '',
      network: dbPlan.network ?? '',
      speed: dbPlan.speed ?? '',
      price: `$${parseFloat(dbPlan.price) || 0}/mo`,
      monthlyPrice: parseFloat(dbPlan.price) || 0,
      bestValue: dbPlan.best_value ?? false,
      createdAt: dbPlan.created_at,
      updatedAt: dbPlan.updated_at,
    }
  }

  transformPlanToDb(plan) {
    const dbPlan = {}

    if (plan.id !== undefined) dbPlan.id = plan.id
    if (plan.name !== undefined) dbPlan.name = plan.name
    if (plan.type !== undefined) dbPlan.type = plan.type
    if (plan.network !== undefined) dbPlan.network = plan.network
    if (plan.speed !== undefined) dbPlan.speed = plan.speed
    if (plan.monthlyPrice !== undefined) dbPlan.price = plan.monthlyPrice
    if (plan.bestValue !== undefined) dbPlan.best_value = plan.bestValue

    return dbPlan
  }

  // ============ Plans Database Methods ============

  async fetchPlans() {
    const { data, error } = await this.connection.fetchAll(PLANS_TABLE, {
      orderBy: 'name',
      ascending: true,
    })

    if (error) {
      const cached = this.loadCachedPlans()
      return { data: cached, error, fromCache: true }
    }

    const plans = data.map((row) => this.transformPlanFromDb(row))

    this.saveCachedPlans(plans)
    return { data: plans, error: null, fromCache: false }
  }

  async fetchPlanById(planId) {
    const cached = this.loadCachedPlans()
    const cachedPlan = cached.find((p) => p.id === planId)

    const { data, error } = await this.connection.fetchById(PLANS_TABLE, 'id', planId)

    if (error) {
      return { data: cachedPlan ?? null, error, fromCache: Boolean(cachedPlan) }
    }

    return { data: this.transformPlanFromDb(data), error: null }
  }

  // ============ Carts Database Methods ============

  async fetchCartsForCustomer(customerId) {
    const { data, error } = await this.connection.fetchAll(CARTS_TABLE, {
      orderBy: 'created_at',
      ascending: false,
    })

    if (error) {
      return { data: [], error }
    }

    const carts = data
      .filter((row) => row.customer_id === customerId)
      .map((row) => this.transformCartFromDb(row))

    return { data: carts, error: null }
  }

  async fetchCartById(cartId) {
    const { data, error } = await this.connection.fetchById(CARTS_TABLE, 'id', cartId)

    if (error) {
      return { data: null, error }
    }

    return { data: this.transformCartFromDb(data), error: null }
  }

  async fetchDraftCartForCustomer(customerId) {
    const { data: allCarts, error } = await this.connection.fetchAll(CARTS_TABLE)

    if (error) {
      return { data: null, error }
    }

    const draftCart = allCarts.find(
      (cart) => cart.customer_id === customerId && cart.status === 'draft'
    )

    return { data: draftCart ? this.transformCartFromDb(draftCart) : null, error: null }
  }

  async createCart(customerId) {
    const newCart = {
      id: this.generateUUID(),
      customer_id: customerId,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await this.connection.insert(CARTS_TABLE, newCart)

    if (error) {
      return { data: null, error }
    }

    const cart = this.transformCartFromDb(data)
    this.updateCachedCart(cart)
    return { data: cart, error: null }
  }

  async updateCartStatus(cartId, status) {
    const { data, error } = await this.connection.update(CARTS_TABLE, 'id', cartId, {
      status,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return { data: null, error }
    }

    const cart = this.transformCartFromDb(data)
    this.updateCachedCart(cart)
    return { data: cart, error: null }
  }

  async deleteCart(cartId) {
    return await this.connection.delete(CARTS_TABLE, 'id', cartId)
  }

  // ============ Cart Items Database Methods ============

  async fetchCartItems(cartId) {
    const { data, error } = await this.connection.fetchAll(CART_ITEMS_TABLE)

    if (error) {
      return { data: [], error }
    }

    const items = data
      .filter((row) => row.cart_id === cartId)
      .map((row) => this.transformCartItemFromDb(row))

    return { data: items, error: null }
  }

  async fetchCartItemsWithPlans(cartId) {
    const { data: items, error: itemsError } = await this.fetchCartItems(cartId)

    if (itemsError) {
      return { data: [], error: itemsError }
    }

    const { data: plans } = await this.fetchPlans()
    const plansMap = new Map(plans.map((p) => [p.id, p]))

    const itemsWithPlans = items.map((item) => ({
      ...item,
      plan: plansMap.get(item.planId) ?? null,
    }))

    return { data: itemsWithPlans, error: null }
  }

  async addItemToCart(cartId, planId, lineCount = 1) {
    // Check if item already exists
    const { data: existingItems } = await this.fetchCartItems(cartId)
    const existingItem = existingItems.find((item) => item.planId === planId)

    if (existingItem) {
      // Update line count
      return await this.updateCartItemLineCount(existingItem.id, existingItem.lineCount + lineCount)
    }

    const newItem = {
      id: this.generateUUID(),
      cart_id: cartId,
      plan_id: planId,
      line_count: lineCount,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await this.connection.insert(CART_ITEMS_TABLE, newItem)

    if (error) {
      return { data: null, error }
    }

    return { data: this.transformCartItemFromDb(data), error: null }
  }

  async updateCartItemLineCount(itemId, lineCount) {
    if (lineCount <= 0) {
      return await this.removeCartItem(itemId)
    }

    const { data, error } = await this.connection.update(CART_ITEMS_TABLE, 'id', itemId, {
      line_count: lineCount,
    })

    if (error) {
      return { data: null, error }
    }

    return { data: this.transformCartItemFromDb(data), error: null }
  }

  async removeCartItem(itemId) {
    return await this.connection.delete(CART_ITEMS_TABLE, 'id', itemId)
  }

  async clearCart(cartId) {
    const { data: items } = await this.fetchCartItems(cartId)

    for (const item of items) {
      await this.removeCartItem(item.id)
    }

    return { success: true, error: null }
  }

  // ============ High-Level Methods ============

  async getOrCreateDraftCart(customerId) {
    // Try to find existing draft cart
    const { data: existingCart } = await this.fetchDraftCartForCustomer(customerId)

    if (existingCart) {
      return { data: existingCart, error: null, isNew: false }
    }

    // Create new cart
    const { data: newCart, error } = await this.createCart(customerId)

    if (error) {
      return { data: null, error, isNew: false }
    }

    return { data: newCart, error: null, isNew: true }
  }

  // Get existing cart (draft OR saved) or create new one - used for saveCheckout to reuse the same cart
  async getOrCreateCartForCheckout(customerId) {
    const { data: allCarts, error } = await this.connection.fetchAll(CARTS_TABLE)

    if (error) {
      console.error('[CartStorage] Error fetching carts:', error)
      return { data: null, error, isNew: false }
    }

    // Filter to carts for this customer that are draft or saved
    const customerCarts = allCarts
      ?.filter(
        (cart) =>
          cart.customer_id === customerId &&
          (cart.status === 'draft' || cart.status === 'saved')
      )
      // Sort by updated_at descending to get the most recent
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))

    console.log('[CartStorage] Customer carts found:', customerCarts?.map(c => ({ id: c.id, status: c.status, updated_at: c.updated_at })))

    const existingCart = customerCarts?.[0] // Get most recently updated

    if (existingCart) {
      console.log('[CartStorage] Using existing cart:', existingCart.id, 'status:', existingCart.status)
      return { data: this.transformCartFromDb(existingCart), error: null, isNew: false }
    }

    console.log('[CartStorage] No existing cart found, creating new one')
    // Create new cart
    const { data: newCart, error: createError } = await this.createCart(customerId)

    if (createError) {
      return { data: null, error: createError, isNew: false }
    }

    console.log('[CartStorage] Created new cart:', newCart?.id)
    return { data: newCart, error: null, isNew: true }
  }

  async getCartWithItems(customerId) {
    const { data: cart } = await this.fetchDraftCartForCustomer(customerId)

    if (!cart) {
      return { cart: null, items: [] }
    }

    const { data: items } = await this.fetchCartItemsWithPlans(cart.id)

    return { cart, items: items ?? [] }
  }

  async addPlanToCart(customerId, planId, lineCount = 1) {
    const { data: cart, error: cartError } = await this.getOrCreateDraftCart(customerId)

    if (cartError || !cart) {
      return { success: false, error: cartError?.message ?? 'Failed to get cart' }
    }

    const { error: itemError } = await this.addItemToCart(cart.id, planId, lineCount)

    if (itemError) {
      return { success: false, error: itemError.message ?? 'Failed to add item' }
    }

    // Update cart timestamp
    await this.connection.update(CARTS_TABLE, 'id', cart.id, {
      updated_at: new Date().toISOString(),
    })

    return { success: true, error: null, cartId: cart.id }
  }

  async removePlanFromCart(customerId, planId) {
    const { data: cart } = await this.fetchDraftCartForCustomer(customerId)

    if (!cart) {
      return { success: false, error: 'No cart found' }
    }

    const { data: items } = await this.fetchCartItems(cart.id)
    const item = items.find((i) => i.planId === planId)

    if (!item) {
      return { success: false, error: 'Item not in cart' }
    }

    await this.removeCartItem(item.id)

    return { success: true, error: null }
  }

  async updatePlanLineCount(customerId, planId, lineCount) {
    const { data: cart } = await this.fetchDraftCartForCustomer(customerId)

    if (!cart) {
      return { success: false, error: 'No cart found' }
    }

    const { data: items } = await this.fetchCartItems(cart.id)
    const item = items.find((i) => i.planId === planId)

    if (!item) {
      return { success: false, error: 'Item not in cart' }
    }

    await this.updateCartItemLineCount(item.id, lineCount)

    return { success: true, error: null }
  }

  async saveCheckoutCart(customerId, cartItems) {
    if (!customerId || !cartItems || cartItems.length === 0) {
      return { success: false, error: 'No items to save', cartId: null }
    }

    // Get or create a cart for this customer (reuses existing draft/saved cart)
    const { data: cart, error: cartError } = await this.getOrCreateCartForCheckout(customerId)

    if (cartError || !cart) {
      return { success: false, error: cartError?.message ?? 'Failed to create cart', cartId: null }
    }

    // Clear existing items in the cart
    await this.clearCart(cart.id)

    // Add each item from the local cart to the database cart
    // Note: Local plans have numeric IDs, but cart_items.plan_id expects UUID
    // So we need to find matching plans in the database by name
    const { data: dbPlans, error: plansError } = await this.fetchPlans()
    
    if (plansError || !dbPlans || dbPlans.length === 0) {
      console.error('Failed to fetch plans from database:', plansError)
      return { success: false, error: 'Could not fetch plans from database', cartId: cart.id }
    }

    // Create a map for case-insensitive matching
    const dbPlansMap = new Map(dbPlans.map((p) => [p.name.toLowerCase().trim(), p]))

    let itemsSaved = 0
    for (const item of cartItems) {
      // Try to find a matching plan in the database by name (case-insensitive)
      const itemName = (item.name || '').toLowerCase().trim()
      const dbPlan = dbPlansMap.get(itemName)
      
      if (dbPlan) {
        const lineCount = item.lines ?? 1
        const { error: itemError } = await this.addItemToCart(cart.id, dbPlan.id, lineCount)

        if (itemError) {
          console.error('Failed to add item to cart:', itemError)
        } else {
          itemsSaved++
        }
      } else {
        console.warn(`Plan "${item.name}" not found in database. Available plans:`, dbPlans.map(p => p.name))
      }
    }

    // Update cart status to 'saved' and timestamp
    const { data: updatedCart, error: updateError } = await this.updateCartStatus(cart.id, 'saved')

    if (updateError) {
      return { success: false, error: 'Failed to update cart status', cartId: cart.id }
    }

    return { 
      success: true, 
      error: null, 
      cartId: cart.id, 
      cart: updatedCart,
      itemsSaved,
      itemsSkipped: cartItems.length - itemsSaved
    }
  }

  async loadSavedCart(customerId) {
    // Find saved cart for customer (from any employee)
    const { data: allCarts } = await this.connection.fetchAll(CARTS_TABLE)
    
    // Get most recent saved cart for this customer
    const customerSavedCarts = allCarts
      ?.filter((cart) => cart.customer_id === customerId && cart.status === 'saved')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))

    const savedCart = customerSavedCarts?.[0]

    if (!savedCart) {
      return { cart: null, items: [] }
    }

    const { data: itemsWithPlans } = await this.fetchCartItemsWithPlans(savedCart.id)

    // Flatten items with plan data for easier use
    const items = (itemsWithPlans ?? []).map(item => ({
      ...item,
      // Include plan details directly on the item
      planName: item.plan?.name,
      planPrice: item.plan?.price,
      planType: item.plan?.type,
      network: item.plan?.network,
      speed: item.plan?.speed,
      bestValue: item.plan?.bestValue,
    }))

    return { 
      cart: this.transformCartFromDb(savedCart), 
      items
    }
  }
}
