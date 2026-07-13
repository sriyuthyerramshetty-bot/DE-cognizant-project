import { createContext, useContext, useState } from 'react';

const UserInfoContext = createContext();

export function UserInfoProvider({ children }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Checks that every required field is filled in and that the
    // email and phone number are in a sensible format before the
    // user is allowed to check out or save the checkout.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = formData.phone.replace(/\D/g, '');

    // Name must be non-empty, whitespace trimmed
    // Email must match basic pattern
    // Phone length must be at least 10 digits (ignoring non-digit characters)
    // Address must be non-empty, whitespace trimmed
    const isFormValid =
        formData.name.trim() !== '' &&
        emailPattern.test(formData.email.trim()) &&
        phoneDigits.length >= 10 &&
        formData.address.trim() !== '';

    return (
        <UserInfoContext.Provider value={{ formData, setFormData, handleChange, isFormValid }}>
            {children}
        </UserInfoContext.Provider>
    );
}

export function useUserInfo() {
    return useContext(UserInfoContext);
}