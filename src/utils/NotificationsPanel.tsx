import React, { useEffect, useState } from 'react';
import styles from '../styles/Notifications.module.css';
import notificationService, { Notification as NotificationType, Action } from '../hooks/NotificationService';

interface NotificationsProps {
    visible: boolean;
    onClose?: () => void;
}

export const NotificationsPanel: React.FC<NotificationsProps> = ({
                                                                     visible,
                                                                     onClose
                                                                 }) => {
    // Локальное состояние для уведомлений
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Получение уведомлений при первом рендере
    useEffect(() => {
        if (visible) {
            fetchNotifications();
        }
    }, [visible]);

    // Подключение к WebSocket для уведомлений в реальном времени
    useEffect(() => {
        // Настраиваем обработчики событий WebSocket
        const eventHandlers = {
            onNotification: (notification: NotificationType) => {
                // Добавляем новое уведомление в список
                setNotifications(prev => [notification, ...prev]);
            },
            onUpdate: (notification: NotificationType) => {
                // Обновляем существующее уведомление
                setNotifications(prev =>
                    prev.map(item =>
                        item.id === notification.id ? notification : item
                    )
                );
            },
            onDelete: (notificationId: number) => {
                // Удаляем уведомление из списка
                setNotifications(prev =>
                    prev.filter(item => item.id !== notificationId)
                );
            },
            onError: (message: string) => {
                setError(message);
            }
        };

        // Подключаемся к WebSocket
        notificationService.connectWebSocket(eventHandlers);

        // Очистка при размонтировании компонента
        return () => {
            notificationService.disconnectWebSocket();
        };
    }, []);

    // Загрузка уведомлений с сервера
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (err) {
            setError('Не удалось загрузить уведомления');
            console.error('Ошибка при загрузке уведомлений:', err);
        } finally {
            setLoading(false);
        }
    };

    // Обработка действий в уведомлении
    const handleAction = async (action: Action) => {
        try {
            if (action.type === 'request') {
                const method = action.payload.method || 'GET';

                const response = await fetch(action.payload.url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...notificationService.getAuthHeaders()
                    }
                });

                if (!response.ok) {
                    throw new Error(`Ошибка запроса: ${response.status}`);
                }

                // Перезагружаем уведомления после успешного действия
                fetchNotifications();
            } else if (action.type === 'anchor') {
                // Перенаправляем пользователя по указанному URL
                window.location.href = action.payload.url;
            }
        } catch (err) {
            setError('Не удалось выполнить действие');
            console.error('Ошибка при выполнении действия:', err);
        }
    };

    // Обработка прочтения уведомления
    const handleMarkAsRead = (notificationId: number) => {
        notificationService.markAsRead(notificationId);
        // Обновляем локальное состояние
        setNotifications(prev =>
            prev.map(item =>
                item.id === notificationId ? { ...item, is_read: true } : item
            )
        );
    };

    // Обработка скрытия уведомления
    const handleMarkAsHidden = (notificationId: number) => {
        notificationService.markAsHidden(notificationId);
        // Удаляем из локального состояния
        setNotifications(prev =>
            prev.filter(item => item.id !== notificationId)
        );
    };

    if (!visible) return null;

    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.notificationsHeader}>
                <h3>Ваши уведомления</h3>
                {onClose && (
                    <button onClick={onClose} className={styles.notificationsClose}>
                        ✕
                    </button>
                )}
            </div>

            {loading && (
                <div className={styles.notificationsLoading}>
                    Загрузка уведомлений...
                </div>
            )}

            {error && (
                <div className={styles.notificationsError}>
                    {error}
                </div>
            )}

            {!loading && notifications.length === 0 ? (
                <p className={styles.notificationsEmpty}>У вас нет уведомлений</p>
            ) : (
                <div className={styles.notificationsList}>
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`${styles.notificationItem} ${notification.is_read ? styles.read : styles.unread}`}
                            onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        >
                            <div className={styles.notificationHeader}>
                                <div className={styles.notificationTitle}>{notification.title}</div>
                                <span className={styles.notificationDate}>{new Date(notification.created_at).toLocaleString()}</span>
                            </div>
                            <div className={styles.notificationContent}>
                                <p>{notification.message}</p>
                            </div>

                            {notification.actions_data && notification.actions_data.length > 0 && (
                                <div className={styles.notificationActions}>
                                    {notification.actions_data.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAction(action);
                                            }}
                                            className={`${styles.notificationAction} ${styles[`actionStyle${action.style}`]}`}
                                        >
                                            {action.text}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {notification.footnote && (
                                <div className={styles.notificationFootnote}>
                                    {notification.footnote}
                                </div>
                            )}

                            <button
                                className={styles.notificationClose}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsHidden(notification.id);
                                }}
                                aria-label="Скрыть уведомление"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {notifications.length > 0 && (
                <div className={styles.notificationsFooter}>
                    <button
                        className={styles.markAllReadButton}
                        onClick={() => {
                            notificationService.markAllAsRead();
                            setNotifications(prev =>
                                prev.map(item => ({ ...item, is_read: true }))
                            );
                        }}
                    >
                        Отметить все как прочитанные
                    </button>
                    <button
                        className={styles.clearAllButton}
                        onClick={() => {
                            notificationService.markAllAsHidden();
                            setNotifications([]);
                        }}
                    >
                        Очистить все
                    </button>
                </div>
            )}
        </div>
    );
};