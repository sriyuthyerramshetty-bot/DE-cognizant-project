import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

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