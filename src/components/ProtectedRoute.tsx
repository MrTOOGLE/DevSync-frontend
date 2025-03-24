import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Заглушка до того, пока не сделаем апи с токенами
 **/
const ProtectedRoute: React.FC = () => {
    // Здесь проверка, авторизован ли пользователь
    // TODO: Для простоты юзается localStorage, но потом использовать контекст или Redux???? (мебе нет хихихихи)
    const isAuthenticated = localStorage.getItem('token') !== null;

    // Если не авторизован - перенаправляем на страницу входа
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Если авторизован - показываем запрошенную страницу через Outlet
    return <Outlet />;
};

export default ProtectedRoute;