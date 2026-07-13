// Translate Firebase auth error codes into friendly, non-revealing messages.
function getAuthErrorMessage(code) {
    switch (code) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        default:
            return 'Something went wrong. Please try again.';
    }
}

export default getAuthErrorMessage;