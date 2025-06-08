import API_CONFIG from '../utils/Urls.ts';
import { authService } from './AuthService.tsx';

// Типы для голосований
export interface VotingOption {
    id: number;
    body: string;
    votes_count: number;
}

export interface VotingTag {
    tag: string;
}

export interface Voting {
    id: number;
    title: string;
    body: string;
    date_started: string;
    end_date: string;
    creator: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        city: string;
        avatar: string | null;
    };
    status: string;
    options: VotingOption[];
    is_anonymous: boolean;
    allow_multiple: boolean;
    tags: VotingTag[];
}

export interface VotingChoice {
    id: number;
    voting_option: number;
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        city: string;
        avatar: string | null;
    };
}

export interface VotingCreateData {
    title: string;
    body: string;
    end_date: string;
    options: { body: string }[];
    is_anonymous: boolean;
    allow_multiple?: boolean;
    tags?: { tag: string }[];
}

export interface VotingsResponse {
    links: {
        next: string | null;
        previous: string | null;
    };
    count: number;
    total_pages: number;
    votings: Voting[];
}

export interface Comment {
    id: number;
    body: string;
    date_sent: string;
    sender: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        avatar: string | null;
    };
    parent_comment: number | null;
}

export interface CommentCreateData {
    body: string;
    parent_comment?: number;
}

// Интерфейс для ошибок API
export interface ApiError {
    status?: number;
    data?: any;
    message: string;
}

/**
 * Сервис для работы с голосованиями
 */
export const votingService = {
    // Получение списка голосований проекта
    getProjectVotings: async (projectId: number, page: number = 1): Promise<VotingsResponse> => {
        try {
            const url = new URL(API_CONFIG.FULL_URL.VOTINGS.BASE_URL(projectId));
            url.searchParams.append('page', page.toString());

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
                    message: 'Ошибка получения голосований'
                };
            }

            const data = await response.json();
            // ИСПРАВЛЕНИЕ: API возвращает структуру с вложенным votings объектом
            if (data.votings && data.votings.votings) {
                return data.votings;
            }
            // Если структура изменилась, возвращаем как есть
            return data;
        } catch (error) {
            console.error('Ошибка при получении голосований:', error);
            throw error;
        }
    },

    // Создание нового голосования
    createVoting: async (projectId: number, votingData: VotingCreateData): Promise<Voting> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.VOTINGS.BASE_URL(projectId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify(votingData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка создания голосования'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании голосования:', error);
            throw error;
        }
    },

    // Получение информации о голосовании
    getVoting: async (projectId: number, votingId: number): Promise<Voting> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.VOTINGS.VOTING_DETAIL(projectId, votingId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения голосования'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении голосования:', error);
            throw error;
        }
    },

    // Удаление голосования
    deleteVoting: async (projectId: number, votingId: number): Promise<void> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.VOTINGS.VOTING_DETAIL(projectId, votingId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка удаления голосования'
                };
            }
        } catch (error) {
            console.error('Ошибка при удалении голосования:', error);
            throw error;
        }
    },

    // Голосование за вариант
    vote: async (projectId: number, votingId: number, votingOption: number): Promise<VotingChoice> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.VOTINGS.VOTE(projectId, votingId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify({ voting_option: votingOption })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка голосования'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при голосовании:', error);
            throw error;
        }
    },

    // Отмена голоса
    cancelVote: async (projectId: number, votingId: number, choiceId: number): Promise<void> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.VOTINGS.CANCEL_VOTE(projectId, votingId, choiceId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка отмены голоса'
                };
            }
        } catch (error) {
            console.error('Ошибка при отмене голоса:', error);
            throw error;
        }
    },

    // Получение вариантов ответов
    getVotingOptions: async (projectId: number, votingId: number): Promise<VotingOption[]> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.VOTINGS.OPTIONS(projectId, votingId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения вариантов ответов'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении вариантов ответов:', error);
            throw error;
        }
    },

    // Получение комментариев к голосованию
    getVotingComments: async (projectId: number, votingId: number): Promise<Comment[]> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.VOTINGS.COMMENTS(projectId, votingId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения комментариев'
                };
            }

            const data = await response.json();
            return data.comments || [];
        } catch (error) {
            console.error('Ошибка при получении комментариев:', error);
            throw error;
        }
    },

    // Создание комментария
    createComment: async (projectId: number, votingId: number, commentData: CommentCreateData): Promise<Comment> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.VOTINGS.COMMENTS(projectId, votingId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify(commentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка создания комментария'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании комментария:', error);
            throw error;
        }
    },

    // Обновление комментария
    updateComment: async (projectId: number, votingId: number, commentId: number, body: string): Promise<Comment> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.VOTINGS.COMMENT_DETAIL(projectId, votingId, commentId), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify({ body })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка обновления комментария'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при обновлении комментария:', error);
            throw error;
        }
    },

    // Удаление комментария
    deleteComment: async (projectId: number, votingId: number, commentId: number): Promise<void> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.VOTINGS.COMMENT_DETAIL(projectId, votingId, commentId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка удаления комментария'
                };
            }
        } catch (error) {
            console.error('Ошибка при удалении комментария:', error);
            throw error;
        }
    }
};