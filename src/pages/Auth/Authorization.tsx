import React, {FormEvent, useState} from 'react';
import '../../styles/styles.css';
import {useNavigate, Link} from 'react-router-dom';
import {Button} from "../../components/common/Button/Button.tsx";
import {Input} from "../../components/common/Input/Input.tsx";
import { authService } from "../../hooks/AuthService.tsx";
import {ErrorField} from "../../components/common/ErrorField/ErrorField.tsx";

// Типизация ошибок формы
interface FormErrors {
    email?: string;
    password?: string;
    server?: string;
}

/**
 * Страничка авторизации
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                setIsLoading(true);
                authService.login({email, password}).then(() => navigate('/dashboard'))
            } catch (error) {
                setErrors({server: 'Ошибка авторизации. Попробуйте еще раз.'});
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="form-container">
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
                        className={errors.email ? 'error' : ''}
                        required
                    />
                    {errors.email && <ErrorField message={errors.email} />}
                </div>
                <div className="form_group">
                    <Input
                        type="password"
                        id="passwordInput"
                        name="password"
                        placeholder="Пароль*"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? 'error' : ''}
                        required
                    />
                    {errors.password && <ErrorField message={errors.password} />}
                </div>
                {errors.server && <p className="error-message server-error">{errors.server}</p>}
                <p className="link">
                    У вас еще нет аккаунта? <Link to="/register" id="link">Зарегистрироваться!</Link>
                </p>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Подождите...' : 'Войти'}
                </Button>
            </form>
        </div>
    );
};

export default Authorization;