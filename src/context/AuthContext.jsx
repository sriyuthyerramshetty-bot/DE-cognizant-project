import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { employeeStorage } from '../storage/storageProvider';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    // The current Firebase user (null when signed out) and a loading flag that
    // stays true until Firebase has restored any existing session on first load.
    const [user, setUser] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sync Firebase user with Supabase employee record
    const syncEmployeeWithFirebase = async (firebaseUser) => {
        if (!firebaseUser) {
            setEmployee(null);
            return null;
        }

        console.log('[AuthContext] Syncing employee for Firebase user:', firebaseUser.uid, firebaseUser.email);

        // Try to find existing employee by Firebase UID
        const { data: existingEmployee, error: fetchError } = await employeeStorage.fetchEmployeeByFirebaseUid(firebaseUser.uid);
        
        console.log('[AuthContext] Fetch result:', { existingEmployee, fetchError });

        if (existingEmployee) {
            console.log('[AuthContext] Found existing employee:', existingEmployee);
            setEmployee(existingEmployee);
            employeeStorage.saveCurrentEmployee(existingEmployee);
            return existingEmployee;
        }

        // If no employee exists, create one from Firebase user data
        // Parse display name into first/last name
        const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '';
        const nameParts = displayName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        console.log('[AuthContext] Creating new employee:', { firebaseUid: firebaseUser.uid, firstName, lastName, email: firebaseUser.email });

        const { success, employee: newEmployee, error: createError } = await employeeStorage.createEmployee({
            firebaseUid: firebaseUser.uid,
            firstName,
            lastName,
            email: firebaseUser.email,
            role: 'employee',
        });

        console.log('[AuthContext] Create result:', { success, newEmployee, createError });

        if (success && newEmployee) {
            setEmployee(newEmployee);
            employeeStorage.saveCurrentEmployee(newEmployee);
            return newEmployee;
        }

        console.error('[AuthContext] Failed to create employee');
        return null;
    };

    // Subscribe to Firebase auth state once. This callback fires on sign-in,
    // sign-out, and on page load after the persisted session is restored,
    // keeping `user` in sync automatically. The returned function unsubscribes
    // when the provider unmounts.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            
            if (currentUser) {
                await syncEmployeeWithFirebase(currentUser);
            } else {
                setEmployee(null);
                employeeStorage.clearCurrentEmployee();
            }
            
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Sign in with email/password. Returns the promise so callers can await it
    // and handle success/failure; any error propagates to the caller.
    const signIn = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        // Employee sync happens automatically via onAuthStateChanged
        return result;
    };

    // Sign out of Firebase. `onAuthStateChanged` clears `user` for us.
    const logout = async () => {
        await signOut(auth);
        setEmployee(null);
        employeeStorage.clearCurrentEmployee();
    };

    // Derived from the real Firebase user so it can never drift out of sync.
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ 
            user, 
            employee, 
            isAuthenticated, 
            loading, 
            signIn, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}