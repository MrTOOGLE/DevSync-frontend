import React, { useState } from 'react';
import styles from './Header.module.css';
import arrowBack from "../../../photos/pngwing.com.png";
import { useNavigate } from "react-router-dom";
import logo from "../../../photos/logo.png";
import bell from "../../../photos/bell.png";
import { Notifications, Notification as NotificationType } from "../../../utils/Notifications.tsx";
import { authService } from "../../../hooks/AuthService.tsx";

interface HeaderProps {
    variant?: 'default' | 'back';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'default' }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const isAuthenticated = authService.isAuthenticated();

    // Заглушка для уведомлений с указанием, имеют ли они кнопки действий
    const initialNotifications: NotificationType[] = [
        {
            id: 1,
            type: 'achievement',
            text: 'Вы получили значок "Самый продуктивный работник"',
            date: '12.04.2025',
            read: false,
            icon: '🏆',
            hasActions: false // Убираем кнопки у уведомлений о достижениях
        },
        {
            id: 2,
            type: 'task',
            text: 'У Вас новая задача в проекте "Создание сайта для генерации кричка "Какой ты крипс сегодня?"',
            date: '11.04.2025',
            read: false,
            hasActions: true // У задач оставляем кнопки действий
        },
        {
            id: 3,
            type: 'project',
            text: 'Вас пригласили в проект "Создание сайта для генерации кричка "Какой ты крипс сегодня?"',
            date: '15.04.2025',
            read: false,
            hasActions: true // У приглашений в проект оставляем кнопки действий
        }
    ];

    const [notificationsList, setNotificationsList] = useState<NotificationType[]>(initialNotifications);

    // Показ/скрытие уведомлений
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // Обработчик принятия уведомления
    const handleAcceptNotification = (id: number) => {
        console.log(`Принято уведомление ${id}`);

        // Удаляем уведомление из состояния
        setNotificationsList(prev =>
            prev.filter(notification => notification.id !== id)
        );

        // В реальном приложении здесь должен быть вызов API для сохранения статуса уведомления
        // Например, axios.post('/api/notifications/accept', { id });
    };

    // Обработчик отклонения уведомления
    const handleDeclineNotification = (id: number) => {
        console.log(`Отклонено уведомление ${id}`);

        // Удаляем уведомление из состояния
        setNotificationsList(prev =>
            prev.filter(notification => notification.id !== id)
        );

        // В реальном приложении здесь должен быть вызов API для сохранения статуса уведомления
        // Например, axios.post('/api/notifications/decline', { id });
    };

    // Обработчик для кнопки 'назад'
    const handleBack = () => {
        // Проверяем, есть ли история для возврата
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            // Если истории нет, перенаправляем на главную страницу
            navigate('/');
        }
    };

    // Добавляем обработчик для выхода из системы с перенаправлением
    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    return (
        <header className={styles.headerFixed}>
            <div className={styles.headerContent}>
                {variant === 'back' ? (
                    <button onClick={handleBack} className={styles.backButton}>
                        <img src={arrowBack} alt="Back" className={styles.backIcon} />
                        <span>Назад</span>
                    </button>
                ) : (
                    <>
                        <div className={styles.leftGroup}>
                            <img onClick={() => navigate('/')} src={logo} alt="DEV SYNC" className={styles.logo}/>
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
                                <button onClick={handleLogout}>Выйти</button>
                                <button
                                    className={styles.profile}
                                    onClick={() => navigate('/profile')}
                                >
                                    Личный кабинет
                                </button>

                                <Notifications
                                    notifications={notificationsList}
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