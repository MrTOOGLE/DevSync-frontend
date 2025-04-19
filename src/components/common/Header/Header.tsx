import React, { useState } from 'react';
import styles from './Header.module.css';
import arrowBack from "../../../photos/pngwing.com.png";
import { useNavigate } from "react-router-dom";
import logo from "../../../photos/logo.png";
import bell from "../../../photos/bell.png";
import { Notifications, Notification } from "../../../utils/Notifications.tsx";
import { authService } from "../../../hooks/AuthService.tsx";

interface HeaderProps {
    variant?: 'default' | 'back';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'default' }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const isAuthenticated = authService.isAuthenticated();

    // Заглушка для уведомлений
    const mockNotifications: Notification[] = [
        {
            id: 1,
            type: 'achievement',
            text: 'Вы получили значок "Самый продуктивный работник"',
            date: '12.04.2025',
            read: false,
            icon: '🏆'
        },
        {
            id: 2,
            type: 'task',
            text: 'У Вас новая задача в проекте "Создание сайта для генерации кричка "Какой ты крипс сегодня?"',
            date: '11.04.2025',
            read: false
        }
    ];

    // Показ/скрытие уведомлений
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // Обработчик принятия уведомления
    const handleAcceptNotification = (id: number) => {
        console.log(`Принято уведомление ${id}`);
        // В реальном приложении здесь будет вызов API
    };

    // Обработчик отклонения уведомления
    const handleDeclineNotification = (id: number) => {
        console.log(`Отклонено уведомление ${id}`);
        // В реальном приложении здесь будет вызов API
    };

    return (
        <header className={styles.headerFixed}>
            <div className={styles.headerContent}>
                {variant === 'back' ? (
                    <button onClick={() => navigate(-1)} className={styles.backButton}>
                        <img src={arrowBack} alt="Back" className={styles.backIcon} />
                        <span>Назад</span>
                    </button>
                ) : (
                    <>
                        <div className={styles.leftGroup}>
                            <img src={logo} alt="DEV SYNC" className={styles.logo}/>
                            <nav className={styles.nav}>
                                <button onClick={() => navigate('/create-project')} className={styles.link}>
                                    Создать проект
                                </button>
                                <button onClick={() => navigate('/faq')} className={styles.link}>
                                    FAQ
                                </button>
                            </nav>
                        </div>
                        {isAuthenticated && (
                            <div className={styles.right}>
                                <button
                                    className={styles.bell}
                                    onClick={toggleNotifications}
                                >
                                    <img src={bell} alt="Уведомления"/>
                                </button>
                                <button onClick={authService.logout}>Выйти</button>
                                <button
                                    className={styles.profile}
                                    onClick={() => navigate('/profile')}
                                >
                                    Личный кабинет
                                </button>

                                {/* Компонент уведомлений */}
                                <Notifications
                                    notifications={mockNotifications}
                                    visible={showNotifications}
                                    onAccept={handleAcceptNotification}
                                    onDecline={handleDeclineNotification}
                                    onClose={() => setShowNotifications(false)}
                                />
                            </div>
                        )}

                        {!isAuthenticated && (
                            <button
                                className={styles.profile}
                                onClick={() => navigate('/login')}
                            >
                                Личный кабинет
                            </button>
                        )}
                    </>
                )}
            </div>
        </header>
    );
};