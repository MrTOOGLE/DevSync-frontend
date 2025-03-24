import React from 'react';
import {useNavigate} from 'react-router-dom';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Удаляем токен
        localStorage.removeItem('token');
        // Перенаправляем на страницу входа
        navigate('/login');
    };

    return (
        <div>
            <h1>Панель управления</h1>
            <p>Эта страница доступна только авторизованным пользователям</p>
            <button onClick={handleLogout}>Выйти</button>
        </div>
    );
};

export default Dashboard;