import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CustomerContext } from './CustomerContext.jsx';

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

export function CartProvider({ children }) {
    const { activeCustomerId } = useContext(CustomerContext);
    const [cartByCustomerId, setCartByCustomerId] = useState(loadCarts);
    const [savedCheckoutByCustomerId, setSavedCheckoutByCustomerId] = useState(loadSavedCheckout);

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

    // The active customer's cart, derived from the per-customer map.
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
            if (currentCart.some((cartPlan) => cartPlan.id === plan.id)) {
                return previousCarts;
            }

            return {
                ...previousCarts,
                [activeCustomerId]: [...currentCart, plan],
            };
        });

        clearCheckoutSavedForCustomer(activeCustomerId);
    };

    const removeFromCart = (planId) => {
        if (!activeCustomerId) {
            return;
        }

        setCartByCustomerId((previousCarts) => {
            const currentCart = previousCarts[activeCustomerId] ?? [];

            return {
                ...previousCarts,
                [activeCustomerId]: currentCart.filter((plan) => plan.id !== planId),
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
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartByCustomerId, isCheckoutSaved, markCheckoutSaved, clearCheckoutSaved }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}