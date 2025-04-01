import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Registration from './pages/Auth/Registration.tsx'
import Authorization from "./pages/Auth/Authorization.tsx";
import Dashboard from './pages/Main/Dashboard.tsx'; // Заглушка главной страницы
import ProtectedRoute from './components/ProtectedRoute';
import CheckMail from "./pages/Auth/CheckMail.tsx";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Публичные маршруты */}
                <Route path="/login" element={<Authorization />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/verify-email" element={<CheckMail />} />

                {/* Защищенные маршруты */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>

                {/* Перенаправление с корневого пути на страницу входа */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Обработка несуществующих путей */}
                {/* TODO: ДОБАВИТЬ СТРАНИЦУ ДЛЯ ОШИБОК */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;