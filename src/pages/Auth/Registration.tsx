import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {Input} from "../../components/common/Input/Input.tsx";
import {Button} from "../../components/common/Button/Button.tsx";

// Типы для формы
interface FormData {
    city: string;
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

// Список городов
const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'];

/**
 * Страничка регистрации
 */
const Registration: React.FC = () => {
    // Состояние формы
    const [formData, setFormData] = useState<FormData>({
        city: '',
        lastName: '',
        firstName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    // Состояние для ошибок валидации
    const [errors, setErrors] = useState<Record<string, string>>({});

    const navigate = useNavigate();

    // Обработчик изменения полей ввода
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Обработчик изменения чекбокса
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked
        });
    };

    // Проверка формы перед отправкой
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.city) {
            newErrors.city = 'Выберите город';
        }

        if (!formData.lastName) {
            newErrors.lastName = 'Введите фамилию';
        }

        if (!formData.firstName) {
            newErrors.firstName = 'Введите имя';
        }

        if (!formData.email) {
            newErrors.email = 'Введите электронную почту';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный формат электронной почты. Пример: user@example.com';
        }

        if (!formData.password) {
            newErrors.password = 'Введите пароль';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен содержать не менее 6 символов';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Повторите пароль';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'Необходимо согласиться с условиями';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Обработчик отправки формы
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            navigate('/login');
            // TODO: Здесь будет код для отправки данных на сервер
            console.log('Форма валидна, отправляем данные:', formData);
            // Например, fetch('/api/register', { method: 'POST', body: JSON.stringify(formData) })
            alert('Регистрация успешна!');
        } else {
            console.log('Форма содержит ошибки');
        }
    };

    return (
        <div>
            <h1>Регистрация</h1>
            <form onSubmit={handleSubmit} noValidate={true}>
                <div>
                    <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                    >
                        <option value="">Город*</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    {errors.city && <div>{errors.city}</div>}
                </div>

                <div>
                    <Input
                        type="text"
                        name="lastName"
                        placeholder="Фамилия*"
                        value={formData.lastName}
                        onChange={handleInputChange}
                    />
                    {errors.lastName && <div>{errors.lastName}</div>}
                </div>

                <div>
                    <Input
                        type="text"
                        name="firstName"
                        placeholder="Имя*"
                        value={formData.firstName}
                        onChange={handleInputChange}
                    />
                    {errors.firstName && <div>{errors.firstName}</div>}
                </div>

                <div>
                    <Input
                        type="email"
                        name="email"
                        placeholder="Электронная почта*"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                    {errors.email && <div>{errors.email}</div>}
                </div>

                <div>
                    <Input
                        type="password"
                        name="password"
                        placeholder="Пароль*"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                    {errors.password && <div>{errors.password}</div>}
                </div>

                <div>
                    <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Повторите пароль*"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                    />
                    {errors.confirmPassword && <div>{errors.confirmPassword}</div>}
                </div>

                <div>
                    <p>У вас уже есть аккаунт? <Link to="/login">Войти!</Link></p>
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleCheckboxChange}
                        />
                        Я согласен с <a href="/terms">условиями передачи информации</a>
                    </label>
                    {errors.agreeToTerms && <div>{errors.agreeToTerms}</div>}
                </div>

                <Button type="submit">Завершить</Button>
            </form>
        </div>
    );
};

export default Registration;