import { Navigate, useLocation } from 'react-router-dom';
import './require_auth.css';

function RequireAuth ({ children }) {
    const location = useLocation();
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
}


export default RequireAuth;
