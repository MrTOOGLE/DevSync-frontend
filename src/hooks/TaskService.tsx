import API_CONFIG from '../utils/Urls.ts';
import { authService } from './AuthService.tsx';

// Типы для задач
export interface Task {
    id: number;
    title: string;
    start_date: string | null;
    end_date: string | null;
    department: number | null;
    is_completed: boolean;
    assignees: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        city: string;
        avatar: string | null;
    }[];
}

export interface TaskCreateData {
    title: string;
    start_date?: string;
    end_date?: string;
    assignees: number[];
    department?: number;
}

export interface TaskUpdateData {
    title?: string;
    start_date?: string;
    end_date?: string;
    assignees?: number[];
    department?: number;
    is_completed?: boolean;
}

export interface TasksResponse {
    tasks: Task[];
}

// Интерфейс для ошибок API
export interface ApiError {
    status?: number;
    data?: any;
    message: string;
}

/**
 * Сервис для работы с задачами
 */
export const tasksService = {
    // Получение списка задач проекта
    getProjectTasks: async (projectId: number, includeAssignees: boolean = true): Promise<Task[]> => {
        try {
            const url = new URL(API_CONFIG.FULL_URL.TASKS.BASE_URL(projectId));
            if (includeAssignees) {
                url.searchParams.append('assignees', 'true');
            }

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
                    message: 'Ошибка получения задач'
                };
            }

            const data: TasksResponse = await response.json();
            return data.tasks || [];
        } catch (error) {
            console.error('Ошибка при получении задач:', error);
            throw error;
        }
    },

    // Создание новой задачи
    createTask: async (projectId: number, taskData: TaskCreateData): Promise<Task> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.TASKS.BASE_URL(projectId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка создания задачи'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            throw error;
        }
    },

    // Обновление задачи
    updateTask: async (projectId: number, taskId: number, taskData: TaskUpdateData): Promise<Task> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.TASKS.TASK_DETAIL(projectId, taskId), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка обновления задачи'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            throw error;
        }
    },

    // Удаление задачи
    deleteTask: async (projectId: number, taskId: number): Promise<void> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.TASKS.TASK_DETAIL(projectId, taskId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка удаления задачи'
                };
            }
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
            throw error;
        }
    },

    // Получение информации о задаче
    getTask: async (projectId: number, taskId: number): Promise<Task> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.TASKS.TASK_DETAIL(projectId, taskId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения задачи'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении задачи:', error);
            throw error;
        }
    },

    // Отметить задачу как выполненную/невыполненную
    toggleTaskCompletion: async (projectId: number, taskId: number, isCompleted: boolean): Promise<Task> => {
        try {
            return await tasksService.updateTask(projectId, taskId, { is_completed: isCompleted });
        } catch (error) {
            console.error('Ошибка при изменении статуса задачи:', error);
            throw error;
        }
    }
};