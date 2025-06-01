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
import CreateProject from "./pages/Create_project/CreateProject.tsx";
import { authService } from './hooks/AuthService.tsx';
import ProjectPage from "./pages/Project/ProjectPage.tsx";

// Компонент для проверки авторизации и перенаправления
const AuthRedirect: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const isAuthenticated = authService.isAuthenticated();

        // Страницы, которые должны быть доступны только неавторизованным пользователям
        const authOnlyPaths = ['/login', '/register', '/verify-email'];

        // Если пользователь авторизован и пытается зайти на страницу только для неавторизованных
        if (isAuthenticated && authOnlyPaths.includes(location.pathname)) {
            navigate('/profile');
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
                    <Route path={"/create-project"} element={<CreateProject />} />
                    <Route path="/projects/:projectId" element={<ProjectPage />} />
                </Route>

                {/* Обработка несуществующих путей */}
                {/* TODO: ДОБАВИТЬ СТРАНИЦУ ДЛЯ ОШИБОК */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;