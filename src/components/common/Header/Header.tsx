import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import notificationStyles from '../../../styles/Notifications.module.css';
import arrowBack from "../../../photos/pngwing.com.png";
import { useNavigate } from "react-router-dom";
import logo from "../../../photos/logo.png";
import bell from "../../../photos/bell.png";
import { authService } from "../../../hooks/AuthService.tsx";
import notificationService from "../../../hooks/NotificationService";
import { NotificationsPanel } from "../../../utils/NotificationsPanel";

interface HeaderProps {
    variant?: 'default' | 'back';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'default' }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const isAuthenticated = authService.isAuthenticated();
    const [notificationCount, setNotificationCount] = useState<number>(0);

    // Получение уведомлений при монтировании компонента
    useEffect(() => {
        if (isAuthenticated) {
            // Получаем список уведомлений с сервера
            fetchNotifications();

            // Подключаемся к WebSocket для обновлений в реальном времени
            notificationService.connectWebSocket({
                onNotification: (notification) => {
                    // Увеличиваем счетчик непрочитанных уведомлений
                    if (!notification.is_read) {
                        setNotificationCount(prevCount => prevCount + 1);
                    }
                },
                onUpdate: (notification) => {
                    // Если уведомление было отмечено как прочитанное, уменьшаем счетчик
                    if (notification.is_read) {
                        setNotificationCount(prevCount => Math.max(0, prevCount - 1));
                    }
                },
                onDelete: () => {
                    // При удалении уведомления обновляем список
                    fetchNotifications();
                }
            });

            // Отключаем WebSocket при размонтировании компонента
            return () => {
                notificationService.disconnectWebSocket();
            };
        }
    }, [isAuthenticated]);

    // Загрузка уведомлений с сервера
    const fetchNotifications = async () => {
        try {
            const notifications = await notificationService.getNotifications();
            // Считаем количество непрочитанных уведомлений
            const unreadCount = notifications.filter(notification => !notification.is_read).length;
            setNotificationCount(unreadCount);
        } catch (error) {
            console.error('Ошибка при загрузке уведомлений:', error);
        }
    };

    // Показ/скрытие уведомлений
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);

        // Если закрываем панель уведомлений, считаем все уведомления прочитанными
        if (showNotifications) {
            notificationService.markAllAsRead();
            setNotificationCount(0);
        }
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
                                <div className={notificationStyles.bellContainer}>
                                    <button
                                        className={styles.bell}
                                        onClick={toggleNotifications}
                                    >
                                        <img src={bell} alt="Уведомления"/>
                                    </button>
                                    {notificationCount > 0 && (
                                        <span className={notificationStyles.unreadBadge}>
                                            {notificationCount > 99 ? '99+' : notificationCount}
                                        </span>
                                    )}
                                </div>

                                <button onClick={handleLogout} className={styles.logoutButton}>Выйти</button>
                                <button
                                    className={styles.profile}
                                    onClick={() => navigate('/profile')}
                                >
                                    Личный кабинет
                                </button>

                                {/* Панель уведомлений */}
                                <NotificationsPanel
                                    visible={showNotifications}
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