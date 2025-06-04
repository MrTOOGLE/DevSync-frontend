import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Header} from "../../components/common/Header/Header.tsx";
import {Footer} from "../../components/common/Footer/Footer.tsx";
import {ErrorField} from "../../components/common/ErrorField/ErrorField.tsx";
import {Button} from "../../components/common/Button/Button.tsx";
import {Input} from "../../components/common/Input/Input.tsx";
import {Select} from "../../components/common/Select/Select.tsx";
import {userService, User, UserProject} from '../../hooks/UserService.tsx';
import '../../styles/styles.css';
import styles from '../../styles/Profile.module.css';

// Список городов (как в регистрации)
const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'];

// Типы для проекта в UI
interface UIProject {
    id: number;
    title: string;
    isPrivate: boolean;
    emoji: string;
    description?: string;
    owner?: any;
    date_created?: string;
}

// Состояния загрузки
interface LoadingStates {
    user: boolean;
    projects: boolean;
    updating: boolean;
}

// Состояние редактирования
interface EditState {
    isEditing: boolean;
    firstName: string;
    lastName: string;
    city: string;
    avatar: File | null;
}

const ProfilePage: React.FC = () => {
    // Основные данные
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<UIProject[]>([]);

    // Состояния загрузки
    const [loading, setLoading] = useState<LoadingStates>({
        user: true,
        projects: true,
        updating: false
    });

    // Состояние редактирования
    const [editState, setEditState] = useState<EditState>({
        isEditing: false,
        firstName: '',
        lastName: '',
        city: '',
        avatar: null
    });

    // Ошибки
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [serverError, setServerError] = useState<string>('');

    // Загрузка данных при монтировании
    useEffect(() => {
        loadUserData();
        loadUserProjects();
    }, []);

    // Загрузка данных пользователя
    const loadUserData = async () => {
        try {
            setLoading(prev => ({...prev, user: true}));
            const userData = await userService.getCurrentUser();
            setUser(userData);

            // Инициализируем данные для редактирования
            setEditState(prev => ({
                ...prev,
                firstName: userData.first_name,
                lastName: userData.last_name,
                city: userData.city
            }));
        } catch (error: any) {
            console.error('Ошибка загрузки данных пользователя:', error);
            setServerError(error.message || 'Ошибка загрузки профиля');
        } finally {
            setLoading(prev => ({...prev, user: false}));
        }
    };

    // Загрузка проектов пользователя
    const loadUserProjects = async () => {
        try {
            setLoading(prev => ({...prev, projects: true}));
            const userProjects = await userService.getUserProjects();

            // Преобразуем проекты для UI
            const uiProjects: UIProject[] = userProjects.map(project => ({
                id: project.id,
                title: project.title,
                isPrivate: !project.is_public,
                emoji: getProjectEmoji(project),
                description: project.description,
                owner: project.owner,
                date_created: project.date_created
            }));

            setProjects(uiProjects);
        } catch (error: any) {
            console.error('Ошибка загрузки проектов:', error);
            setProjects([]);
        } finally {
            setLoading(prev => ({...prev, projects: false}));
        }
    };

    // Определение эмодзи для проекта (простая логика)
    const getProjectEmoji = (project: UserProject): string => {
        const title = project.title.toLowerCase();
        if (title.includes('робот') || title.includes('bot')) return '🤖';
        if (title.includes('сайт') || title.includes('web')) return '🌐';
        if (title.includes('игр') || title.includes('game')) return '🎮';
        if (title.includes('мобильн') || title.includes('mobile')) return '📱';
        if (title.includes('дизайн') || title.includes('design')) return '🎨';
        return '📁';
    };

    // Переключение режима редактирования
    const handleEditToggle = () => {
        if (editState.isEditing) {
            // Отмена редактирования - возвращаем исходные данные
            if (user) {
                setEditState({
                    isEditing: false,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    city: user.city,
                    avatar: null
                });
            }
        } else {
            // Начинаем редактирование
            setEditState(prev => ({...prev, isEditing: true}));
        }
        setErrors({});
        setServerError('');
    };

    // Обработка изменения полей
    const handleInputChange = (field: keyof EditState, value: string) => {
        setEditState(prev => ({...prev, [field]: value}));
        // Удаляем ошибку для этого поля
        if (errors[field]) {
            setErrors(prev => ({...prev, [field]: ''}));
        }
    };

    // Обработка изменения селекта города
    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setEditState(prev => ({...prev, city: value}));
        // Удаляем ошибку для города
        if (errors.city) {
            setErrors(prev => ({...prev, city: ''}));
        }
    };

    // Обработка загрузки файла
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setEditState(prev => ({...prev, avatar: file}));
    };

    // Валидация формы
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!editState.firstName.trim()) {
            newErrors.firstName = 'Имя обязательно для заполнения';
        }

        if (!editState.lastName.trim()) {
            newErrors.lastName = 'Фамилия обязательна для заполнения';
        }

        if (!editState.city.trim()) {
            newErrors.city = 'Город обязателен для заполнения';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Сохранение изменений
    const handleSaveChanges = async () => {
        if (!validateForm()) return;

        try {
            setLoading(prev => ({...prev, updating: true}));
            setServerError('');

            const updateData = {
                first_name: editState.firstName,
                last_name: editState.lastName,
                city: editState.city,
                avatar: editState.avatar
            };

            const updatedUser = await userService.updateCurrentUser(updateData);
            setUser(updatedUser);

            // Выходим из режима редактирования
            setEditState(prev => ({...prev, isEditing: false, avatar: null}));
        } catch (error: any) {
            console.error('Ошибка обновления профиля:', error);
            if (error.data) {
                setErrors(error.data);
            } else {
                setServerError(error.message || 'Ошибка сохранения изменений');
            }
        } finally {
            setLoading(prev => ({...prev, updating: false}));
        }
    };

    // Переход к проекту
    const handleOpenProject = (projectId: number) => {
        navigate(`/projects/${projectId}`);
    };

    // Переход на страницу всех проектов
    const navigateToAllProjects = () => {
        console.log('Переход на страницу всех проектов');
        // navigate('/projects');
    };

    // Показать загрузку
    if (loading.user) {
        return (
            <div className="main-container">
                <Header/>
                <div className="main-content">
                    <div className={styles.loadingContainer}>
                        <h2>Загрузка профиля...</h2>
                    </div>
                </div>
                <Footer/>
            </div>
        );
    }

    // Показать ошибку, если не удалось загрузить пользователя
    if (!user && serverError) {
        return (
            <div className="main-container">
                <Header/>
                <div className="main-content">
                    <div className={styles.loadingContainer}>
                        <h2>Ошибка загрузки профиля</h2>
                        <ErrorField message={serverError}/>
                        <Button onClick={loadUserData} style={{marginTop: '20px'}}>
                            Попробовать снова
                        </Button>
                    </div>
                </div>
                <Footer/>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="main-container">
            <Header/>
            <div className="main-content">
                <div className={styles.profileContainer}>
                    {/* Левая колонка - только аватар, убираем достижения */}
                    <div className={styles.profileLeftColumn}>
                        <div className={styles.profileAvatarContainer}>
                            <img
                                src={user.avatar || 'https://via.placeholder.com/200x200?text=Аватар'}
                                alt="Аватар пользователя"
                                className={styles.profileAvatar}
                            />
                            {editState.isEditing && (
                                <div className={styles.avatarUpload}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        id="avatar-upload"
                                        style={{display: 'none'}}
                                    />
                                    <label htmlFor="avatar-upload" className={styles.avatarUploadButton}>
                                        Изменить фото
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Правая колонка - личная информация */}
                    <div className={styles.profileRightColumn}>
                        <div className={styles.profileInfoContainer}>
                            <div className={styles.profileInfoHeader}>
                                <h2>Личная информация</h2>
                                <button
                                    onClick={editState.isEditing ? handleEditToggle : handleEditToggle}
                                    className={styles.editButton}
                                    disabled={loading.updating}
                                >
                                    {editState.isEditing ? 'Отменить' : 'Изменить'}
                                </button>
                            </div>

                            {serverError && <ErrorField message={serverError}/>}

                            <div className={styles.profileInfoContent}>
                                <div className={styles.profileInfoItem}>
                                    <span className={styles.infoLabel}>Имя</span>
                                    {editState.isEditing ? (
                                        <div>
                                            <Input
                                                value={editState.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                hasError={!!errors.firstName}
                                                placeholder="Введите имя"
                                                className={styles.inputProfile}
                                            />
                                            {errors.firstName && <ErrorField message={errors.firstName}/>}
                                        </div>
                                    ) : (
                                        <span className={styles.infoValue}>{user.first_name}</span>
                                    )}
                                </div>

                                <div className={styles.profileInfoItem}>
                                    <span className={styles.infoLabel}>Фамилия</span>
                                    {editState.isEditing ? (
                                        <div>
                                            <Input
                                                value={editState.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                hasError={!!errors.lastName}
                                                placeholder="Введите фамилию"
                                                className={styles.inputProfile}
                                            />
                                            {errors.lastName && <ErrorField message={errors.lastName}/>}
                                        </div>
                                    ) : (
                                        <span className={styles.infoValue}>{user.last_name}</span>
                                    )}
                                </div>

                                <div className={styles.profileInfoItem}>
                                    <span className={styles.infoLabel}>Email</span>
                                    <span className={styles.infoValue}>{user.email}</span>
                                </div>

                                <div className={styles.profileInfoItem}>
                                    <span className={styles.infoLabel}>Город</span>
                                    {editState.isEditing ? (
                                        <div>
                                            <Select
                                                name="city"
                                                value={editState.city}
                                                onChange={handleCityChange}
                                                hasError={!!errors.city}
                                                className={styles.selectCity}
                                            >
                                                <option value="">Выберите город*</option>
                                                {cities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </Select>
                                            {errors.city && <ErrorField message={errors.city}/>}
                                        </div>
                                    ) : (
                                        <span className={styles.infoValue}>{user.city}</span>
                                    )}
                                </div>
                            </div>

                            {editState.isEditing && (
                                <div className={styles.editActions}>
                                    <Button
                                        onClick={handleSaveChanges}
                                        disabled={loading.updating}
                                    >
                                        {loading.updating ? 'Сохранение...' : 'Сохранить'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Секция с проектами пользователя */}
                <div className={styles.profileProjectsSection}>
                    <div className={styles.profileProjectsContainer}>
                        <h2 className={styles.projectsHeader}>Мои проекты</h2>
                        {loading.projects ? (
                            <p>Загрузка проектов...</p>
                        ) : projects.length > 0 ? (
                            <div className={styles.projectsList}>
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className={styles.projectItem}
                                        onClick={() => handleOpenProject(project.id)}
                                    >
                                        <span className={styles.projectEmoji}>{project.emoji}</span>
                                        <span className={styles.projectTitle}>{project.title}</span>
                                        {project.isPrivate && (
                                            <span className={styles.projectPrivateIcon}>🔒</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>У вас пока нет проектов</p>
                        )}

                        <div className={styles.allProjectsButtonContainer}>
                            <button onClick={navigateToAllProjects}>
                                Все проекты
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default ProfilePage;