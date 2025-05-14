import API_CONFIG from "../utils/Urls.ts";
import { authService } from "./AuthService.tsx";

// Типы для данных пользователя
export interface UserProfile {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    city: string;
    avatar: string | File | null;
}

// Интерфейс для ошибок API
export interface ApiError {
    status?: number;
    data?: any;
    message: string;
}

/**
 * Сервис для работы с профилем пользователя
 */
export const profileService = {
    // Получить информацию о текущем пользователе
    getCurrentUser: async (): Promise<UserProfile> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.AUTH.ME_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения данных пользователя'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка в сервисе профиля:', error);
            throw error;
        }
    },

    // Обновить информацию о текущем пользователе
    updateProfile: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
        try {
            // Для обработки данных формы с файлами используем FormData
            const formData = new FormData();

            // Добавляем поля пользователя в formData
            if (userData.first_name) formData.append('first_name', userData.first_name);
            if (userData.last_name) formData.append('last_name', userData.last_name);
            if (userData.city) formData.append('city', userData.city);

            // Если есть аватар в виде File, добавляем его
            if (userData.avatar instanceof File) {
                formData.append('avatar', userData.avatar);
            }

            const response = await fetch(API_CONFIG.FULL_URL.AUTH.ME_URL, {
                method: 'PATCH',
                headers: {
                    ...authService.getAuthHeaders()
                    // Не указываем 'Content-Type': 'application/json' для FormData
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка обновления профиля'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            throw error;
        }
    },

    // Удалить учетную запись пользователя
    deleteAccount: async (): Promise<void> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.AUTH.ME_URL, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка удаления учетной записи'
                };
            }

            // После успешного удаления, разлогиниваем пользователя
            authService.logout();
        } catch (error) {
            console.error('Ошибка при удалении учетной записи:', error);
            throw error;
        }
    }
};