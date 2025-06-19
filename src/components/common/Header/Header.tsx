import React, { useState, useEffect, useMemo } from 'react';
import styles from './Header.module.css';
import arrowBack from "../../../photos/pngwing.com.png";
import { useNavigate } from "react-router-dom";
import logo from "../../../photos/logo2.svg";
import bell from "../../../photos/bell.png";
import { Notifications } from "../../../utils/Notifications.tsx";
import { authService } from "../../../hooks/AuthService.tsx";
import { notificationsService, Notification } from "../../../hooks/NotificationService.tsx";
import { useWebSocketNotifications } from "../../../hooks/UseWebSocketNotifications";

interface HeaderProps {
    variant?: 'default' | 'back';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'default' }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const isAuthenticated = authService.isAuthenticated();

    // WebSocket обработчики для уведомлений
    const handleNotificationReceived = (notification: Notification) => {
        setNotificationsList(prev => [notification, ...prev]);
    };

    const handleNotificationUpdated = (updatedNotification: Notification) => {
        setNotificationsList(prev => prev.map(notification =>
            notification.id === updatedNotification.id ? updatedNotification : notification
        ));
    };

    const handleNotificationDeleted = (notificationId: number) => {
        setNotificationsList(prev => prev.filter(notification => notification.id !== notificationId));
    };

    // Стабилизированные опции для WebSocket
    const websocketOptions = useMemo(() => ({
        onNotificationReceived: handleNotificationReceived,
        onNotificationUpdated: handleNotificationUpdated,
        onNotificationDeleted: handleNotificationDeleted,
        onError: (error: string) => {
            console.error('WebSocket ошибка в Header:', error);
        }
    }), []);

    // Подключаем WebSocket только если пользователь авторизован (ДОБАВЛЕНО ТОЛЬКО ЭТО)
    useWebSocketNotifications(isAuthenticated ? websocketOptions : {});

    // Загрузка уведомлений при монтировании компонента
    useEffect(() => {
        if (isAuthenticated) {
            loadNotifications();
        }
    }, [isAuthenticated]);

    // Функция загрузки уведомлений
    const loadNotifications = async () => {
        try {
            setIsLoadingNotifications(true);
            const notifications = await notificationsService.getAllNotifications();
            setNotificationsList(notifications);
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
            // В случае ошибки показываем пустую заглушку
            setNotificationsList([]);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    // Показ/скрытие уведомлений
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        // Перезагружаем уведомления при открытии
        if (!showNotifications && isAuthenticated) {
            loadNotifications();
        }
    };

    // Обработчик принятия уведомления
    const handleAcceptNotification = async (id: number) => {
        try {
            const notification = notificationsList.find(n => n.id === id);
            if (!notification) return;

            // Находим действие "Принять"
            const acceptAction = notification.actions_data.find(action =>
                action.text === 'Принять' || action.style === 'primary'
            );

            if (acceptAction) {
                // Выполняем действие через API
                await notificationsService.executeNotificationAction(acceptAction);

                // Помечаем уведомление как прочитанное локально
                setNotificationsList(prev =>
                    prev.map(notification =>
                        notification.id === id
                            ? { ...notification, is_read: true }
                            : notification
                    )
                );

                // Перезагружаем уведомления для актуальности
                await loadNotifications();
            }
        } catch (error) {
            console.error('Ошибка при принятии уведомления:', error);
            // В случае ошибки можно показать toast уведомление пользователю
        }
    };

    // Обработчик отклонения уведомления
    const handleDeclineNotification = async (id: number) => {
        try {
            const notification = notificationsList.find(n => n.id === id);
            if (!notification) return;

            // Находим действие "Отклонить"
            const declineAction = notification.actions_data.find(action =>
                action.text === 'Отклонить' || action.style === 'secondary'
            );

            if (declineAction) {
                // Выполняем действие через API
                await notificationsService.executeNotificationAction(declineAction);

                // Удаляем уведомление из локального состояния
                setNotificationsList(prev =>
                    prev.filter(notification => notification.id !== id)
                );

                // Перезагружаем уведомления для актуальности
                await loadNotifications();
            } else {
                // Если нет специального действия для отклонения, просто удаляем локально
                setNotificationsList(prev =>
                    prev.filter(notification => notification.id !== id)
                );
            }
        } catch (error) {
            console.error('Ошибка при отклонении уведомления:', error);
            // В случае ошибки всё равно удаляем из интерфейса
            setNotificationsList(prev =>
                prev.filter(notification => notification.id !== id)
            );
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

    // Получаем количество непрочитанных уведомлений
    const unreadCount = notificationsList.filter(n => !n.is_read).length;

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
                                    style={{ position: 'relative' }}
                                >
                                    <img src={bell} alt="Уведомления"/>
                                    {unreadCount > 0 && (
                                        <span className={styles.notificationBadge}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                <button className={styles.exitButton} onClick={handleLogout}>Выйти</button>
                                <button
                                    className={styles.profile}
                                    onClick={() => navigate('/profile')}
                                >
                                    Личный кабинет
                                </button>

                                {/* Компонент уведомлений */}
                                <Notifications
                                    notifications={notificationsList}
                                    visible={showNotifications}
                                    isLoading={isLoadingNotifications}
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