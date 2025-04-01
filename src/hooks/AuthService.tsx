const API_URL = 'http://localhost:80/api';
const TOKEN_KEY = 'token';

/**
 * Cервис для работы с авторизацией
 */
export const authService = {
    // Авторизация и получение токена
    login: async (credentials: { email: string, password: string }): Promise<string> => {
        const response = await fetch(`${API_URL}/auth/token/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            throw new Error('Ошибка авторизации');
        }

        const token = await response.json();
        authService.setToken(token.auth_token);
        return token.auth_token;
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
        return token ? { 'Authorization': `Token ${token}` } : {};
    }
};