import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    // The current Firebase user (null when signed out) and a loading flag that
    // stays true until Firebase has restored any existing session on first load.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Subscribe to Firebase auth state once. This callback fires on sign-in,
    // sign-out, and on page load after the persisted session is restored,
    // keeping `user` in sync automatically. The returned function unsubscribes
    // when the provider unmounts.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Sign in with email/password. Returns the promise so callers can await it
    // and handle success/failure; any error propagates to the caller.
    const signIn = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    // Sign out of Firebase. `onAuthStateChanged` clears `user` for us.
    const logout = () => signOut(auth);

    // Derived from the real Firebase user so it can never drift out of sync.
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, signIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}