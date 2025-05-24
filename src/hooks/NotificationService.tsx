import API_CONFIG from '../utils/Urls.ts';
import { authService } from './AuthService.tsx';

// Типы для уведомлений (обновленные согласно API)
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

// Интерфейс для ответа API
export interface NotificationsResponse {
    notifications: Notification[];
}

// Интерфейс для приглашения
export interface MyInvitation {
    id: number;
    project: {
        id: number;
        title: string;
        description: string;
        is_public: boolean;
        owner: {
            id: number;
            email: string;
            first_name: string;
            last_name: string;
            avatar: string | null;
        };
    };
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        city: string;
        avatar: string | null;
    };
    invited_by: number;
    date_created: string;
}

// Интерфейс для ответа API приглашений
export interface MyInvitationsResponse {
    invitations: MyInvitation[];
}

// Интерфейс для ошибок API
export interface ApiError {
    status?: number;
    data?: any;
    message: string;
}

/**
 * Сервис для работы с уведомлениями
 */
export const notificationsService = {
    // Получение списка уведомлений
    getNotifications: async (): Promise<Notification[]> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.NOTIFICATIONS.BASE_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения уведомлений'
                };
            }

            const data: NotificationsResponse = await response.json();
            return data.notifications || [];
        } catch (error) {
            console.error('Ошибка при получении уведомлений:', error);
            throw error;
        }
    },

    // Получение информации о конкретном уведомлении
    getNotification: async (notificationId: number): Promise<Notification> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.NOTIFICATIONS.NOTIFICATION_DETAIL(notificationId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения уведомления'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении уведомления:', error);
            throw error;
        }
    },

    // Получение моих приглашений в проекты
    getMyInvitations: async (): Promise<MyInvitation[]> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MY_INVITATIONS.BASE_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения приглашений'
                };
            }

            const data: MyInvitationsResponse = await response.json();
            return data.invitations || [];
        } catch (error) {
            console.error('Ошибка при получении приглашений:', error);
            throw error;
        }
    },

    // Принять приглашение
    acceptInvitation: async (invitationId: number): Promise<{ success: boolean }> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MY_INVITATIONS.ACCEPT_INVITATION(invitationId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка принятия приглашения'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при принятии приглашения:', error);
            throw error;
        }
    },

    // Отклонить приглашение
    rejectInvitation: async (invitationId: number): Promise<{ success: boolean }> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MY_INVITATIONS.REJECT_INVITATION(invitationId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка отклонения приглашения'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при отклонении приглашения:', error);
            throw error;
        }
    },

    // Выполнение действия из уведомления
    executeNotificationAction: async (action: NotificationAction): Promise<any> => {
        try {
            const method = action.payload.method || 'GET';
            const response = await fetch(action.payload.url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка выполнения действия'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при выполнении действия уведомления:', error);
            throw error;
        }
    },

    // Преобразование приглашений в уведомления для совместимости с текущим UI
    convertInvitationsToNotifications: (invitations: MyInvitation[]): Notification[] => {
        return invitations.map(invitation => ({
            id: invitation.id,
            title: 'Приглашение в проект',
            message: `Вас пригласили в проект "${invitation.project.title}"`,
            created_at: invitation.date_created,
            is_read: false,
            actions_data: [
                {
                    text: 'Принять',
                    type: 'request' as const,
                    style: 'primary' as const,
                    payload: {
                        url: API_CONFIG.FULL_URL.MY_INVITATIONS.ACCEPT_INVITATION(invitation.id),
                        method: 'POST'
                    }
                },
                {
                    text: 'Отклонить',
                    type: 'request' as const,
                    style: 'secondary' as const,
                    payload: {
                        url: API_CONFIG.FULL_URL.MY_INVITATIONS.REJECT_INVITATION(invitation.id),
                        method: 'POST'
                    }
                }
            ],
            footnote: `От ${invitation.project.owner.first_name} ${invitation.project.owner.last_name}`
        }));
    },

    // Получение всех уведомлений (системные + приглашения)
    getAllNotifications: async (): Promise<Notification[]> => {
        try {
            const [notifications, invitations] = await Promise.all([
                notificationsService.getNotifications(),
                notificationsService.getMyInvitations()
            ]);

            const invitationNotifications = notificationsService.convertInvitationsToNotifications(invitations);

            // Объединяем и сортируем по дате
            const allNotifications = [...notifications, ...invitationNotifications];
            allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return allNotifications;
        } catch (error) {
            console.error('Ошибка при получении всех уведомлений:', error);
            // Возвращаем пустой массив в случае ошибки
            return [];
        }
    }
};