import React, {useState, useEffect} from 'react';
import {Header} from "../../components/common/Header/Header";
import {Footer} from "../../components/common/Footer/Footer";
import {Button} from "../../components/common/Button/Button";
import {Input} from "../../components/common/Input/Input";
import {Select} from "../../components/common/Select/Select";
import {ErrorField} from "../../components/common/ErrorField/ErrorField";
import '../../styles/styles.css';
import './Profile.css';

// Типы для данных достижений
interface Achievement {
    id: number;
    title: string;
    icon?: string;
}

// Типы для данных проектов
interface Project {
    id: number;
    title: string;
    isPrivate: boolean;
    emoji: string;
}

// Типы для данных пользователя
interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    avatar: string;
    achievements: Achievement[];
    projects: Project[];
}

// Доступные города
const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Томск'];

const ProfilePage: React.FC = () => {
    // Заглушка для данных пользователя
    const initialUserData: UserData = {
        firstName: 'Александра',
        lastName: 'Лапшакова',
        email: 'avk65@tbank.ru',
        city: 'Томск',
        avatar: 'https://placekitten.com/200/200', // Заглушка для аватара
        achievements: [],
        projects: [
            {
                id: 1,
                title: 'Разработка и внедрение приложения для работы робота-пылесоса',
                isPrivate: false,
                emoji: '🤖'
            },
            {
                id: 2,
                title: 'Создание сайта для генерации кричка "Какой ты крипс сегодня?"',
                isPrivate: true,
                emoji: '🦊'
            }
        ]
    };

    // Состояние пользователя и режима редактирования
    const [userData, setUserData] = useState<UserData>(initialUserData);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [formData, setFormData] = useState<Omit<UserData, 'achievements' | 'projects'>>(
        {firstName: '', lastName: '', email: '', city: '', avatar: ''}
    );

    // Состояние валидации
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showSavedMessage, setShowSavedMessage] = useState<boolean>(false);

    // Инициализация формы данными пользователя при переходе в режим редактирования
    useEffect(() => {
        if (editMode) {
            setFormData({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                city: userData.city,
                avatar: userData.avatar
            });
        }
    }, [editMode, userData]);

    // Обработчик переключения в режим редактирования
    const handleEdit = () => {
        setEditMode(true);
    };

    // Обработчик изменения полей формы
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Сбрасываем ошибку для поля при его изменении
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Валидация формы
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Поле обязательное';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Поле обязательное';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Поле обязательное';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный формат электронной почты. Пример: user@example.com';
        }

        if (!formData.city) {
            newErrors.city = 'Поле обязательное';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Обработчик сохранения изменений
    const handleSave = () => {
        if (validateForm()) {
            setIsSaving(true);

            // Имитация сохранения на сервере
            setTimeout(() => {
                setUserData(prev => ({
                    ...prev,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    city: formData.city,
                }));

                setIsSaving(false);
                setEditMode(false);
                setShowSavedMessage(true);

                // Скрыть сообщение через 3 секунды
                setTimeout(() => {
                    setShowSavedMessage(false);
                }, 3000);
            }, 1000);
        }
    };

    // Обработчик отмены редактирования
    const handleCancel = () => {
        setEditMode(false);
        setErrors({});
    };

    // Обработчик открытия проекта
    const handleOpenProject = (projectId: number) => {
        console.log(`Открытие проекта ${projectId}`);
        // navigate(`/projects/${projectId}`);
    };

    // Переход на страницу всех проектов
    const navigateToAllProjects = () => {
        console.log('Переход на страницу всех проектов');
        // navigate('/projects');
    };

    // Функция для загрузки нового аватара
    const handleAvatarUpload = () => {
        console.log('Загрузка нового аватара');
        // Здесь будет логика загрузки аватара
    };

    return (
        <div className="main-container">
            <Header />
            <div className="main-content">
                {showSavedMessage && (
                    <div className="save-message">
                        Изменения успешно сохранены!
                    </div>
                )}

                <div className="profile-section">
                    {/* Левая колонка - аватар и достижения */}
                    <div className="profile-left-column">
                        <div className="profile-avatar-container">
                            <div className="avatar-status">в сети</div>
                            <img src={userData.avatar} alt="Аватар пользователя" className="profile-avatar" />
                            {editMode && (
                                <button onClick={handleAvatarUpload} className="change-avatar-button">
                                    Изменить фото
                                </button>
                            )}
                        </div>
                        <div className="profile-achievements">
                            <h2>Мои достижения</h2>
                            <div className="achievements-content">
                                {userData.achievements.length > 0 ? (
                                    <ul className="achievements-list">
                                        {userData.achievements.map((achievement) => (
                                            <li key={achievement.id} className="achievement-item">
                                                {achievement.icon} {achievement.title}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>У вас пока нет достижений</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка - личная информация */}
                    <div className="profile-right-column">
                        <div className="profile-info-container">
                            <div className="profile-info-header">
                                <h2>Личная информация</h2>
                                {!editMode ? (
                                    <button onClick={handleEdit} className="edit-button">Изменить</button>
                                ) : (
                                    <div className="save-cancel-buttons">
                                        <button onClick={handleCancel} className="cancel-button">Отмена</button>
                                        <Button onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="profile-info-content">
                                {!editMode ? (
                                    // Режим просмотра
                                    <>
                                        <div className="profile-info-item">
                                            <span className="info-label">Имя</span>
                                            <span className="info-value">{userData.firstName}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="info-label">Фамилия</span>
                                            <span className="info-value">{userData.lastName}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="info-label">Email</span>
                                            <span className="info-value">{userData.email}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="info-label">Город</span>
                                            <span className="info-value">{userData.city}</span>
                                        </div>
                                    </>
                                ) : (
                                    // Режим редактирования
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="firstName">Имя*</label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                hasError={!!errors.firstName}
                                                placeholder="Имя*"
                                            />
                                            {errors.firstName && <ErrorField message={errors.firstName} />}
                                            <div className="required-label">Поле обязательное</div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="lastName">Фамилия*</label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                hasError={!!errors.lastName}
                                                placeholder="Фамилия*"
                                            />
                                            {errors.lastName && <ErrorField message={errors.lastName} />}
                                            <div className="required-label">Поле обязательное</div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="email">Email*</label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                hasError={!!errors.email}
                                                placeholder="Email*"
                                            />
                                            {errors.email && <ErrorField message={errors.email} />}
                                            <div className="required-label">Поле обязательное</div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="city">Город*</label>
                                            <Select
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                hasError={!!errors.city}
                                                style={{ color: formData.city ? '#353536' : '#7C7C7C' }}
                                            >
                                                <option value="">Город*</option>
                                                {cities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </Select>
                                            {errors.city && <ErrorField message={errors.city} />}
                                            <div className="required-label">Поле обязательное</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isSaving && <div className="save-loader">Сохранение изменений...</div>}

                {/* Секция с проектами пользователя */}
                <div className="profile-projects-section">
                    <h2>Мои проекты</h2>
                    <div className="projects-list">
                        {userData.projects.map((project) => (
                            <div
                                key={project.id}
                                className="project-item"
                                onClick={() => handleOpenProject(project.id)}
                            >
                                <span className="project-emoji">{project.emoji}</span>
                                <span className="project-title">{project.title}</span>
                                {project.isPrivate && (
                                    <span className="project-private-icon">🔒</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="all-projects-button-container">
                        <Button onClick={navigateToAllProjects}>
                            Все проекты
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;