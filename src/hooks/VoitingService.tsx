// import API_CONFIG from '../utils/Urls.ts';
// import { authService } from './AuthService.tsx';

// Типы для предложений и голосований
export interface Suggestion {
    id: number;
    title: string;
    description: string;
    status: 'new' | 'under_review' | 'approved' | 'rejected';
    author: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        avatar: string | null;
    };
    project: number;
    votes_for: number;
    votes_against: number;
    user_vote?: 'for' | 'against' | null;
    created_at: string;
    deadline?: string;
    allow_multiple_votes: boolean;
    comments_count?: number;
}

export interface SuggestionCreateData {
    title: string;
    description: string;
    deadline?: string;
    allow_multiple_votes?: boolean;
}

export interface SuggestionUpdateData {
    title?: string;
    description?: string;
    status?: string;
    deadline?: string;
    allow_multiple_votes?: boolean;
}

export interface Vote {
    id: number;
    suggestion: number;
    user: number;
    vote_type: 'for' | 'against';
    created_at: string;
}

export interface VoteData {
    vote_type: 'for' | 'against';
}

export interface SuggestionsResponse {
    suggestions: Suggestion[];
}

export interface VotesResponse {
    votes: Vote[];
}

// Интерфейс для ошибок API
export interface ApiError {
    status?: number;
    data?: any;
    message: string;
}

/**
 * Сервис для работы с предложениями и голосованиями
 * ПРИМЕЧАНИЕ: API для предложений пока не реализовано в бэкенде,
 * поэтому используются заглушки с подготовкой к интеграции
 */
export const suggestionsService = {
    // Получение списка предложений проекта
    getProjectSuggestions: async (projectId: number): Promise<Suggestion[]> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/suggestions/`, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     }
            // });

            // if (!response.ok) {
            //     throw {
            //         status: response.status,
            //         message: 'Ошибка получения предложений'
            //     };
            // }

            // const data: SuggestionsResponse = await response.json();
            // return data.suggestions || [];

            // Заглушка с моковыми данными
            const mockSuggestions: Suggestion[] = [
                {
                    id: 15524,
                    title: 'Установка кофемашины на 3 этаже офиса',
                    description: 'Всех очень интересует момент, где же нам пить кофе всем вместе, если наша любимая кофейня закрылась. Мы придумали решение - поставить кофемашину прямо в офисе на 3 этаже в правом крыле. От нас требуется лишь показать, что это нам действительно нужно: голосуй "за", если хочешь и "против", если не хочешь. От нас будет нужно купить кофе и вкусняшки!',
                    status: 'new',
                    author: {
                        id: 1,
                        first_name: 'Александра',
                        last_name: 'Ланшакова',
                        email: 'avk465@tbank.ru',
                        avatar: null
                    },
                    project: projectId,
                    votes_for: 122,
                    votes_against: 2,
                    user_vote: null,
                    created_at: '2025-02-15T13:23:00Z',
                    deadline: '2025-03-10T19:00:00Z',
                    allow_multiple_votes: false,
                    comments_count: 15
                },
                {
                    id: 15525,
                    title: 'Добавление геймификации енотика-полоскуна в игру',
                    description: 'Предлагаю добавить нового персонажа - енотика-полоскуна для разнообразия игрового процесса',
                    status: 'under_review',
                    author: {
                        id: 2,
                        first_name: 'Никита',
                        last_name: 'Пупкин',
                        email: 'nikita@tbank.ru',
                        avatar: null
                    },
                    project: projectId,
                    votes_for: 45,
                    votes_against: 12,
                    user_vote: 'for',
                    created_at: '2025-02-10T13:45:00Z',
                    allow_multiple_votes: true,
                    comments_count: 8
                },
                {
                    id: 15526,
                    title: 'Переход с Python на Java',
                    description: 'Предлагаю перевести весь backend на Java для улучшения производительности',
                    status: 'rejected',
                    author: {
                        id: 3,
                        first_name: 'Владислав',
                        last_name: 'Дживаваспрингович',
                        email: 'vlad@tbank.ru',
                        avatar: null
                    },
                    project: projectId,
                    votes_for: 8,
                    votes_against: 156,
                    user_vote: 'against',
                    created_at: '2025-01-11T16:45:00Z',
                    allow_multiple_votes: false,
                    comments_count: 42
                }
            ];

            return mockSuggestions;
        } catch (error) {
            console.error('Ошибка при получении предложений:', error);
            throw error;
        }
    },

    // Создание нового предложения
    createSuggestion: async (projectId: number, suggestionData: SuggestionCreateData): Promise<Suggestion> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/suggestions/`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     },
            //     body: JSON.stringify(suggestionData)
            // });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw {
            //         status: response.status,
            //         data: errorData,
            //         message: 'Ошибка создания предложения'
            //     };
            // }

            // return await response.json();

            // Заглушка для создания предложения
            const mockNewSuggestion: Suggestion = {
                id: Date.now(),
                title: suggestionData.title,
                description: suggestionData.description,
                status: 'new',
                author: {
                    id: 1, // Текущий пользователь
                    first_name: 'Текущий',
                    last_name: 'Пользователь',
                    email: 'user@tbank.ru',
                    avatar: null
                },
                project: projectId,
                votes_for: 0,
                votes_against: 0,
                user_vote: null,
                created_at: new Date().toISOString(),
                deadline: suggestionData.deadline || undefined,
                allow_multiple_votes: suggestionData.allow_multiple_votes || false,
                comments_count: 0
            };

            return mockNewSuggestion;
        } catch (error) {
            console.error('Ошибка при создании предложения:', error);
            throw error;
        }
    },

    // Обновление предложения
    updateSuggestion: async (projectId: number, suggestionId: number, suggestionData: SuggestionUpdateData): Promise<Suggestion> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/suggestions/${suggestionId}/`, {
            //     method: 'PATCH',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     },
            //     body: JSON.stringify(suggestionData)
            // });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw {
            //         status: response.status,
            //         data: errorData,
            //         message: 'Ошибка обновления предложения'
            //     };
            // }

            // return await response.json();

            // Заглушка для обновления предложения
            const mockUpdatedSuggestion: Suggestion = {
                id: suggestionId,
                title: suggestionData.title || 'Обновленное предложение',
                description: suggestionData.description || 'Описание обновлено',
                status: (suggestionData.status as Suggestion['status']) || 'new',
                author: {
                    id: 1,
                    first_name: 'Текущий',
                    last_name: 'Пользователь',
                    email: 'user@tbank.ru',
                    avatar: null
                },
                project: projectId,
                votes_for: 0,
                votes_against: 0,
                user_vote: null,
                created_at: '2025-05-20T10:00:00Z',
                deadline: suggestionData.deadline,
                allow_multiple_votes: suggestionData.allow_multiple_votes || false,
                comments_count: 0
            };

            return mockUpdatedSuggestion;
        } catch (error) {
            console.error('Ошибка при обновлении предложения:', error);
            throw error;
        }
    },

    // Удаление предложения
    deleteSuggestion: async (projectId: number, suggestionId: number): Promise<void> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/suggestions/${suggestionId}/`, {
            //     method: 'DELETE',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     }
            // });

            // if (!response.ok) {
            //     throw {
            //         status: response.status,
            //         message: 'Ошибка удаления предложения'
            //     };
            // }

            // Заглушка для удаления - просто логируем
            console.log(`Предложение ${suggestionId} удалено из проекта ${projectId}`);
        } catch (error) {
            console.error('Ошибка при удалении предложения:', error);
            throw error;
        }
    },

    // Голосование за предложение
    voteForSuggestion: async (_projectId: number, suggestionId: number, voteData: VoteData): Promise<Vote> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/suggestions/${suggestionId}/vote/`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     },
            //     body: JSON.stringify(voteData)
            // });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw {
            //         status: response.status,
            //         data: errorData,
            //         message: 'Ошибка голосования'
            //     };
            // }

            // return await response.json();

            // Заглушка для голосования
            const mockVote: Vote = {
                id: Date.now(),
                suggestion: suggestionId,
                user: 1, // Текущий пользователь
                vote_type: voteData.vote_type,
                created_at: new Date().toISOString()
            };

            return mockVote;
        } catch (error) {
            console.error('Ошибка при голосовании:', error);
            throw error;
        }
    },

    // Получение голосов по предложению
    getSuggestionVotes: async (_projectId: number, _suggestionId: number): Promise<Vote[]> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/suggestions/${suggestionId}/votes/`, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     }
            // });

            // if (!response.ok) {
            //     throw {
            //         status: response.status,
            //         message: 'Ошибка получения голосов'
            //     };
            // }

            // const data: VotesResponse = await response.json();
            // return data.votes || [];

            // Заглушка для голосов
            return [];
        } catch (error) {
            console.error('Ошибка при получении голосов:', error);
            throw error;
        }
    },

    // Получение информации о предложении
    getSuggestion: async (projectId: number, suggestionId: number): Promise<Suggestion> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/suggestions/${suggestionId}/`, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     }
            // });

            // if (!response.ok) {
            //     throw {
            //         status: response.status,
            //         message: 'Ошибка получения предложения'
            //     };
            // }

            // return await response.json();

            // Заглушка для получения предложения
            const mockSuggestion: Suggestion = {
                id: suggestionId,
                title: 'Тестовое предложение',
                description: 'Описание тестового предложения',
                status: 'new',
                author: {
                    id: 1,
                    first_name: 'Тестовый',
                    last_name: 'Пользователь',
                    email: 'test@tbank.ru',
                    avatar: null
                },
                project: projectId,
                votes_for: 0,
                votes_against: 0,
                user_vote: null,
                created_at: '2025-05-20T10:00:00Z',
                allow_multiple_votes: false,
                comments_count: 0
            };

            return mockSuggestion;
        } catch (error) {
            console.error('Ошибка при получении предложения:', error);
            throw error;
        }
    }
};