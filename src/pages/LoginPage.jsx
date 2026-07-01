import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoginField from '../components/LoginPage/LoginField.jsx';
import TextAsset from '../assets/TextAssets.json'
import { Mail, Lock } from 'lucide-react';

function LoginPage() {
    // Get the login function from AuthContext and navigate function from react-router-dom
    const { login } = useAuth();
    const navigate = useNavigate();

    // Handle form submission for sign in
    const handleSignIn = (e) => {
        e.preventDefault();
        // No backend yet — any sign in succeeds. Mark the user as
        // authenticated and send them to the home page.
        login();
        navigate('/');
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
                    />
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-1">
                    <LoginField 
                        icon={<Lock size={16} />}
                        label={TextAsset.LoginPage.password} 
                        type="password" 
                        placeholder={TextAsset.LoginPage.passwordPlaceholder} 
                    />
                </div>

                {/* Sign In button */}
                <button
                    type="submit"
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                    {TextAsset.LoginPage.signInButton}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;