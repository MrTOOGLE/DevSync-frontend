import React from 'react';

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
        <div className="notifications-container">
            <div className="notifications-header">
                <h3>Уведомления</h3>
                {onClose && (
                    <button onClick={onClose} className="notifications-close">
                        ✕
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <p className="notifications-empty">У вас нет уведомлений</p>
            ) : (
                <div className="notifications-list">
                    {notifications.map(notification => (
                        <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                            <div className="notification-header">
                                <span className="notification-date">{notification.date}</span>
                                <div className="notification-actions">
                                    {onAccept && (
                                        <button
                                            onClick={() => onAccept(notification.id)}
                                            className="notification-accept"
                                        >
                                            Принять
                                        </button>
                                    )}
                                    {onDecline && (
                                        <button
                                            onClick={() => onDecline(notification.id)}
                                            className="notification-decline"
                                        >
                                            Отклонить
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="notification-content">
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