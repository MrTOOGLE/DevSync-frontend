import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../hooks/AuthService.tsx'

/**
 * Проверка того, авторизован ли пользователь
 **/
const ProtectedRoute: React.FC = () => {
    // Здесь проверка, авторизован ли пользователь
    const isAuthenticated = authService.isAuthenticated();

    // Если не авторизован - перенаправляем на страницу входа
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Если авторизован - показываем запрошенную страницу через Outlet
    return <Outlet />;
};

export default ProtectedRoute;