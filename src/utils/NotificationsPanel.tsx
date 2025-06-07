import React, { useEffect, useState } from 'react';
import styles from '../styles/Notifications.module.css';
import { notificationsService, Notification as NotificationType, NotificationAction } from '../hooks/NotificationService.tsx';

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

    // Загрузка уведомлений с сервера
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await notificationsService.getAllNotifications();
            setNotifications(data);
        } catch (err) {
            setError('Не удалось загрузить уведомления');
            console.error('Ошибка при загрузке уведомлений:', err);
        } finally {
            setLoading(false);
        }
    };

    // Обработка действий в уведомлении
    const handleAction = async (action: NotificationAction) => {
        try {
            if (action.type === 'request') {
                await notificationsService.executeNotificationAction(action);
                // Перезагружаем уведомления после успешного действия
                fetchNotifications();
            } else if (action.type === 'anchor') {
                // Перенаправляем пользователя по указанному URL
                window.open(action.payload.url, '_blank');
            }
        } catch (err) {
            setError('Не удалось выполнить действие');
            console.error('Ошибка при выполнении действия:', err);
        }
    };

    // Обработка прочтения уведомления
    const handleMarkAsRead = (notificationId: number) => {
        // Обновляем локальное состояние
        setNotifications(prev =>
            prev.map(item =>
                item.id === notificationId ? { ...item, is_read: true } : item
            )
        );
    };

    // Обработка скрытия уведомления
    const handleMarkAsHidden = (notificationId: number) => {
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
                <div className={styles.notificationsEmpty}>
                    <div className={styles.loadingSpinner}>Загрузка уведомлений...</div>
                </div>
            )}

            {error && (
                <div className={styles.notificationsEmpty}>
                    <p style={{ color: '#FF4444' }}>{error}</p>
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
                                <span className={styles.notificationDate}>
                                    {new Date(notification.created_at).toLocaleDateString('ru-RU')}
                                </span>
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
                                            className={`${styles.notificationAction} ${styles[`action_${action.style}`]}`}
                                        >
                                            {action.text}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {notification.footnote && (
                                <div className={styles.footnote}>
                                    {notification.footnote}
                                </div>
                            )}

                            <button
                                className={styles.notificationsClose}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsHidden(notification.id);
                                }}
                                aria-label="Скрыть уведомление"
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#7C7C7C'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};