import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoginField from '../components/LoginPage/LoginField.jsx';
import TextAsset from '../assets/TextAssets.json'
import { Mail, Lock } from 'lucide-react';

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

function LoginPage() {
    // Get the sign-in function from AuthContext and the navigate helper.
    const { signIn } = useAuth();
    const navigate = useNavigate();

    // Input fields plus error/submitting state for UI feedback.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Handle form submission for sign in. Await Firebase, navigate on success,
    // and surface a friendly message on failure.
    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await signIn(email, password);
            navigate('/');
        } catch (err) {
            setError(getAuthErrorMessage(err.code));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">

            {/* Login form */}
            <form
                onSubmit={handleSignIn}
                className="w-full max-w-sm flex flex-col gap-4 border rounded-lg shadow-md bg-white p-8"
            >
                {/* Form header */}
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">{TextAsset.LoginPage.title}</h1>
                    {/* <p className="mt-1 text-sm text-gray-600">{TextAsset.LoginPage.subtitle}</p> */}
                </div>

                {/* Email field */}
                <div className="flex flex-col gap-1">
                    <LoginField 
                        icon={<Mail size={16} />}
                        label={TextAsset.LoginPage.email} 
                        type="email"
                        placeholder={TextAsset.LoginPage.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-1">
                    <LoginField 
                        icon={<Lock size={16} />}
                        label={TextAsset.LoginPage.password} 
                        type="password" 
                        placeholder={TextAsset.LoginPage.passwordPlaceholder} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        toggleable
                    />
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-sm text-red-600" role="alert">{error}</p>
                )}

                {/* Sign In button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Signing in…' : TextAsset.LoginPage.signInButton}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;