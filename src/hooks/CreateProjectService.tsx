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

// Типы для пользователя в поиске
export interface UserSearchResult {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    city: string;
    avatar: string | null;
}

// Интерфейс для ответа API поиска пользователей
export interface UsersSearchResponse {
    links: {
        next: string | null;
        previous: string | null;
    };
    count: number;
    total_pages: number;
    users: UserSearchResult[];
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
    // Поиск пользователей по запросу
    searchUsers: async (searchQuery: string, page: number = 1, perPage: number = 10): Promise<UsersSearchResponse> => {
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

            return await response.json();
        } catch (error) {
            console.error('Ошибка при поиске пользователей:', error);
            throw error;
        }
    },

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

    // Выход из проекта (согласно документации DELETE /api/v1/projects/{id}/me/)
    leaveProject: async (projectId: number): Promise<{ success: boolean }> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.PROJECTS.LEAVE_PROJECT(projectId), {
                method: 'DELETE',
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

    // Получение владельца проекта
    getProjectOwner: async (projectId: number): Promise<{
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        city: string;
        avatar: string | null;
    }> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.PROJECTS.PROJECT_OWNER(projectId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка получения владельца проекта'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении владельца проекта:', error);
            throw error;
        }
    },

    // Передача прав на проект (согласно документации PUT /api/v1/projects/{id}/owner/)
    transferProjectOwnership: async (projectId: number, newOwnerId: number): Promise<{
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        city: string;
        avatar: string | null;
    }> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.PROJECTS.TRANSFER_OWNERSHIP(projectId), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify({ new_owner_id: newOwnerId })
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: 'Ошибка при передаче прав на проект'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при передаче прав на проект:', error);
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

    // Назначение отдела участнику
    assignDepartmentToMember: async (projectId: number, userId: number, departmentId: number): Promise<{ success: boolean }> => {
        try {
            const response = await fetch(API_CONFIG.FULL_URL.MEMBERS.ASSIGN_DEPARTMENT(projectId, userId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify({ department_id: departmentId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    data: errorData,
                    message: 'Ошибка назначения отдела участнику'
                };
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при назначении отдела участнику:', error);
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