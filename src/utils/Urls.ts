const API_CONFIG = {
    BASE_URL: "http://localhost:80/",

    ENDPOINTS: {
        AUTH: {
            REGISTER_URL: "api/v0/users/",
            LOGIN_URL: "api/v0/auth/token/login/",
            LOGOUT_URL: "api/v0/auth/token/logout/",
            SEND_CODE_URL: "api/v1/users/send-code/",
            CONFIRM_EMAIL_URL: "api/v1/users/confirm-email/",
        }
    },

    get FULL_URL() {
        return {
            AUTH: {
                REGISTER_URL: this.BASE_URL + this.ENDPOINTS.AUTH.REGISTER_URL,
                LOGIN_URL: this.BASE_URL + this.ENDPOINTS.AUTH.LOGIN_URL,
                LOGOUT_URL: this.BASE_URL + this.ENDPOINTS.AUTH.LOGOUT_URL,
                SEND_CODE_URL: this.BASE_URL + this.ENDPOINTS.AUTH.SEND_CODE_URL,
                CONFIRM_EMAIL_URL: this.BASE_URL + this.ENDPOINTS.AUTH.CONFIRM_EMAIL_URL,
            }
        }
    }
}

export default API_CONFIG;