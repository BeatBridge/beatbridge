import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children }) => {
    const JWT = localStorage.getItem('jwt');
    if (!JWT) {
        return <Navigate to="/login" />;
    }
    return children;
};

export default RequireAuth;
