import React, {FormEvent, useState} from 'react';
import '../../styles/styles.css';
import styles from '../../styles/Auth.module.css'
import {useNavigate, Link} from 'react-router-dom';
import {Button} from '../../components/common/Button/Button.tsx';
import {Input} from '../../components/common/Input/Input.tsx';
import {authService} from '../../hooks/AuthService.tsx';
import {ErrorField} from '../../components/common/ErrorField/ErrorField.tsx';
import {Header} from "../../components/common/Header/Header.tsx";
import {Footer} from "../../components/common/Footer/Footer.tsx";

// Типизация ошибок формы
interface FormErrors {
    email?: string;
    password?: string;
    server?: string;
}

/**
 * Страница авторизации
 */
const Authorization: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // Валидация формы
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Проверка email
        if (!email) {
            newErrors.email = 'Введите электронную почту';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Некорректный формат электронной почты. Пример: user@example.com';
        }

        // Проверка пароля
        if (!password) {
            newErrors.password = 'Пароль обязателен';
        } else if (password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                setIsLoading(true);
                await authService.login({email, password})
                navigate('/profile')
            } catch (error) {
                handleAuthError(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Обработчик ошибок авторизации
    const handleAuthError = (error: any) => {
        console.error('Ошибка авторизации:', error);

        const newErrors: FormErrors = {};

        // Обработка ошибок из ответа API
        if (error.data) {
            // Обрабатываем ошибки для каждого поля
            if (error.data.email && Array.isArray(error.data.email)) {
                newErrors.email = error.data.email[0];
            }
            if (error.data.password && Array.isArray(error.data.password)) {
                newErrors.password = error.data.password[0];
            }

            // Обработка общих ошибок
            if (error.data.non_field_errors && Array.isArray(error.data.non_field_errors)) {
                newErrors.server = error.data.non_field_errors[0];
            } else if (error.data.detail) {
                newErrors.server = error.data.detail;
            }
        }

        // Если нет специфических ошибок, добавляем общую ошибку сервера
        if (Object.keys(newErrors).length === 0) {
            newErrors.server = error.message || 'Произошла ошибка при авторизации. Пожалуйста, попробуйте еще раз позже.';
        }

        setErrors(newErrors);
    };

    return (
        <div className="main-container">
            <Header variant='back'/>
            <div className="main-content">
                <div className={styles.container}>
                    <div className={styles.formContainer}>
                        <h1>Войти</h1>
                        <form onSubmit={handleSubmit} noValidate={true}>
                            <div className="form_group">
                                <Input
                                    type="email"
                                    id="emailInput"
                                    name="email"
                                    placeholder="Электронная почта*"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    hasError={!!errors.server || !!errors.email}
                                    required
                                />
                                {errors.email && <ErrorField message={errors.email}/>}
                            </div>
                            <div className="form_group">
                                <Input
                                    type="password"
                                    id="passwordInput"
                                    name="password"
                                    placeholder="Пароль*"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    hasError={!!errors.password || !!errors.server}
                                    required
                                />
                                {errors.password && <ErrorField message={errors.password}/>}
                            </div>
                            {errors.server && <ErrorField message={errors.server}/>}
                            <p className={styles.link}>
                                У вас еще нет аккаунта? <Link to="/register"
                                                              className={styles.linkText}>Зарегистрироваться!</Link>
                            </p>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Подождите...' : 'Войти'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default Authorization;