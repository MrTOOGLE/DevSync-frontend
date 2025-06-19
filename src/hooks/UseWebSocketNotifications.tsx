import { useEffect, useState, useCallback, useRef } from 'react';
import { authService } from './AuthService';
import { Notification } from './NotificationService';

// Типы сообщений WebSocket согласно документации
interface WebSocketMessage {
    type: 'notification' | 'error';
    data: any;
}

interface NotificationWebSocketMessage {
    type: 'notification';
    data: {
        id: number;
        type: 'NEW' | 'UPDATE' | 'DELETE';
        data: Notification | {};
    };
}

interface ErrorWebSocketMessage {
    type: 'error';
    data: {
        message: string;
    };
}

// Типы сообщений от клиента к серверу
interface MarkAsReadMessage {
    type: 'mark_as_read';
    notification_id: number;
}

interface MarkAllReadMessage {
    type: 'mark_all_read';
}

interface MarkAsHiddenMessage {
    type: 'mark_as_hidden';
    notification_id: number;
}

interface MarkAllHiddenMessage {
    type: 'mark_all_hidden';
}

type ClientMessage = MarkAsReadMessage | MarkAllReadMessage | MarkAsHiddenMessage | MarkAllHiddenMessage;

interface UseWebSocketNotificationsOptions {
    onNotificationReceived?: (notification: Notification) => void;
    onNotificationUpdated?: (notification: Notification) => void;
    onNotificationDeleted?: (notificationId: number) => void;
    onError?: (error: string) => void;
}

export const useWebSocketNotifications = (options: UseWebSocketNotificationsOptions = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const websocketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const shouldReconnect = useRef(true);
    const isConnecting = useRef(false);

    // Функция подключения к WebSocket
    const connect = useCallback(() => {
        // Предотвращаем множественные подключения
        if (isConnecting.current || websocketRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        if (!authService.isAuthenticated()) {
            console.warn('Пользователь не авторизован, WebSocket подключение не устанавливается');
            return;
        }

        const token = authService.getToken();
        if (!token) {
            console.error('Токен авторизации не найден');
            return;
        }

        try {
            isConnecting.current = true;

            // Закрываем предыдущее соединение если оно есть
            if (websocketRef.current) {
                websocketRef.current.close();
                websocketRef.current = null;
            }

            // Создаем WebSocket соединение
            const wsUrl = `ws://localhost:80/ws/notifications/?token=${token}`;
            const ws = new WebSocket(wsUrl);
            websocketRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket уведомлений подключен');
                setIsConnected(true);
                setConnectionError(null);
                reconnectAttempts.current = 0;
                isConnecting.current = false;
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);

                    if (message.type === 'notification') {
                        const notificationMessage = message as NotificationWebSocketMessage;

                        switch (notificationMessage.data.type) {
                            case 'NEW':
                                options.onNotificationReceived?.(notificationMessage.data.data as Notification);
                                break;
                            case 'UPDATE':
                                options.onNotificationUpdated?.(notificationMessage.data.data as Notification);
                                break;
                            case 'DELETE':
                                options.onNotificationDeleted?.(notificationMessage.data.id);
                                break;
                        }
                    } else if (message.type === 'error') {
                        const errorMessage = message as ErrorWebSocketMessage;
                        console.error('WebSocket ошибка:', errorMessage.data.message);
                        options.onError?.(errorMessage.data.message);
                    }
                } catch (error) {
                    console.error('Ошибка парсинга WebSocket сообщения:', error);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket уведомлений отключен', event.code, event.reason);
                setIsConnected(false);
                websocketRef.current = null;
                isConnecting.current = false;

                // Попытка переподключения, если это не было намеренное закрытие
                if (shouldReconnect.current &&
                    event.code !== 1000 &&
                    reconnectAttempts.current < maxReconnectAttempts &&
                    authService.isAuthenticated()) {

                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                    console.log(`Попытка переподключения через ${delay}мс (попытка ${reconnectAttempts.current + 1})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttempts.current++;
                        connect();
                    }, delay);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket ошибка:', error);
                setConnectionError('Ошибка подключения к серверу уведомлений');
                isConnecting.current = false;
            };

        } catch (error) {
            console.error('Ошибка создания WebSocket соединения:', error);
            setConnectionError('Не удалось подключиться к серверу уведомлений');
            isConnecting.current = false;
        }
    }, [options]);

    // Функция отключения от WebSocket
    const disconnect = useCallback(() => {
        shouldReconnect.current = false;

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (websocketRef.current) {
            websocketRef.current.close(1000, 'Отключение по инициативе клиента');
            websocketRef.current = null;
        }

        setIsConnected(false);
        reconnectAttempts.current = 0;
        isConnecting.current = false;
    }, []);

    // Функция отправки сообщения
    const sendMessage = useCallback((message: ClientMessage) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket не подключен, сообщение не отправлено:', message);
        }
    }, []);

    // Функции для работы с уведомлениями
    const markAsRead = useCallback((notificationId: number) => {
        sendMessage({
            type: 'mark_as_read',
            notification_id: notificationId
        });
    }, [sendMessage]);

    const markAllAsRead = useCallback(() => {
        sendMessage({
            type: 'mark_all_read'
        });
    }, [sendMessage]);

    const markAsHidden = useCallback((notificationId: number) => {
        sendMessage({
            type: 'mark_as_hidden',
            notification_id: notificationId
        });
    }, [sendMessage]);

    const markAllAsHidden = useCallback(() => {
        sendMessage({
            type: 'mark_all_hidden'
        });
    }, [sendMessage]);

    // Автоматическое подключение при монтировании компонента
    useEffect(() => {
        shouldReconnect.current = true;

        if (authService.isAuthenticated()) {
            // Небольшая задержка чтобы избежать race conditions
            const timeout = setTimeout(() => {
                connect();
            }, 100);

            return () => clearTimeout(timeout);
        }

        return () => {
            shouldReconnect.current = false;
            disconnect();
        };
    }, [connect, disconnect]);

    // Отключение при размонтировании
    useEffect(() => {
        return () => {
            shouldReconnect.current = false;
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        connectionError,
        connect,
        disconnect,
        markAsRead,
        markAllAsRead,
        markAsHidden,
        markAllAsHidden
    };
};