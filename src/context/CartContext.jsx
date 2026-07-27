import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { CustomerContext } from './CustomerContext.jsx';
import { cartStorage } from '../storage/storageProvider.js';

const CartContext = createContext();

// Key the per-customer carts live under in the browser's localStorage.
const STORAGE_KEY = 'cartsByCustomerId';
const CHECKOUT_SAVED_STORAGE_KEY = 'savedCheckoutByCustomerId';

// Read any previously saved carts out of localStorage. This runs as the lazy
// initial state so the carts are already populated on the very first render
// after a reload (no empty flicker). Falls back to an empty map if nothing is
// stored or the stored value is somehow corrupt/unparseable.
function loadCarts() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function loadSavedCheckout() {
    try {
        const stored = localStorage.getItem(CHECKOUT_SAVED_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function normalizePlanName(value) {
    return (value ?? '').toString().trim().toLowerCase();
}

function matchesPlan(cartPlan, plan) {
    const planName = normalizePlanName(plan?.name || plan?.planName);
    const cartPlanName = normalizePlanName(cartPlan?.name || cartPlan?.planName);

    if (planName && cartPlanName && planName === cartPlanName) {
        return true;
    }

    const planId = normalizePlanName(plan?.id ?? plan?.planId);
    const cartPlanId = normalizePlanName(cartPlan?.id ?? cartPlan?.planId);

    return Boolean(planId && cartPlanId && planId === cartPlanId);
}

export function CartProvider({ children }) {
    const { activeCustomerId } = useContext(CustomerContext);
    const [cartByCustomerId, setCartByCustomerId] = useState(loadCarts);
    const [savedCheckoutByCustomerId, setSavedCheckoutByCustomerId] = useState(loadSavedCheckout);
    const [loadingCart, setLoadingCart] = useState(false);

    // Persist every customer's cart back to localStorage whenever they change so
    // the carts survive a page reload. This is the localStorage equivalent of the
    // "subscribe" pattern used for auth: state changes -> write to storage, and
    // loadCarts() above reads it back on the next load.
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartByCustomerId));
    }, [cartByCustomerId]);

    useEffect(() => {
        localStorage.setItem(CHECKOUT_SAVED_STORAGE_KEY, JSON.stringify(savedCheckoutByCustomerId));
    }, [savedCheckoutByCustomerId]);

    // Load saved cart from database when customer changes
    // This allows any employee to see a customer's saved checkout from another employee
    useEffect(() => {
        if (!activeCustomerId) return;

        const loadSavedCartFromDb = async () => {
            setLoadingCart(true);
            try {
                const { cart: savedCart, items } = await cartStorage.loadSavedCart(activeCustomerId);
                
                if (savedCart && items && items.length > 0) {
                    console.log('[CartContext] Loaded saved cart from database:', savedCart.id, 'with', items.length, 'items');
                    
                    // Convert database items to local cart format
                    const cartItems = items.map(item => ({
                        id: item.planId,
                        name: item.planName || item.name,
                        price: item.planPrice || item.price,
                        type: item.planType || item.type,
                        lines: item.lineCount || 1,
                        // Include other plan fields if available
                        network: item.network,
                        speed: item.speed,
                        bestValue: item.bestValue,
                    }));

                    // Update local cart with database cart
                    setCartByCustomerId((prev) => ({
                        ...prev,
                        [activeCustomerId]: cartItems,
                    }));

                    // Mark checkout as saved since it came from database
                    setSavedCheckoutByCustomerId((prev) => ({
                        ...prev,
                        [activeCustomerId]: true,
                    }));
                }
            } catch (error) {
                console.error('[CartContext] Error loading saved cart:', error);
            } finally {
                setLoadingCart(false);
            }
        };

        loadSavedCartFromDb();
    }, [activeCustomerId]);    // The active customer's cart, derived from the per-customer map.
    const cart = useMemo(() => {
        if (!activeCustomerId) {
            return [];
        }

        return cartByCustomerId[activeCustomerId] ?? [];
    }, [activeCustomerId, cartByCustomerId]);

    const isCheckoutSaved = useMemo(() => {
        if (!activeCustomerId) {
            return false;
        }

        return Boolean(savedCheckoutByCustomerId[activeCustomerId]);
    }, [activeCustomerId, savedCheckoutByCustomerId]);

    const clearCheckoutSavedForCustomer = (customerId) => {
        if (!customerId) {
            return;
        }

        setSavedCheckoutByCustomerId((previousSavedMap) => {
            if (!previousSavedMap[customerId]) {
                return previousSavedMap;
            }

            const nextSavedMap = { ...previousSavedMap };
            delete nextSavedMap[customerId];
            return nextSavedMap;
        });
    };

    const addToCart = (plan) => {
        if (!activeCustomerId) {
            return;
        }

        setCartByCustomerId((previousCarts) => {
            const currentCart = previousCarts[activeCustomerId] ?? [];
            if (currentCart.some((cartPlan) => matchesPlan(cartPlan, plan))) {
                return previousCarts;
            }

            return {
                ...previousCarts,
                [activeCustomerId]: [...currentCart, { ...plan, lines: 1 }],
            };
        });

        clearCheckoutSavedForCustomer(activeCustomerId);
    };

    // Add one line to a plan. If the plan isn't in the cart yet it's added with
    // a single line; otherwise its existing line count is incremented.
    const addLine = (plan) => {
        if (!activeCustomerId) {
            return;
        }

        setCartByCustomerId((previousCarts) => {
            const currentCart = previousCarts[activeCustomerId] ?? [];
            const exists = currentCart.some((cartPlan) => matchesPlan(cartPlan, plan));

            const nextCart = exists
                ? currentCart.map((cartPlan) =>
                    matchesPlan(cartPlan, plan)
                        ? { ...cartPlan, lines: (cartPlan.lines ?? 1) + 1 }
                        : cartPlan
                )
                : [...currentCart, { ...plan, lines: 1 }];

            return {
                ...previousCarts,
                [activeCustomerId]: nextCart,
            };
        });

        clearCheckoutSavedForCustomer(activeCustomerId);
    };

    // Remove one line from a plan. When the last line is removed the plan drops
    // out of the cart entirely.
    const removeLine = (planOrPlanId) => {
        if (!activeCustomerId) {
            return;
        }

        const targetPlan = typeof planOrPlanId === 'object' && planOrPlanId !== null
            ? planOrPlanId
            : { id: planOrPlanId };

        setCartByCustomerId((previousCarts) => {
            const currentCart = previousCarts[activeCustomerId] ?? [];
            const target = currentCart.find((cartPlan) => matchesPlan(cartPlan, targetPlan));
            if (!target) {
                return previousCarts;
            }

            const nextCart = (target.lines ?? 1) <= 1
                ? currentCart.filter((cartPlan) => !matchesPlan(cartPlan, targetPlan))
                : currentCart.map((cartPlan) =>
                    matchesPlan(cartPlan, targetPlan)
                        ? { ...cartPlan, lines: cartPlan.lines - 1 }
                        : cartPlan
                );

            return {
                ...previousCarts,
                [activeCustomerId]: nextCart,
            };
        });

        clearCheckoutSavedForCustomer(activeCustomerId);
    };

    const removeFromCart = (planOrPlanId) => {
        if (!activeCustomerId) {
            return;
        }

        const targetPlan = typeof planOrPlanId === 'object' && planOrPlanId !== null
            ? planOrPlanId
            : { id: planOrPlanId };

        setCartByCustomerId((previousCarts) => {
            const currentCart = previousCarts[activeCustomerId] ?? [];

            return {
                ...previousCarts,
                [activeCustomerId]: currentCart.filter((plan) => !matchesPlan(plan, targetPlan)),
            };
        });

        clearCheckoutSavedForCustomer(activeCustomerId);
    };

    const markCheckoutSaved = (customerId = activeCustomerId) => {
        if (!customerId) {
            return;
        }

        setSavedCheckoutByCustomerId((previousSavedMap) => ({
            ...previousSavedMap,
            [customerId]: true,
        }));
    };

    const clearCheckoutSaved = (customerId = activeCustomerId) => {
        clearCheckoutSavedForCustomer(customerId);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, addLine, removeLine, removeFromCart, cartByCustomerId, isCheckoutSaved, markCheckoutSaved, clearCheckoutSaved, clearCheckoutSavedForCustomer, loadingCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}