import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Guards the app pages. If the user is not signed in, send them to the
// login page. Otherwise render the matched child route via <Outlet />.
function ProtectedRoute() {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;