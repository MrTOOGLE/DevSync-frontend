import React, { useState, FormEvent } from 'react';

// Типы для нашей формы
interface FormData {
    city: string;
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

// Список городов (можно расширить)
const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'];

const RegistrationForm: React.FC = () => {
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
            newErrors.email = 'Некорректный формат электронной почты';
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
            // Здесь будет код для отправки данных на сервер
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
            <form onSubmit={handleSubmit}>
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
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Фамилия*"
                        value={formData.lastName}
                        onChange={handleInputChange}
                    />
                    {errors.lastName && <div>{errors.lastName}</div>}
                </div>

                <div>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="Имя*"
                        value={formData.firstName}
                        onChange={handleInputChange}
                    />
                    {errors.firstName && <div>{errors.firstName}</div>}
                </div>

                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Электронная почта*"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                    {errors.email && <div>{errors.email}</div>}
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль*"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                    {errors.password && <div>{errors.password}</div>}
                </div>

                <div>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Повторите пароль*"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                    />
                    {errors.confirmPassword && <div>{errors.confirmPassword}</div>}
                </div>

                <div>
                    <p>У вас уже есть аккаунт? <a href="/login">Войти!</a></p>
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

                <button type="submit">Завершить</button>
            </form>
        </div>
    );
};

export default RegistrationForm;