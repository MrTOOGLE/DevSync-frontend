import React, {useEffect, useState} from 'react';
import styles from '../styles/Notifications.module.css';

// Типы уведомлений
export type NotificationType = 'achievement' | 'task' | 'project' | 'system';

// Интерфейс для действий в уведомлении
export interface NotificationAction {
    text: string;
    type: 'request' | 'anchor';
    style: 'primary' | 'secondary' | 'danger';
    payload: {
        url: string;
        method?: 'POST';
    };
}

// Интерфейс для уведомления (согласно API)
export interface Notification {
    id: number;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
    actions_data: NotificationAction[];
    footnote: string | null;
}

interface NotificationsProps {
    notifications: Notification[];
    visible: boolean;
    isLoading?: boolean;
    onAccept?: (notificationId: number) => void;
    onDecline?: (notificationId: number) => void;
    onClose?: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
                                                                notifications: initialNotifications,
                                                                visible,
                                                                isLoading = false,
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
                    ? { ...notification, is_read: true }
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

    // Выполнение пользовательского действия
    const handleCustomAction = async (notification: Notification, action: NotificationAction) => {
        try {
            if (action.type === 'anchor') {
                // Если это ссылка, открываем в новой вкладке
                window.open(action.payload.url, '_blank');
            } else if (action.type === 'request') {
                // Если это запрос, выполняем соответствующее действие
                if (action.style === 'primary') {
                    handleAccept(notification.id);
                } else if (action.style === 'secondary' || action.style === 'danger') {
                    handleDecline(notification.id);
                }
            }
        } catch (error) {
            console.error('Ошибка выполнения действия:', error);
        }
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

            {isLoading ? (
                <div className={styles.notificationsEmpty}>
                    <div className={styles.loadingSpinner}>Загрузка...</div>
                </div>
            ) : notifications.length === 0 ? (
                <p className={styles.notificationsEmpty}>У вас нет уведомлений</p>
            ) : (
                <div className={styles.notificationsList}>
                    {notifications.map(notification => (
                        <div key={notification.id}
                             className={`${styles.notificationItem} ${notification.is_read ? styles.read : styles.unread}`}
                        >
                            <div className={styles.notificationHeader}>
                                <div className={styles.notificationTitle}>
                                    {notification.title}
                                </div>
                                <span className={styles.notificationDate}>
                                    {formatDate(notification.created_at)}
                                </span>
                            </div>

                            <div className={styles.notificationContent}>
                                <p>{notification.message}</p>
                                {notification.footnote && (
                                    <p className={styles.footnote}>{notification.footnote}</p>
                                )}
                            </div>

                            {notification.actions_data && notification.actions_data.length > 0 && (
                                <div className={styles.notificationActions}>
                                    {notification.actions_data.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleCustomAction(notification, action)}
                                            className={`${styles.notificationAction} ${styles[`action_${action.style}`]}`}
                                        >
                                            {action.text}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Если нет пользовательских действий, показываем стандартные кнопки */}
                            {(!notification.actions_data || notification.actions_data.length === 0) && (
                                <div className={styles.notificationActions}>
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
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};