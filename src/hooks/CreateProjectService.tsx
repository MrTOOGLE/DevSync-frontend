import API_CONFIG from '../utils/Urls.ts';
import { authService } from './AuthService.tsx';

// Типы для данных проекта
export interface ProjectData {
    id?: number;
    title: string;
    description: string;
    is_public: boolean;
    date_created?: string;
    owner?: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        avatar: string | null;
    };
    avatar?: string | null;
}

// Типы для пользователя в поиск
export interface UserSearchResult {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
}

// Типы для участника проекта
export interface ProjectMember {
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        avatar: string | null;
    };
    date_joined: string;
}

// Типы для отдела проекта
export interface Department {
    id?: number;
    title: string;
    description: string;
    project?: number;
    date_created?: string;
    members?: ProjectMember[];
}

// Типы для роли в проекте
export interface Role {
    id?: number;
    name: string;
    project?: number;
    color: string;
    department: number | null;
    rank: number;
}

// Типы для приглашения в проект
export interface Invitation {
    id?: number;
    project?: number;
    user: number;
    invited_by?: number;
    date_created?: string;
}

// Интерфейс для ошибок API
export interface ApiError {
    status?: number;
    data?: any;
    message: string;
}

/**
 * Сервис для работы с проектами
 */
export const projectService = {
    // Получение списка проектов пользователя
    getProjects: async (): Promise<ProjectData[]> => {
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
                    message: 'Ошибка получения проектов'
                };
            }

            const data = await response.json();
            return data.projects || [];
        } catch (error) {
            console.error('Ошибка в сервисе проектов:', error);
            throw error;
        }
    },

    // Создание нового проекта
    createProject: async (projectData: ProjectData): Promise<ProjectData> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.PROJECTS.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка создания проекта'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании проекта:', error);
            throw error;
        }
    },

    // Получение информации о проекте
    getProject: async (projectId: number): Promise<ProjectData> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.PROJECTS.PROJECT_DETAIL(projectId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения проекта'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении проекта:', error);
            throw error;
        }
    },

    // Обновление проекта
    updateProject: async (projectId: number, projectData: Partial<ProjectData>): Promise<ProjectData> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.PROJECTS.PROJECT_DETAIL(projectId), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка обновления проекта'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при обновлении проекта:', error);
            throw error;
        }
    },

    // Удаление проекта
    deleteProject: async (projectId: number): Promise<void> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.PROJECTS.PROJECT_DETAIL(projectId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка удаления проекта'
                };
            }
        } catch (error) {
            console.error('Ошибка при удалении проекта:', error);
            throw error;
        }
    },

    // Получение списка публичных проектов
    getPublicProjects: async (page: number = 1, perPage: number = 20): Promise<{
        projects: ProjectData[],
        count: number,
        total_pages: number,
        next: string | null,
        previous: string | null
    }> => {
        try {
            const url = new URL(API_CONFIG.FULL_URL.PROJECTS.PUBLIC_PROJECTS);
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
                    message: 'Ошибка получения публичных проектов'
                };
            }

            const data = await response.json();
            return {
                projects: data.projects || [],
                count: data.count || 0,
                total_pages: data.total_pages || 0,
                next: data.links?.next || null,
                previous: data.links?.previous || null
            };
        } catch (error) {
            console.error('Ошибка при получении публичных проектов:', error);
            throw error;
        }
    },

    // Выход из проекта
    leaveProject: async (projectId: number): Promise<{ success: boolean }> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.PROJECTS.LEAVE_PROJECT(projectId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка при выходе из проекта'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при выходе из проекта:', error);
            throw error;
        }
    },

    // Присоединение к проекту
    joinProject: async (projectId: number): Promise<{ success: boolean }> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.PROJECTS.JOIN_PROJECT(projectId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка при присоединении к проекту'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при присоединении к проекту:', error);
            throw error;
        }
    },

    // РАБОТА С УЧАСТНИКАМИ

    // Получение списка участников проекта
    getProjectMembers: async (projectId: number): Promise<ProjectMember[]> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MEMBERS.BASE_URL(projectId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения участников проекта'
                };
            }

            const data = await response.json();
            return data.members || [];
        } catch (error) {
            console.error('Ошибка при получении участников проекта:', error);
            throw error;
        }
    },

    // Удаление участника из проекта
    removeProjectMember: async (projectId: number, userId: number): Promise<void> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MEMBERS.MEMBER_DETAIL(projectId, userId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка удаления участника из проекта'
                };
            }
        } catch (error) {
            console.error('Ошибка при удалении участника:', error);
            throw error;
        }
    },

    // Поиск участников
    searchUsers: async (query: string): Promise<UserSearchResult[]> => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}api/v1/users/search?query=${encodeURIComponent(query)}`, {
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
            return data.users || [];
        } catch (error) {
            console.error('Ошибка при поиске пользователей:', error);
            // В случае ошибки возвращаем пустой массив
            return [];
        }
    },

    // Назначение пользователя в отдел
    assignUserToDepartment: async (projectId: number, userId: number, departmentId: number): Promise<{ success: boolean }> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MEMBERS.ASSIGN_DEPARTMENT(projectId, userId, departmentId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка назначения пользователя в отдел'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при назначении пользователя в отдел:', error);
            throw error;
        }
    },

    // РАБОТА С ОТДЕЛАМИ

    // Получение списка отделов проекта
    getProjectDepartments: async (projectId: number): Promise<Department[]> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.DEPARTMENTS.BASE_URL(projectId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения отделов проекта'
                };
            }

            const data = await response.json();
            return data.departments || [];
        } catch (error) {
            console.error('Ошибка при получении отделов проекта:', error);
            throw error;
        }
    },

    // Создание отдела проекта
    createDepartment: async (projectId: number, departmentData: { title: string, description: string }): Promise<Department> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.DEPARTMENTS.BASE_URL(projectId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify(departmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка создания отдела'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании отдела:', error);
            throw error;
        }
    },

    // Получение информации об отделе
    getDepartment: async (projectId: number, departmentId: number): Promise<Department> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.DEPARTMENTS.DEPARTMENT_DETAIL(projectId, departmentId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения отдела'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении отдела:', error);
            throw error;
        }
    },

    // Обновление отдела
    updateDepartment: async (projectId: number, departmentId: number, departmentData: Partial<Department>): Promise<Department> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.DEPARTMENTS.DEPARTMENT_DETAIL(projectId, departmentId), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify(departmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка обновления отдела'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при обновлении отдела:', error);
            throw error;
        }
    },

    // Удаление отдела
    deleteDepartment: async (projectId: number, departmentId: number): Promise<void> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.DEPARTMENTS.DEPARTMENT_DETAIL(projectId, departmentId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка удаления отдела'
                };
            }
        } catch (error) {
            console.error('Ошибка при удалении отдела:', error);
            throw error;
        }
    },

    // РАБОТА С ПРИГЛАШЕНИЯМИ

    // Получение списка приглашений проекта
    getProjectInvitations: async (projectId: number): Promise<Invitation[]> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.INVITATIONS.BASE_URL(projectId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения приглашений проекта'
                };
            }

            const data = await response.json();
            return data.invitations || [];
        } catch (error) {
            console.error('Ошибка при получении приглашений проекта:', error);
            throw error;
        }
    },

    // Создание приглашения в проект
    createInvitation: async (projectId: number, userId: number): Promise<Invitation> => {
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
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка создания приглашения'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании приглашения:', error);
            throw error;
        }
    },

    // Удаление приглашения
    deleteInvitation: async (projectId: number, invitationId: number): Promise<void> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.INVITATIONS.INVITATION_DETAIL(projectId, invitationId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка удаления приглашения'
                };
            }
        } catch (error) {
            console.error('Ошибка при удалении приглашения:', error);
            throw error;
        }
    }
};