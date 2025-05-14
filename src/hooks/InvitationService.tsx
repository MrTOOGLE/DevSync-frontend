import API_CONFIG from '../utils/Urls.ts';
import { authService } from './AuthService.tsx';

// Типы для приглашений
export interface Invitation {
    id: number;
    project: number;
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        avatar: string | null;
    };
    invited_by: number;
    date_created: string;
}

class InvitationService {
    // Получить список моих приглашений
    async getMyInvitations(): Promise<Invitation[]> {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MY_INVITATIONS.BASE_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка получения приглашений: ${response.status}`);
            }

            const data = await response.json();
            return data.invitations || [];
        } catch (error) {
            console.error('Ошибка при получении приглашений:', error);
            throw error;
        }
    }

    // Получить конкретное приглашение
    async getInvitation(invitationId: number): Promise<Invitation> {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MY_INVITATIONS.INVITATION_DETAIL(invitationId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка получения приглашения: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка при получении приглашения ${invitationId}:`, error);
            throw error;
        }
    }

    // Принять приглашение
    async acceptInvitation(invitationId: number): Promise<{ success: boolean }> {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MY_INVITATIONS.ACCEPT_INVITATION(invitationId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка при принятии приглашения: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка при принятии приглашения ${invitationId}:`, error);
            throw error;
        }
    }

    // Отклонить приглашение
    async rejectInvitation(invitationId: number): Promise<{ success: boolean }> {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MY_INVITATIONS.REJECT_INVITATION(invitationId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка при отклонении приглашения: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка при отклонении приглашения ${invitationId}:`, error);
            throw error;
        }
    }

    // Получить список приглашений проекта
    async getProjectInvitations(projectId: number): Promise<Invitation[]> {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.INVITATIONS.BASE_URL(projectId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка получения приглашений проекта: ${response.status}`);
            }

            const data = await response.json();
            return data.invitations || [];
        } catch (error) {
            console.error(`Ошибка при получении приглашений проекта ${projectId}:`, error);
            throw error;
        }
    }

    // Создать приглашение
    async createInvitation(projectId: number, userId: number): Promise<Invitation> {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.INVITATIONS.BASE_URL(projectId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify({ user: userId })
            });

            if (!response.ok) {
                throw new Error(`Ошибка при создании приглашения: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка при создании приглашения для пользователя ${userId} в проект ${projectId}:`, error);
            throw error;
        }
    }

    // Удалить приглашение проекта
    async deleteProjectInvitation(projectId: number, invitationId: number): Promise<void> {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.INVITATIONS.INVITATION_DETAIL(projectId, invitationId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка при удалении приглашения: ${response.status}`);
            }
        } catch (error) {
            console.error(`Ошибка при удалении приглашения ${invitationId} из проекта ${projectId}:`, error);
            throw error;
        }
    }
}

export const invitationService = new InvitationService();
export default invitationService;