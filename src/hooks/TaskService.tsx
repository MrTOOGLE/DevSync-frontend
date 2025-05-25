// import API_CONFIG from '../utils/Urls.ts';
// import { authService } from './AuthService.tsx';

// Типы для задач
export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'new' | 'in_progress' | 'completed' | 'on_hold';
    priority: 'low' | 'medium' | 'high';
    assignee?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        avatar: string | null;
    };
    project: number;
    deadline?: string;
    created_at: string;
    updated_at: string;
}

export interface TaskCreateData {
    title: string;
    description: string;
    status?: string;
    priority?: string;
    assignee?: number;
    deadline?: string;
}

export interface TaskUpdateData {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee?: number;
    deadline?: string;
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
 * ПРИМЕЧАНИЕ: API для задач пока не реализовано в бэкенде,
 * поэтому используются заглушки с подготовкой к интеграции
 */
export const tasksService = {
    // Получение списка задач проекта
    getProjectTasks: async (projectId: number): Promise<Task[]> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/tasks/`, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     }
            // });

            // if (!response.ok) {
            //     throw {
            //         status: response.status,
            //         message: 'Ошибка получения задач'
            //     };
            // }

            // const data: TasksResponse = await response.json();
            // return data.tasks || [];

            // Заглушка с моковыми данными
            const mockTasks: Task[] = [
                {
                    id: 1,
                    title: 'Разработать макет главной страницы',
                    description: 'Создать дизайн-макет главной страницы с учетом фирменного стиля',
                    status: 'in_progress',
                    priority: 'high',
                    assignee: {
                        id: 1,
                        first_name: 'Александра',
                        last_name: 'Ланшакова',
                        email: 'avk465@tbank.ru',
                        avatar: null
                    },
                    project: projectId,
                    deadline: '2025-06-10',
                    created_at: '2025-05-20T10:00:00Z',
                    updated_at: '2025-05-22T14:30:00Z'
                },
                {
                    id: 2,
                    title: 'Настроить CI/CD pipeline',
                    description: 'Настроить автоматическую сборку и развертывание приложения',
                    status: 'new',
                    priority: 'medium',
                    project: projectId,
                    deadline: '2025-06-15',
                    created_at: '2025-05-21T09:00:00Z',
                    updated_at: '2025-05-21T09:00:00Z'
                },
                {
                    id: 3,
                    title: 'Провести код-ревью',
                    description: 'Проверить качество кода модуля авторизации',
                    status: 'completed',
                    priority: 'low',
                    assignee: {
                        id: 2,
                        first_name: 'Владислав',
                        last_name: 'Дживаваспрингович',
                        email: 'vlad@tbank.ru',
                        avatar: null
                    },
                    project: projectId,
                    created_at: '2025-05-18T16:00:00Z',
                    updated_at: '2025-05-19T11:20:00Z'
                },
                {
                    id: 4,
                    title: 'Разработать мобильную версию',
                    description: 'Создать адаптивную версию для мобильных устройств',
                    status: 'new',
                    priority: 'high',
                    project: projectId,
                    deadline: '10.03.2025 - 10.04.2025',
                    created_at: '2025-05-20T10:00:00Z',
                    updated_at: '2025-05-22T14:30:00Z'
                }
            ];

            return mockTasks;
        } catch (error) {
            console.error('Ошибка при получении задач:', error);
            throw error;
        }
    },

    // Создание новой задачи
    createTask: async (projectId: number, taskData: TaskCreateData): Promise<Task> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/tasks/`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     },
            //     body: JSON.stringify(taskData)
            // });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw {
            //         status: response.status,
            //         data: errorData,
            //         message: 'Ошибка создания задачи'
            //     };
            // }

            // return await response.json();

            // Заглушка для создания задачи
            const mockNewTask: Task = {
                id: Date.now(),
                title: taskData.title,
                description: taskData.description,
                status: (taskData.status as Task['status']) || 'new',
                priority: (taskData.priority as Task['priority']) || 'medium',
                project: projectId,
                deadline: taskData.deadline || undefined,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            return mockNewTask;
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            throw error;
        }
    },

    // Обновление задачи
    updateTask: async (projectId: number, taskId: number, taskData: TaskUpdateData): Promise<Task> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/tasks/${taskId}/`, {
            //     method: 'PATCH',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     },
            //     body: JSON.stringify(taskData)
            // });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw {
            //         status: response.status,
            //         data: errorData,
            //         message: 'Ошибка обновления задачи'
            //     };
            // }

            // return await response.json();

            // Заглушка для обновления задачи
            const mockUpdatedTask: Task = {
                id: taskId,
                title: taskData.title || 'Обновленная задача',
                description: taskData.description || 'Описание обновлено',
                status: (taskData.status as Task['status']) || 'new',
                priority: (taskData.priority as Task['priority']) || 'medium',
                project: projectId,
                deadline: taskData.deadline,
                created_at: '2025-05-20T10:00:00Z',
                updated_at: new Date().toISOString()
            };

            return mockUpdatedTask;
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            throw error;
        }
    },

    // Удаление задачи
    deleteTask: async (projectId: number, taskId: number): Promise<void> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/tasks/${taskId}/`, {
            //     method: 'DELETE',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     }
            // });

            // if (!response.ok) {
            //     throw {
            //         status: response.status,
            //         message: 'Ошибка удаления задачи'
            //     };
            // }

            // Заглушка для удаления - просто логируем
            console.log(`Задача ${taskId} удалена из проекта ${projectId}`);
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
            throw error;
        }
    },

    // Получение информации о задаче
    getTask: async (projectId: number, taskId: number): Promise<Task> => {
        try {
            // TODO: Заменить на реальный API когда будет реализован
            // const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/projects/${projectId}/tasks/${taskId}/`, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         ...authService.getAuthHeaders()
            //     }
            // });

            // if (!response.ok) {
            //     throw {
            //         status: response.status,
            //         message: 'Ошибка получения задачи'
            //     };
            // }

            // return await response.json();

            // Заглушка для получения задачи
            const mockTask: Task = {
                id: taskId,
                title: 'Тестовая задача',
                description: 'Описание тестовой задачи',
                status: 'new',
                priority: 'medium',
                project: projectId,
                created_at: '2025-05-20T10:00:00Z',
                updated_at: '2025-05-20T10:00:00Z'
            };

            return mockTask;
        } catch (error) {
            console.error('Ошибка при получении задачи:', error);
            throw error;
        }
    }
};