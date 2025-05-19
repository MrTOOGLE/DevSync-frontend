import React, {useState, FormEvent} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import "../../styles/styles.css"
import styles from '../../styles/Auth.module.css'
import {Input} from '../../components/common/Input/Input.tsx';
import {Button} from '../../components/common/Button/Button.tsx';
import {Select} from '../../components/common/Select/Select.tsx';
import {ErrorField} from '../../components/common/ErrorField/ErrorField.tsx';
import {authService} from '../../hooks/AuthService.tsx';
import {Header} from "../../components/common/Header/Header.tsx";
import {Footer} from "../../components/common/Footer/Footer.tsx";

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

// Типы ошибок формы
interface FormErrors {
    city?: string;
    lastName?: string;
    firstName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
    server?: string;
}

// Список городов
const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'];

/**
 * Страница регистрации
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
    const [errors, setErrors] = useState<FormErrors>({});
    const [cityColor, setCityColor] = useState<string>('#7C7C7C')
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    // Обработчик изменения полей ввода
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'city') {
            setCityColor(value ? '#353536' : '#7C7C7C'); // Если город выбран, меняем цвет на тёмный
        }
    };

    // Обработчик изменения чекбокса
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, checked} = e.target;
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

    // Обработчик ошибок регистрации
    const handleRegistrationError = (error: any) => {
        console.error('Ошибка при регистрации:', error);

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
            if (error.data.re_password && Array.isArray(error.data.re_password)) {
                newErrors.confirmPassword = error.data.re_password[0];
            }
            if (error.data.first_name && Array.isArray(error.data.first_name)) {
                newErrors.firstName = error.data.first_name[0];
            }
            if (error.data.last_name && Array.isArray(error.data.last_name)) {
                newErrors.lastName = error.data.last_name[0];
            }
            if (error.data.city && Array.isArray(error.data.city)) {
                newErrors.city = error.data.city[0];
            }
            // Обработка общих ошибок
            if (error.data.non_field_errors && Array.isArray(error.data.non_field_errors)) {
                newErrors.server = error.data.non_field_errors[0];
            }
        }

        // Если нет специфических ошибок, добавляем общую ошибку сервера
        if (Object.keys(newErrors).length === 0) {
            newErrors.server = error.message || 'Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз.';
        }

        setErrors(newErrors);
    };

    // Обработчик отправки формы
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (validateForm()) {
            try {
                setIsLoading(true);

                // Подготовка данных для API в соответствии с требуемым форматом
                const userData = {
                    email: formData.email,
                    password: formData.password,
                    re_password: formData.confirmPassword,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    city: formData.city
                };

                await authService.register(userData);

                // Перенаправление на страницу подтверждения email
                navigate('/verify-email', {state: {email: formData.email}});
            } catch (error) {
                handleRegistrationError(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="main-container">
            <Header variant="back"/>
            <div className="main-content">
                <div className={styles.container}>
                    <div className={styles.formContainer}>
                        <h1>Регистрация</h1>
                        {errors.server && <div className="server-error"><ErrorField message={errors.server}/></div>}
                        <form onSubmit={handleSubmit} noValidate={true}>
                            <div>
                                <Select
                                    name="city"
                                    className={styles.selectedCity}
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    style={{color: cityColor}}
                                    hasError={!!errors.city}
                                >
                                    <option value="">Город*</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </Select>
                                {errors.city && <ErrorField message={errors.city}/>}
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    name="lastName"
                                    placeholder="Фамилия*"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    hasError={!!errors.lastName}
                                />
                                {errors.lastName && <ErrorField message={errors.lastName}/>}
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    name="firstName"
                                    placeholder="Имя*"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    hasError={!!errors.firstName}
                                />
                                {errors.firstName && <ErrorField message={errors.firstName}/>}
                            </div>

                            <div>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="Электронная почта*"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    hasError={!!errors.email}
                                />
                                {errors.email && <ErrorField message={errors.email}/>}
                            </div>

                            <div>
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="Пароль*"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    hasError={!!errors.password}
                                />
                                {errors.password && <ErrorField message={errors.password}/>}
                            </div>

                            <div>
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Повторите пароль*"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    hasError={!!errors.confirmPassword}
                                />
                                {errors.confirmPassword && <ErrorField message={errors.confirmPassword}/>}
                            </div>

                            <div className={styles.link}>
                                <p>У вас уже есть аккаунт? <Link to="/login" className={styles.linkText}>Войти!</Link>
                                </p>
                            </div>

                            <div className={styles.check_terms}>
                                <div
                                    className={`${styles.checkbox_wrapper} ${errors.agreeToTerms ? styles.checkbox_error : ''}`}>
                                    <label>
                                        <input
                                            className={styles.checkboxRegister}
                                            type="checkbox"
                                            name="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onChange={handleCheckboxChange}
                                        />
                                        <span className={styles.checkmark}></span>
                                        Я согласен с <a href="/terms">условиями передачи информации</a>
                                    </label>

                                    {errors.agreeToTerms && (
                                        <div className="error-tooltip">
                                            <ErrorField message={errors.agreeToTerms}/>
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Регистрация...' : 'Завершить'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default Registration;