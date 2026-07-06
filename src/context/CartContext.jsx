import { createContext, useContext, useMemo, useState } from 'react';
import { CustomerContext } from './CustomerContext.jsx';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { activeCustomerId } = useContext(CustomerContext);
    const [cartByCustomerId, setCartByCustomerId] = useState({});

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