const API_CONFIG = {
    BASE_URL: "http://localhost:80/",

    ENDPOINTS: {
        AUTH: {
            REGISTER_URL: "api/v1/users/",
            LOGIN_URL: "api/v1/auth/token/login/",
            LOGOUT_URL: "api/v1/auth/token/logout/",
            SEND_CODE_URL: "api/v1/users/send-code/",
            CONFIRM_EMAIL_URL: "api/v1/users/confirm-email/",
            ME_URL: "api/v1/users/me/",
        },
        PROJECTS: {
            BASE_URL_PROJECTS: "api/v1/projects/",
            PROJECT_DETAIL: (projectId: number) => `${projectId}/`,
            PUBLIC_PROJECTS: "public/",
            LEAVE_PROJECT: (projectId: number) => `${projectId}/leave/`,
            JOIN_PROJECT: (projectId: number) => `${projectId}/join/`,
            PROJECT_OWNER: (projectId: number) => `${projectId}/owner/`,
        },
        MEMBERS: {
            BASE_URL_MEMBERS: (projectId: number) => `api/v1/projects/${projectId}/members/`,
            MEMBER_DETAIL: (userId: number) => `${userId}/`,
            MEMBER_ROLES: (userId: number) => `${userId}/roles/`,
            ASSIGN_ROLE: (userId: number, roleId: number) => `${userId}/roles/${roleId}/`,
            MEMBER_DEPARTMENTS: (userId: number) => `${userId}/departments/`,
            ASSIGN_DEPARTMENT: (userId: number, departmentId: number) => `${userId}/departments/${departmentId}/`,
        },
        DEPARTMENTS: {
            BASE_URL_DEPARTMENTS: (projectId: number) => `api/v1/projects/${projectId}/departments/`,
            DEPARTMENT_DETAIL: (departmentId: number) => `${departmentId}/`,
        },
        ROLES: {
            BASE_URL_ROLES: (projectId: number) => `api/v1/projects/${projectId}/roles/`,
            ROLE_DETAIL: (roleId: number) => `${roleId}/`,
        },
        INVITATIONS: {
            BASE_URL_INVITATIONS: (projectId: number) => `api/v1/projects/${projectId}/invitations/`,
            INVITATION_DETAIL: (invitationId: number) => `${invitationId}/`,
        },
        NOTIFICATIONS: {
            BASE_URL_NOTIFICATIONS: "api/v1/notifications/",
            NOTIFICATION_DETAIL: (notificationId: number) => `${notificationId}/`,
            WS_NOTIFICATIONS: "ws/notifications/",
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
                ME_URL: this.BASE_URL + this.ENDPOINTS.AUTH.ME_URL,
            },
            PROJECTS: {
                BASE_URL: this.BASE_URL + this.ENDPOINTS.PROJECTS.BASE_URL_PROJECTS,
                PROJECT_DETAIL: (projectId: number) => this.BASE_URL + this.ENDPOINTS.PROJECTS.PROJECT_DETAIL(projectId),
                PUBLIC_PROJECTS: this.BASE_URL + this.ENDPOINTS.PROJECTS.PUBLIC_PROJECTS,
                LEAVE_PROJECT: (projectId: number) => this.BASE_URL + this.ENDPOINTS.PROJECTS.LEAVE_PROJECT(projectId),
                JOIN_PROJECT: (projectId: number) => this.BASE_URL + this.ENDPOINTS.PROJECTS.JOIN_PROJECT(projectId),
                PROJECT_OWNER: (projectId: number) => this.BASE_URL + this.ENDPOINTS.PROJECTS.PROJECT_OWNER(projectId),
            },
            MEMBERS: {
                BASE_URL: (projectId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL_MEMBERS(projectId),
                MEMBER_DETAIL: (projectId: number, userId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL_MEMBERS(projectId) + this.ENDPOINTS.MEMBERS.MEMBER_DETAIL(userId),
                MEMBER_ROLES: (projectId: number, userId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL_MEMBERS(projectId) + this.ENDPOINTS.MEMBERS.MEMBER_ROLES(userId),
                ASSIGN_ROLE: (projectId: number, userId: number, roleId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL_MEMBERS(projectId) + this.ENDPOINTS.MEMBERS.ASSIGN_ROLE(userId, roleId),
                MEMBER_DEPARTMENTS: (projectId: number, userId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL_MEMBERS(projectId) + this.ENDPOINTS.MEMBERS.MEMBER_DEPARTMENTS(userId),
                ASSIGN_DEPARTMENT: (projectId: number, userId: number, departmentId: number) => this.BASE_URL + this.ENDPOINTS.MEMBERS.BASE_URL_MEMBERS(projectId) + this.ENDPOINTS.MEMBERS.ASSIGN_DEPARTMENT(userId, departmentId),
            },
            DEPARTMENTS: {
                BASE_URL: (projectId: number) => this.BASE_URL + this.ENDPOINTS.DEPARTMENTS.BASE_URL_DEPARTMENTS(projectId),
                DEPARTMENT_DETAIL: (projectId: number, departmentId: number) => this.BASE_URL + this.ENDPOINTS.DEPARTMENTS.BASE_URL_DEPARTMENTS(projectId) + this.ENDPOINTS.DEPARTMENTS.DEPARTMENT_DETAIL(departmentId),
            },
            ROLES: {
                BASE_URL: (projectId: number) => this.BASE_URL + this.ENDPOINTS.ROLES.BASE_URL_ROLES(projectId),
                ROLE_DETAIL: (projectId: number, roleId: number) => this.BASE_URL + this.ENDPOINTS.ROLES.BASE_URL_ROLES(projectId) + this.ENDPOINTS.ROLES.ROLE_DETAIL(roleId),
            },
            INVITATIONS: {
                BASE_URL: (projectId: number) => this.BASE_URL + this.ENDPOINTS.INVITATIONS.BASE_URL_INVITATIONS(projectId),
                INVITATION_DETAIL: (projectId: number, invitationId: number) => this.BASE_URL + this.ENDPOINTS.INVITATIONS.BASE_URL_INVITATIONS(projectId) + this.ENDPOINTS.INVITATIONS.INVITATION_DETAIL(invitationId),
            },
            NOTIFICATIONS: {
                BASE_URL: this.BASE_URL + this.ENDPOINTS.NOTIFICATIONS.BASE_URL_NOTIFICATIONS,
                NOTIFICATION_DETAIL: (notificationId: number) => this.BASE_URL + this.ENDPOINTS.NOTIFICATIONS.BASE_URL_NOTIFICATIONS + this.ENDPOINTS.NOTIFICATIONS.NOTIFICATION_DETAIL(notificationId),
                WS_URL: this.BASE_URL.replace('http', 'ws') + this.ENDPOINTS.NOTIFICATIONS.WS_NOTIFICATIONS,
            },
            MY_INVITATIONS: {
                BASE_URL: this.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.BASE_URL,
                INVITATION_DETAIL: (invitationId: number) => this.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.INVITATION_DETAIL(invitationId),
                ACCEPT_INVITATION: (invitationId: number) => this.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.ACCEPT_INVITATION(invitationId),
                REJECT_INVITATION: (invitationId: number) => this.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.BASE_URL + this.ENDPOINTS.MY_INVITATIONS.REJECT_INVITATION(invitationId),
            },
        }
    }
}

export default API_CONFIG;