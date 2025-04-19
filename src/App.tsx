// Изменим компонент App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Registration from './pages/Auth/Registration.tsx'
import Authorization from "./pages/Auth/Authorization.tsx";
import ProtectedRoute from './routes/ProtectedRoute.tsx';
import CheckMail from "./pages/Auth/CheckMail.tsx";
import FaqPage from "./pages/FAQ/FaqPage.tsx";
import WelcomePage from "./pages/Main/WelcomePage.tsx";
import ProfilePage from "./pages/Profile/Profile.tsx";
import { authService } from './hooks/AuthService.tsx';

// Компонент для проверки авторизации и перенаправления
const AuthRedirect: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const isAuthenticated = authService.isAuthenticated();

        const publicPaths = ['/login', '/register', '/verify-email', '/faq'];

        if (isAuthenticated && publicPaths.includes(location.pathname)) {
            navigate('/profile');
        }

        if (!isAuthenticated && !publicPaths.includes(location.pathname) && location.pathname !== '/') {
            navigate('/login');
        }
    }, [navigate, location]);

    return null;
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            {/* Добавляем компонент проверки авторизации */}
            <AuthRedirect />

            <Routes>
                {/* Публичные маршруты */}
                <Route path="/login" element={<Authorization />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/verify-email" element={<CheckMail />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/" element={<WelcomePage />} />

                {/* Защищенные маршруты */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Обработка несуществующих путей */}
                {/* TODO: ДОБАВИТЬ СТРАНИЦУ ДЛЯ ОШИБОК */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;