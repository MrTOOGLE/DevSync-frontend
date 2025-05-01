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
    // Флаг для определения, есть ли у уведомления кнопки действий
    hasActions?: boolean;
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

    // Обновляем состояние только при первом рендере или изменении видимости
    // Убираем зависимость от initialNotifications, чтобы избежать сброса локальных изменений
    useEffect(() => {
        if (visible) {
            setNotifications(initialNotifications);
        }
    }, [visible]); // Теперь зависим только от visible

    // Обработка принятия уведомления - теперь удаляет его
    const handleAccept = (notificationId: number, e: React.MouseEvent) => {
        // Останавливаем всплытие события
        e.stopPropagation();

        // Удаляем уведомление из локального состояния (вместо пометки как прочитанное)
        setNotifications(prev =>
            prev.filter(notification => notification.id !== notificationId)
        );

        // Вызываем колбэк
        if (onAccept) {
            onAccept(notificationId);
        }
    };

    // Обработка отклонения уведомления
    const handleDecline = (notificationId: number, e: React.MouseEvent) => {
        // Останавливаем всплытие события
        e.stopPropagation();

        // Удаляем уведомление из локального состояния
        setNotifications(prev =>
            prev.filter(notification => notification.id !== notificationId)
        );

        // Вызываем колбэк
        if (onDecline) {
            onDecline(notificationId);
        }
    };

    // Обработка клика по уведомлению (для закрытия уведомлений без кнопок)
    const handleNotificationClick = (notification: Notification) => {
        // Проверяем, нет ли у уведомления кнопок действий
        if (!notification.hasActions) {
            // Удаляем уведомление из локального состояния
            setNotifications(prev =>
                prev.filter(item => item.id !== notification.id)
            );
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
                        <div
                            key={notification.id}
                            className={`${styles.notificationItem} ${notification.read ? styles.read : styles.unread}`}
                            onClick={() => handleNotificationClick(notification)}
                            style={{ cursor: !notification.hasActions ? 'pointer' : 'default' }}
                        >
                            <div className={styles.notificationHeader}>
                                <span className={styles.notificationDate}>{notification.date}</span>
                                {notification.hasActions !== false && (
                                    <div className={styles.notificationActions}>
                                        <button
                                            onClick={(e) => handleAccept(notification.id, e)}
                                            className={styles.notificationAccept}
                                        >
                                            Принять
                                        </button>
                                        <button
                                            onClick={(e) => handleDecline(notification.id, e)}
                                            className={styles.notificationDecline}
                                        >
                                            Отклонить
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className={styles.notificationContent}>
                                <p>{notification.text}</p>
                                {notification.icon && (
                                    <div className={styles.notificationIcon}>
                                        <img src={notification.icon} alt="Иконка уведомления" />
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