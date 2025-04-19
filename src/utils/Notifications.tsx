import React from 'react';
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
}

interface NotificationsProps {
    notifications: Notification[];
    visible: boolean;
    onAccept?: (notificationId: number) => void;
    onDecline?: (notificationId: number) => void;
    onClose?: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
                                                                notifications,
                                                                visible,
                                                                onAccept,
                                                                onDecline,
                                                                onClose
                                                            }) => {
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
                                <div className={styles.notificationActions}>
                                    {onAccept && (
                                        <button
                                            onClick={() => onAccept(notification.id)}
                                            className={styles.notificationAccept}
                                        >
                                            Принять
                                        </button>
                                    )}
                                    {onDecline && (
                                        <button
                                            onClick={() => onDecline(notification.id)}
                                            className={styles.notificationDecline}
                                        >
                                            Отклонить
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className={styles.notificationContent}>
                                {notification.type === 'achievement' && (
                                    <p>
                                        <strong>У Вас новое достижение!</strong><br />
                                        {notification.text} {notification.icon}
                                    </p>
                                )}
                                {notification.type === 'task' && (
                                    <p>
                                        <strong>У Вас новая задача!</strong><br />
                                        {notification.text}
                                    </p>
                                )}
                                {notification.type === 'project' && (
                                    <p>
                                        <strong>Обновление проекта</strong><br />
                                        {notification.text}
                                    </p>
                                )}
                                {notification.type === 'system' && (
                                    <p>
                                        <strong>Системное уведомление</strong><br />
                                        {notification.text}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};