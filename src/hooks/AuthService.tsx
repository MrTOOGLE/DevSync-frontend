const TOKEN_KEY = 'token';
import API_CONFIG from '../utils/Urls.ts'

export interface AuthError {
    status?: number;
    data?: any;
    message: string;
}

/**
 * Cервис для работы с авторизацией/регистраицей и подтверждением почты
 */
export const authService = {
    // Авторизация и получение токена
    login: async (credentials: { email: string, password: string }): Promise<string> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.AUTH.LOGIN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            // Проверяем наличие токена в ответе
            if (data && data.auth_token) {
                authService.setToken(data.auth_token);
                return data.auth_token;
            }

            // Проверяем наличие ошибок в ответе
            const hasErrors = typeof data === 'object' &&
                Object.values(data).some(value => Array.isArray(value) && value.length > 0);

            if (hasErrors || data.detail) {
                throw {
                    status: response.status,
                    data: data,
                    message: 'Ошибка авторизации'
                };
            } else {
                throw {
                    status: response.status,
                    message: 'Токен не получен от сервера'
                };
            }
        } catch (error) {
            console.error('Ошибка в сервисе авторизации:', error);
            throw error;
        }
    },

    // Регистрация нового пользователя
    register: async (userData: any): Promise<any> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.AUTH.REGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            // Проверяем, содержит ли ответ ошибки (поля с массивами ошибок)
            const hasErrors = typeof data === 'object' &&
                Object.values(data).some(value => Array.isArray(value) && value.length > 0);

            if (!hasErrors) {
                return data;
            } else {
                // Выбрасываем ошибку с данными от сервера
                throw {
                    status: response.status,
                    data: data,
                    message: 'Ошибка регистрации'
                };
            }
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            throw error;
        }
    },

    // Отправка кода подтверждения на почту
    sendVerificationCode: async (email: string): Promise<any> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.AUTH.SEND_CODE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            // Проверяем наличие ошибок в ответе
            const hasErrors = typeof data === 'object' &&
                Object.values(data).some(value => Array.isArray(value) && value.length > 0);

            if (!hasErrors) {
                return data;
            } else {
                throw {
                    status: response.status,
                    data: data,
                    message: 'Ошибка отправки кода подтверждения'
                };
            }
        } catch (error) {
            console.error('Ошибка при отправке кода подтверждения:', error);
            throw error;
        }
    },

    // Подтверждение почты по коду
    confirmEmail: async (email: string, code: string): Promise<any> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.AUTH.CONFIRM_EMAIL_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            // Проверяем наличие ошибок в ответе
            const hasErrors = typeof data === 'object' &&
                Object.values(data).some(value => Array.isArray(value) && value.length > 0);

            if (!hasErrors) {
                return data;
            } else {
                throw {
                    status: response.status,
                    data: data,
                    message: 'Ошибка подтверждения почты'
                };
            }
        } catch (error) {
            console.error('Ошибка при подтверждении почты:', error);
            throw error;
        }
    },

    // Выход из системы (локальное удаление токена)
    logout: (): void => {
        authService.removeToken();
        window.location.href = '/';
        // TODO: Здесь можно также добавить вызов API для инвалидации токена на сервере
    },

    // Управление токеном
    setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
    getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
    removeToken: (): void => localStorage.removeItem(TOKEN_KEY),

    // Проверка авторизации
    isAuthenticated: (): boolean => !!localStorage.getItem(TOKEN_KEY),

    // Получение заголовков для авторизованных запросов
    getAuthHeaders: (): HeadersInit => {
        const token = authService.getToken();
        return token ? {'Authorization': `Token ${token}`} : {};
    }
};