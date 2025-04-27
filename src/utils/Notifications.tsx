import React, {useEffect, useState} from 'react';
import styles from '../styles/Notifications.module.css';

// Типы уведомлений
export type NotificationType = 'achievement' | 'task' | 'project' | 'system';

// Интерфейс для уведомления
export interface Notification {
    id: number;
    type: NotificationType;
    text: string;
    date: string;
    read: boolean;
    icon?: string;
    projectId?: number;
    taskId?: number;
    hasActions?: boolean;
    action?: string;
}

interface NotificationsProps {
    notifications: Notification[];
    visible: boolean;
    onAccept?: (notificationId: number) => void;
    onDecline?: (notificationId: number) => void;
    onClose?: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
                                                                notifications: initialNotifications,
                                                                visible,
                                                                onAccept,
                                                                onDecline,
                                                                onClose
                                                            }) => {
    // Создаем локальное состояние для уведомлений
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    // Обновляем состояние при изменении пропсов
    useEffect(() => {
        setNotifications(initialNotifications);
    }, [initialNotifications]);

    // Обработка принятия уведомления
    const handleAccept = (notificationId: number) => {
        // Обновляем локальное состояние - помечаем как прочитанное
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );

        // Вызываем колбэк
        if (onAccept) {
            onAccept(notificationId);
        }
    };

    // Обработка отклонения уведомления
    const handleDecline = (notificationId: number) => {
        // Удаляем уведомление из локального состояния
        setNotifications(prev =>
            prev.filter(notification => notification.id !== notificationId)
        );

        // Вызываем колбэк
        if (onDecline) {
            onDecline(notificationId);
        }
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

            {notifications.length === 0 ? (
                <p className={styles.notificationsEmpty}>У вас нет уведомлений</p>
            ) : (
                <div className={styles.notificationsList}>
                    {notifications.map(notification => (
                        <div key={notification.id}
                             className={`${styles.notificationItem} ${notification.read ? styles.read : styles.unread}`}
                        >
                            <div className={styles.notificationHeader}>
                                <span className={styles.notificationDate}>{notification.date}</span>
                                {notification.hasActions && (
                                    <div className={styles.notificationActions}>
                                        {notification.action ? (
                                            <button
                                                onClick={() => handleAccept(notification.id)}
                                                className={styles.notificationAccept}
                                            >
                                                {notification.action}
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleAccept(notification.id)}
                                                    className={styles.notificationAccept}
                                                >
                                                    Принять
                                                </button>
                                                <button
                                                    onClick={() => handleDecline(notification.id)}
                                                    className={styles.notificationDecline}
                                                >
                                                    Отклонить
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className={styles.notificationContent}>
                                <p>{notification.text}</p>
                                {notification.icon && (
                                    <div className={styles.notificationIcon}>
                                        {notification.icon}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};