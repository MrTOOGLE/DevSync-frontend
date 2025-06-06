const API_CONFIG = {
    BASE_URL: "http://localhost:80/",

    ENDPOINTS: {
        AUTH: {
            REGISTER_URL: "api/v1/users/",
            // Согласно документации, эндпоинта для логина нет в разделе пользователей
            // Предполагаем, что используется стандартный djoser эндпоинт
            LOGIN_URL: "api/v1/auth/token/login/",
            LOGOUT_URL: "api/v1/auth/token/logout/",
            SEND_CODE_URL: "api/v1/users/send-code/",
            CONFIRM_EMAIL_URL: "api/v1/users/confirm-email/",
        },
        USERS: {
            BASE_URL: "api/v1/users/",
            ME_URL: "me/",
        },
        PROJECTS: {
            BASE_URL: "api/v1/projects/",
            PROJECT_DETAIL: (projectId: number) => `${projectId}/`,
            PUBLIC_PROJECTS: "public/",
            LEAVE_PROJECT: (projectId: number) => `${projectId}/me/`,
            PROJECT_OWNER: (projectId: number) => `${projectId}/owner/`,
            TRANSFER_OWNERSHIP: (projectId: number) => `${projectId}/owner/`,
        },
        MEMBERS: {
            BASE_URL: (projectId: number) => `api/v1/projects/${projectId}/members/`,
            MEMBER_DETAIL: (userId: number) => `${userId}/`,
            MEMBER_ROLES: (userId: number) => `${userId}/roles/`,
            ASSIGN_ROLE: (userId: number) => `${userId}/roles/`,
            REMOVE_ROLE: (userId: number, roleId: number) => `${userId}/roles/${roleId}/`,
            MEMBER_DEPARTMENTS: (userId: number) => `${userId}/departments/`,
            ASSIGN_DEPARTMENT: (userId: number) => `${userId}/departments/`,
            REMOVE_DEPARTMENT: (userId: number, departmentId: number) => `${userId}/departments/${departmentId}/`,
        },
        DEPARTMENTS: {
            BASE_URL: (projectId: number) => `api/v1/projects/${projectId}/departments/`,
            DEPARTMENT_DETAIL: (departmentId: number) => `${departmentId}/`,
        },
        ROLES: {
            BASE_URL: (projectId: number) => `api/v1/projects/${projectId}/roles/`,
            ROLE_DETAIL: (roleId: number) => `${roleId}/`,
        },
        INVITATIONS: {
            BASE_URL: (projectId: number) => `api/v1/projects/${projectId}/invitations/`,
            INVITATION_DETAIL: (invitationId: number) => `${invitationId}/`,
        },
        NOTIFICATIONS: {
            BASE_URL: "api/v1/notifications/",
            NOTIFICATION_DETAIL: (notificationId: number) => `${notificationId}/`,
            WEBSOCKET_URL: "ws/notifications/",
        },
        MY_INVITATIONS: {
            BASE_URL: "api/v1/invitations/",
            INVITATION_DETAIL: (invitationId: number) => `${invitationId}/`,
            ACCEPT_INVITATION: (invitationId: number) => `${invitationId}/accept/`,
            REJECT_INVITATION: (invitationId: number) => `${invitationId}/reject/`,
        },
    },

    get FULL_URL() {
        return {
            AUTH: {
                REGISTER_URL: this.BASE_URL + this.ENDPOINTS.AUTH.REGISTER_URL,
                LOGIN_URL: this.BASE_URL + this.ENDPOINTS.AUTH.LOGIN_URL,
                LOGOUT_URL: this.BASE_URL + this.ENDPOINTS.AUTH.LOGOUT_URL,
                SEND_CODE_URL: this.BASE_URL + this.ENDPOINTS.AUTH.SEND_CODE_URL,
                CONFIRM_EMAIL_URL: this.BASE_URL + this.ENDPOINTS.AUTH.CONFIRM_EMAIL_URL,
                // Добавляем ME_URL для обращения к данным текущего пользователя
                ME_URL: this.BASE_URL + this.ENDPOINTS.USERS.BASE_URL + this.ENDPOINTS.USERS.ME_URL,
            },
            USERS: {
                BASE_URL: this.BASE_URL + this.ENDPOINTS.USERS.BASE_URL,
                ME_URL: this.BASE_URL + this.ENDPOINTS.USERS.BASE_URL + this.ENDPOINTS.USERS.ME_URL,
            },
            PROJECTS: {
                BASE_URL: this.BASE_URL + this.ENDPOINTS.PROJECTS.BASE_URL,
                PROJECT_DETAIL: (projectId: number) => this.BASE_URL + this.ENDPOINTS.PROJECTS.BASE_URL + this.ENDPOINTS.PROJECTS.PROJECT_DETAIL(projectId),
                PUBLIC_PROJECTS: this.BASE_URL + this.ENDPOINTS.PROJECTS.BASE_URL + this.ENDPOINTS.PROJECTS.PUBLIC_PROJECTS,
                LEAVE_PROJECT: (projectId: number) => this.BASE_URL + this.ENDPOINTS.PROJECTS.BASE_URL + this.ENDPOINTS.PROJECTS.LEAVE_PROJECT(projectId),
                PROJECT_OWNER: (projectId: number) => this.BASE_URL + this.ENDPOINTS.PROJECTS.BASE_URL + this.ENDPOINTS.PROJECTS.PROJECT_OWNER(projectId),
                TRANSFER_OWNERSHIP: (projectId: number) => this.BASE_URL + this.ENDPOINTS.PROJECTS.BASE_URL + this.ENDPOINTS.PROJECTS.TRANSFER_OWNERSHIP(projectId),
            },
            MEMBERS: {
                BASE_URL: (projectId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL(projectId),
                MEMBER_DETAIL: (projectId: number, userId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL(projectId) + this.ENDPOINTS.MEMBERS.MEMBER_DETAIL(userId),
                MEMBER_ROLES: (projectId: number, userId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL(projectId) + this.ENDPOINTS.MEMBERS.MEMBER_ROLES(userId),
                ASSIGN_ROLE: (projectId: number, userId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL(projectId) + this.ENDPOINTS.MEMBERS.ASSIGN_ROLE(userId),
                REMOVE_ROLE: (projectId: number, userId: number, roleId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL(projectId) + this.ENDPOINTS.MEMBERS.REMOVE_ROLE(userId, roleId),
                MEMBER_DEPARTMENTS: (projectId: number, userId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL(projectId) + this.ENDPOINTS.MEMBERS.MEMBER_DEPARTMENTS(userId),
                ASSIGN_DEPARTMENT: (projectId: number, userId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL(projectId) + this.ENDPOINTS.MEMBERS.ASSIGN_DEPARTMENT(userId),
                REMOVE_DEPARTMENT: (projectId: number, userId: number, departmentId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL(projectId) + this.ENDPOINTS.MEMBERS.REMOVE_DEPARTMENT(userId, departmentId),
            },
            DEPARTMENTS: {
                BASE_URL: (projectId: number) => this.BASE_URL + this.ENDPOINTS.DEPARTMENTS.BASE_URL(projectId),
                DEPARTMENT_DETAIL: (projectId: number, departmentId: number) => this.BASE_URL + this.ENDPOINTS.DEPARTMENTS.BASE_URL(projectId) + this.ENDPOINTS.DEPARTMENTS.DEPARTMENT_DETAIL(departmentId),
            },
            ROLES: {
                BASE_URL: (projectId: number) => this.BASE_URL + this.ENDPOINTS.ROLES.BASE_URL(projectId),
                ROLE_DETAIL: (projectId: number, roleId: number) => this.BASE_URL + this.ENDPOINTS.ROLES.BASE_URL(projectId) + this.ENDPOINTS.ROLES.ROLE_DETAIL(roleId),
            },
            INVITATIONS: {
                BASE_URL: (projectId: number) => this.BASE_URL + this.ENDPOINTS.INVITATIONS.BASE_URL(projectId),
                INVITATION_DETAIL: (projectId: number, invitationId: number) => this.BASE_URL + this.ENDPOINTS.INVITATIONS.BASE_URL(projectId) + this.ENDPOINTS.INVITATIONS.INVITATION_DETAIL(invitationId),
            },
            NOTIFICATIONS: {
                BASE_URL: this.BASE_URL + this.ENDPOINTS.NOTIFICATIONS.BASE_URL,
                NOTIFICATION_DETAIL: (notificationId: number) => this.BASE_URL + this.ENDPOINTS.NOTIFICATIONS.BASE_URL + this.ENDPOINTS.NOTIFICATIONS.NOTIFICATION_DETAIL(notificationId),
                WEBSOCKET_URL: (token: string) => `ws://localhost:80/${this.ENDPOINTS.NOTIFICATIONS.WEBSOCKET_URL}?token=${token}`,
            },
            MY_INVITATIONS: {
                BASE_URL: this.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.BASE_URL,
                INVITATION_DETAIL: (invitationId: number) => this.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.INVITATION_DETAIL(invitationId),
                ACCEPT_INVITATION: (invitationId: number) => this.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.ACCEPT_INVITATION(invitationId),
                REJECT_INVITATION: (invitationId: number) => this.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.REJECT_INVITATION(invitationId),
            }
        }
    }
}

export default API_CONFIG;