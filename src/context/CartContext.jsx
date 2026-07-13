import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CustomerContext } from './CustomerContext.jsx';

const CartContext = createContext();

// Key the per-customer carts live under in the browser's localStorage.
const STORAGE_KEY = 'cartByCustomerId';

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

export function CartProvider({ children }) {
    const { activeCustomerId } = useContext(CustomerContext);
    const [cartByCustomerId, setCartByCustomerId] = useState(loadCarts);

    // Persist every customer's cart back to localStorage whenever they change so
    // the carts survive a page reload. This is the localStorage equivalent of the
    // "subscribe" pattern used for auth: state changes -> write to storage, and
    // loadCarts() above reads it back on the next load.
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartByCustomerId));
    }, [cartByCustomerId]);

    // The active customer's cart, derived from the per-customer map.
    const cart = useMemo(() => {
        if (!activeCustomerId) {
            return [];
        }

        return cartByCustomerId[activeCustomerId] ?? [];
    }, [activeCustomerId, cartByCustomerId]);

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
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartByCustomerId }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}