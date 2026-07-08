import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Guards the app pages. If the user is not signed in, send them to the
// login page. Otherwise render the matched child route via <Outlet />.
function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    // While Firebase restores any persisted session on first load, don't decide
    // yet — otherwise a refresh would briefly redirect a signed-in user.
    if (loading) return null;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;