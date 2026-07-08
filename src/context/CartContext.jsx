import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

// Key the cart lives under in the browser's localStorage.
const STORAGE_KEY = 'cart';

// Read any previously saved cart out of localStorage. This runs as the lazy
// initial state so the cart is already populated on the very first render after
// a reload (no empty flicker). Falls back to an empty cart if nothing is stored
// or the stored value is somehow corrupt/unparseable.
function loadCart() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState(loadCart);

    // Persist the cart back to localStorage whenever it changes so the latest
    // contents survive a page reload. This is the localStorage equivalent of the
    // "subscribe" pattern used for auth: state changes -> write to storage, and
    // loadCart() above reads it back on the next load.
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    const addToCart = (plan) => {
        setCart((prev) => [...prev, plan]);
    };

    const removeFromCart = (planId) => {
        setCart((prev) => prev.filter((p) => p.id !== planId));
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}