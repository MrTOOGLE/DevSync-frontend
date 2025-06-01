import API_CONFIG from '../utils/Urls.ts';
import { authService } from './AuthService.tsx';

// Интерфейс для пользователя (согласно API)
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    city: string;
    avatar: string | null;
}

// Интерфейс для проекта пользователя
export interface UserProject {
    id: number;
    title: string;
    date_created: string;
    owner: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        avatar: string | null;
    };
    description: string;
    is_public: boolean;
    avatar: string | null;
}

// Интерфейс для ответа API проектов
export interface UserProjectsResponse {
    projects: UserProject[];
}

// Интерфейс для обновления пользователя
export interface UpdateUserData {
    first_name?: string;
    last_name?: string;
    city?: string;
    avatar?: File | null;
}

// Интерфейс для ошибок API
export interface ApiError {
    status?: number;
    data?: any;
    message: string;
}

/**
 * Сервис для работы с пользователями
 */
export const userService = {
    // Получение информации о текущем пользователе
    getCurrentUser: async (): Promise<User> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.USERS.ME_URL, {
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
            console.error('Ошибка при получении данных пользователя:', error);
            throw error;
        }
    },

    // Обновление данных текущего пользователя
    updateCurrentUser: async (userData: UpdateUserData): Promise<User> => {
        try {
            let body: string | FormData;
            let headers: HeadersInit;

            // Если есть файл аватара, используем FormData
            if (userData.avatar instanceof File) {
                const formData = new FormData();

                if (userData.first_name) formData.append('first_name', userData.first_name);
                if (userData.last_name) formData.append('last_name', userData.last_name);
                if (userData.city) formData.append('city', userData.city);
                formData.append('avatar', userData.avatar);

                body = formData;
                headers = {
                    // НЕ устанавливаем Content-Type для FormData - браузер сам установит с boundary
                    ...authService.getAuthHeaders()
                };
            } else {
                // Обычный JSON запрос
                const dataToSend: any = {};
                if (userData.first_name !== undefined) dataToSend.first_name = userData.first_name;
                if (userData.last_name !== undefined) dataToSend.last_name = userData.last_name;
                if (userData.city !== undefined) dataToSend.city = userData.city;
                if (userData.avatar === null) dataToSend.avatar = null;

                body = JSON.stringify(dataToSend);
                headers = {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                };
            }

            const response = await fetch(API_CONFIG.FULL_URL.USERS.ME_URL, {
                method: 'PATCH',
                headers,
                body
            });

            if (!response.ok) {
                let errorData;
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                } else {
                    // Если сервер вернул HTML или другой формат
                    const textError = await response.text();
                    console.error('Server returned non-JSON response:', textError);
                    errorData = { message: 'Ошибка сервера при обновлении профиля' };
                }

                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка обновления данных пользователя'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при обновлении данных пользователя:', error);
            throw error;
        }
    },

    // Получение проектов пользователя
    getUserProjects: async (): Promise<UserProject[]> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.PROJECTS.BASE_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения проектов пользователя'
                };
            }

            const data: UserProjectsResponse = await response.json();
            return data.projects || [];
        } catch (error) {
            console.error('Ошибка при получении проектов пользователя:', error);
            throw error;
        }
    },

    // Удаление текущего пользователя
    deleteCurrentUser: async (): Promise<void> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.USERS.ME_URL, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка удаления аккаунта'
                };
            }

            // После удаления аккаунта выходим из системы
            authService.logout();
        } catch (error) {
            console.error('Ошибка при удалении аккаунта:', error);
            throw error;
        }
    },

    // Поиск пользователей
    searchUsers: async (searchQuery: string, page: number = 1, perPage: number = 10): Promise<{
        users: User[],
        count: number,
        total_pages: number,
        next: string | null,
        previous: string | null
    }> => {
        try {
            const url = new URL(API_CONFIG.FULL_URL.USERS.BASE_URL);

            if (searchQuery) {
                url.searchParams.append('search', searchQuery);
            }
            url.searchParams.append('page', page.toString());
            url.searchParams.append('per_page', perPage.toString());

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка поиска пользователей'
                };
            }

            const data = await response.json();
            return {
                users: data.users || [],
                count: data.count || 0,
                total_pages: data.total_pages || 0,
                next: data.links?.next || null,
                previous: data.links?.previous || null
            };
        } catch (error) {
            console.error('Ошибка при поиске пользователей:', error);
            throw error;
        }
    },

    // Преобразование API проекта в формат для UI
    convertProjectForUI: (project: UserProject) => ({
        id: project.id,
        title: project.title,
        isPrivate: !project.is_public,
        emoji: '📁', // TODO: По умолчанию, можно добавить логику определения эмодзи??? :D
        description: project.description,
        owner: project.owner,
        date_created: project.date_created
    })
};