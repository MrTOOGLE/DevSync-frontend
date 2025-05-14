import API_CONFIG from '../utils/Urls.ts';
import { authService } from './AuthService.tsx';

// Типы для уведомлений
export interface Notification {
    id: number;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
    actions_data: Action[];
    footnote: string | null;
}

// Типы для действий уведомлений
export interface Action {
    text: string;
    type: 'request' | 'anchor';
    style: 'primary' | 'secondary' | 'danger';
    payload: {
        url: string;
        method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
    };
}

// Типы для сообщений WebSocket
export type WebSocketMessage = {
    type: string;
    data?: any;
    notification_id?: number;
};

// Типы для обработчиков событий WebSocket
export type WebSocketEventHandlers = {
    onNotification?: (notification: Notification) => void;
    onUpdate?: (notification: Notification) => void;
    onDelete?: (notificationId: number) => void;
    onError?: (message: string) => void;
};

class NotificationService {
    private socket: WebSocket | null = null;
    private eventHandlers: WebSocketEventHandlers = {};
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectTimeout: number = 3000; // 3 секунды

    // Получение списка всех уведомлений
    async getNotifications(): Promise<Notification[]> {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.NOTIFICATIONS.BASE_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка получения уведомлений: ${response.status}`);
            }

            const data = await response.json();
            return data.notifications || [];
        } catch (error) {
            console.error('Ошибка при получении уведомлений:', error);
            throw error;
        }
    }

    // Получение конкретного уведомления
    async getNotification(notificationId: number): Promise<Notification> {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.NOTIFICATIONS.NOTIFICATION_DETAIL(notificationId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка получения уведомления: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка при получении уведомления ${notificationId}:`, error);
            throw error;
        }
    }

    // Подключение к WebSocket для получения уведомлений в реальном времени
    connectWebSocket(eventHandlers?: WebSocketEventHandlers): void {
        if (eventHandlers) {
            this.eventHandlers = eventHandlers;
        }

        const token = authService.getToken();
        if (!token) {
            console.error('Невозможно подключиться к WebSocket: отсутствует токен авторизации');
            return;
        }

        // Закрываем существующее соединение, если оно открыто
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            this.socket.close();
        }

        // Используем URL из конфигурации
        const wsUrl = `${API_CONFIG.FULL_URL.NOTIFICATIONS.WS_URL}?token=${token}`;

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket соединение установлено');
            this.reconnectAttempts = 0; // Сбрасываем счетчик попыток при успешном подключении
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleWebSocketMessage(message);
            } catch (error) {
                console.error('Ошибка при обработке сообщения WebSocket:', error);
            }
        };

        this.socket.onclose = (event) => {
            console.log(`WebSocket соединение закрыто: ${event.code} ${event.reason}`);
            this.handleReconnect();
        };

        this.socket.onerror = (error) => {
            console.error('Ошибка WebSocket:', error);
            // Ошибка обычно приводит к закрытию соединения, поэтому не вызываем handleReconnect здесь
        };
    }

    // Обработка автоматического переподключения
    private handleReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Попытка переподключения ${this.reconnectAttempts}/${this.maxReconnectAttempts} через ${this.reconnectTimeout / 1000} сек.`);

            setTimeout(() => {
                this.connectWebSocket();
            }, this.reconnectTimeout);

            // Увеличиваем таймаут для следующей попытки (экспоненциальная задержка)
            this.reconnectTimeout = Math.min(this.reconnectTimeout * 1.5, 30000); // Максимум 30 секунд
        } else {
            console.error('Превышено максимальное количество попыток переподключения к WebSocket');
        }
    }

    // Обработка сообщений от WebSocket
    private handleWebSocketMessage(message: any): void {
        if (!message || !message.type) {
            console.error('Получено некорректное сообщение WebSocket:', message);
            return;
        }

        switch (message.type) {
            case 'notification':
                this.handleNotificationMessage(message.data);
                break;
            case 'error':
                if (this.eventHandlers.onError) {
                    this.eventHandlers.onError(message.data?.message || 'Неизвестная ошибка');
                }
                console.error('Ошибка WebSocket:', message.data?.message);
                break;
            default:
                console.log('Неизвестный тип сообщения WebSocket:', message.type);
        }
    }

    // Обработка сообщений уведомлений
    private handleNotificationMessage(data: any): void {
        if (!data || !data.type) {
            console.error('Получено некорректное сообщение уведомления:', data);
            return;
        }

        switch (data.type) {
            case 'NEW':
                if (this.eventHandlers.onNotification && data.data) {
                    this.eventHandlers.onNotification(data.data);
                }
                break;
            case 'UPDATE':
                if (this.eventHandlers.onUpdate && data.data) {
                    this.eventHandlers.onUpdate(data.data);
                }
                break;
            case 'DELETE':
                if (this.eventHandlers.onDelete && data.id) {
                    this.eventHandlers.onDelete(data.id);
                }
                break;
            default:
                console.log('Неизвестный тип сообщения уведомления:', data.type);
        }
    }

    // Отправка сообщения в WebSocket
    sendWebSocketMessage(message: WebSocketMessage): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket не подключен, невозможно отправить сообщение');
            return;
        }

        try {
            this.socket.send(JSON.stringify(message));
        } catch (error) {
            console.error('Ошибка при отправке сообщения WebSocket:', error);
        }
    }

    // Пометить уведомление как прочитанное
    markAsRead(notificationId: number): void {
        this.sendWebSocketMessage({
            type: 'mark_as_read',
            notification_id: notificationId
        });
    }

    // Пометить все уведомления как прочитанные
    markAllAsRead(): void {
        this.sendWebSocketMessage({
            type: 'mark_all_read'
        });
    }

    // Скрыть уведомление
    markAsHidden(notificationId: number): void {
        this.sendWebSocketMessage({
            type: 'mark_as_hidden',
            notification_id: notificationId
        });
    }

    // Скрыть все уведомления
    markAllAsHidden(): void {
        this.sendWebSocketMessage({
            type: 'mark_all_hidden'
        });
    }

    // Закрыть WebSocket соединение
    disconnectWebSocket(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    // Получить заголовки авторизации
    getAuthHeaders(): HeadersInit {
        return authService.getAuthHeaders();
    }
}

export const notificationService = new NotificationService();
export default notificationService;