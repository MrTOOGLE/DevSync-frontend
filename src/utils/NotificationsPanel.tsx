import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/Notifications.module.css';
import { notificationsService, Notification as NotificationType, NotificationAction } from '../hooks/NotificationService';
import { useWebSocketNotifications } from '../hooks/UseWebSocketNotifications.tsx';

interface NotificationsPanelProps {
    visible: boolean;
    onClose?: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
                                                                          visible,
                                                                          onClose
                                                                      }) => {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Обработчики для WebSocket уведомлений
    const handleNotificationReceived = useCallback((notification: NotificationType) => {
        setNotifications(prev => [notification, ...prev]);
    }, []);

    const handleNotificationUpdated = useCallback((updatedNotification: NotificationType) => {
        setNotifications(prev => prev.map(notification =>
            notification.id === updatedNotification.id ? updatedNotification : notification
        ));
    }, []);

    const handleNotificationDeleted = useCallback((notificationId: number) => {
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    }, []);

    const handleWebSocketError = useCallback((errorMessage: string) => {
        setError(`WebSocket ошибка: ${errorMessage}`);
    }, []);

    // Подключение к WebSocket
    const {
        isConnected,
        connectionError,
        markAsRead,
        markAllAsRead,
        markAsHidden,
        markAllAsHidden
    } = useWebSocketNotifications({
        onNotificationReceived: handleNotificationReceived,
        onNotificationUpdated: handleNotificationUpdated,
        onNotificationDeleted: handleNotificationDeleted,
        onError: handleWebSocketError
    });

    // Первоначальная загрузка уведомлений
    useEffect(() => {
        if (visible) {
            fetchNotifications();
        }
    }, [visible]);

    // Загрузка уведомлений с сервера
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await notificationsService.getNotifications();
            setNotifications(data);
        } catch (err) {
            setError('Не удалось загрузить уведомления');
            console.error('Ошибка при загрузке уведомлений:', err);
        } finally {
            setLoading(false);
        }
    };

    // Обработка действий в уведомлении
    const handleAction = async (action: NotificationAction, notificationId: number) => {
        try {
            if (action.type === 'request') {
                await notificationsService.executeNotificationAction(action);
                // После выполнения действия помечаем уведомление как прочитанное
                markAsRead(notificationId);
            } else if (action.type === 'anchor') {
                // Перенаправляем пользователя по указанному URL
                window.open(action.payload.url, '_blank');
                // Помечаем уведомление как прочитанное
                markAsRead(notificationId);
            }
        } catch (err) {
            setError('Не удалось выполнить действие');
            console.error('Ошибка при выполнении действия:', err);
        }
    };

    // Обработка прочтения уведомления
    const handleMarkAsRead = (notificationId: number) => {
        markAsRead(notificationId);
        // Обновляем локальное состояние
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, is_read: true }
                    : notification
            )
        );
    };

    // Обработка прочтения всех уведомлений
    const handleMarkAllAsRead = () => {
        markAllAsRead();
        // Обновляем локальное состояние
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, is_read: true }))
        );
    };

    // Обработка скрытия уведомления
    const handleHideNotification = (notificationId: number) => {
        markAsHidden(notificationId);
        // Удаляем из локального состояния
        setNotifications(prev =>
            prev.filter(notification => notification.id !== notificationId)
        );
    };

    // Форматирование даты
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) {
            return 'только что';
        } else if (diffHours < 24) {
            return `${diffHours}ч назад`;
        } else if (diffDays < 7) {
            return `${diffDays}д назад`;
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    };

    // CSS класс для стиля кнопки действия
    const getActionButtonClass = (style: string) => {
        switch (style) {
            case 'primary':
                return styles.actionButtonPrimary;
            case 'secondary':
                return styles.actionButtonSecondary;
            case 'danger':
                return styles.actionButtonDanger;
            default:
                return styles.actionButtonSecondary;
        }
    };

    if (!visible) return null;

    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.notificationsHeader}>
                <h3>Ваши уведомления</h3>
                <div className={styles.notificationsControls}>
                    {/* Индикатор подключения WebSocket */}
                    <div className={`${styles.connectionStatus} ${isConnected ? styles.connected : styles.disconnected}`}>
                        {isConnected ? '🟢' : '🔴'}
                    </div>

                    {/* Кнопка "Прочитать все" */}
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className={styles.markAllReadButton}
                        >
                            Прочитать все
                        </button>
                    )}

                    {onClose && (
                        <button onClick={onClose} className={styles.notificationsClose}>
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Отображение ошибок */}
            {(error || connectionError) && (
                <div className={styles.errorMessage}>
                    {error || connectionError}
                </div>
            )}

            {loading ? (
                <div className={styles.notificationsEmpty}>
                    <div className={styles.loadingSpinner}>Загрузка...</div>
                </div>
            ) : notifications.length === 0 ? (
                <div className={styles.notificationsEmpty}>
                    <p>У вас нет уведомлений</p>
                </div>
            ) : (
                <div className={styles.notificationsList}>
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`${styles.notificationItem} ${
                                notification.is_read ? styles.read : styles.unread
                            }`}
                        >
                            <div className={styles.notificationContent}>
                                <div className={styles.notificationHeader}>
                                    <h4 className={styles.notificationTitle}>
                                        {notification.title}
                                    </h4>
                                    <div className={styles.notificationMeta}>
                                        <span className={styles.notificationDate}>
                                            {formatDate(notification.created_at)}
                                        </span>
                                        <button
                                            onClick={() => handleHideNotification(notification.id)}
                                            className={styles.hideButton}
                                            title="Скрыть уведомление"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                <p className={styles.notificationMessage}>
                                    {notification.message}
                                </p>

                                {/* Действия уведомления */}
                                {notification.actions_data && notification.actions_data.length > 0 && (
                                    <div className={styles.notificationActions}>
                                        {notification.actions_data.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleAction(action, notification.id)}
                                                className={getActionButtonClass(action.style)}
                                            >
                                                {action.text}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Подвал уведомления */}
                                {notification.footnote && (
                                    <div className={styles.notificationFootnote}>
                                        {notification.footnote}
                                    </div>
                                )}

                                {/* Кнопка "Прочитать" для непрочитанных уведомлений */}
                                {!notification.is_read && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className={styles.markAsReadButton}
                                    >
                                        Отметить как прочитанное
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};