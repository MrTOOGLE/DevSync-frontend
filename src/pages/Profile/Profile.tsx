import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from "../../components/common/Header/Header.tsx";
import { Footer } from "../../components/common/Footer/Footer.tsx";
import { profileService, UserProfile } from "../../hooks/ProfileService.tsx";
import { projectService } from "../../hooks/CreateProjectService.tsx";
import { Input } from "../../components/common/Input/Input.tsx";
import { Button } from "../../components/common/Button/Button.tsx";
import { ErrorField } from "../../components/common/ErrorField/ErrorField.tsx";
import "../../styles/styles.css";
import styles from '../../styles/Profile.module.css';
import defaultAvatarImage from '../../photos/avatar.png';

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

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    // Состояние профиля
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [achievements] = useState<Achievement[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Состояние формы
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        city: ''
    });

    // Аватар
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Загрузка данных профиля
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Получаем данные пользователя
                const userData = await profileService.getCurrentUser();

                // Заполняем форму данными пользователя
                setUserData(userData);
                setFormData({
                    firstName: userData.first_name || '',
                    lastName: userData.last_name || '',
                    email: userData.email || '',
                    city: userData.city || ''
                });
                // @ts-ignore
                setAvatarPreview(userData.avatar);

                // Получаем проекты пользователя
                try {
                    const userProjects = await projectService.getProjects();

                    // Преобразуем проекты в нужный формат
                    const formattedProjects = userProjects.map(project => ({
                        id: project.id!,
                        title: project.title,
                        isPrivate: !project.is_public,
                        emoji: '🚀' // Заглушка, в реальном API нужно будет брать из данных проекта
                    }));

                    setProjects(formattedProjects);
                } catch (error) {
                    console.error('Ошибка при загрузке проектов:', error);
                }

                // TODO: Загрузка достижений пользователя, если API будет поддерживать

                setIsLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке данных профиля:', error);
                setErrors({
                    general: 'Не удалось загрузить данные профиля'
                });
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Обработчик изменения полей формы
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Обработчик изменения аватара
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const preview = URL.createObjectURL(file);

            setAvatarFile(file);
            setAvatarPreview(preview);
        }
    };

    // Включение режима редактирования
    const handleEdit = () => {
        setIsEditing(true);
    };

    // Отмена редактирования
    const handleCancel = () => {
        // Возвращаем изначальные данные из userData
        if (userData) {
            setFormData({
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                email: userData.email || '',
                city: userData.city || ''
            });
            setAvatarFile(null);
            // @ts-ignore
            setAvatarPreview(userData.avatar);
            setErrors({});
            setIsEditing(false);
        }
    };

    // Сохранение обновленных данных профиля
    const handleSave = async () => {
        try {
            setIsLoading(true);
            setErrors({});

            // Подготовка данных для обновления
            const updateData: Partial<UserProfile> = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                city: formData.city
            };

            if (avatarFile) {
                updateData.avatar = avatarFile;
            }

            // Вызов метода обновления профиля
            const updatedProfile = await profileService.updateProfile(updateData);

            // Обновление состояния после успешного сохранения
            setUserData(updatedProfile);
            setAvatarFile(null);
            setIsEditing(false);
            setIsLoading(false);

        } catch (error: any) {
            console.error('Ошибка при сохранении профиля:', error);

            // Обработка ошибок API
            const apiErrors: Record<string, string> = {};

            if (error.data) {
                // Маппинг ошибок API на поля формы
                if (error.data.first_name) apiErrors.firstName = error.data.first_name[0];
                if (error.data.last_name) apiErrors.lastName = error.data.last_name[0];
                if (error.data.city) apiErrors.city = error.data.city[0];
                if (error.data.avatar) apiErrors.avatar = error.data.avatar[0];
            }

            if (Object.keys(apiErrors).length === 0) {
                apiErrors.general = 'Произошла ошибка при сохранении профиля';
            }

            setErrors(apiErrors);
            setIsLoading(false);
        }
    };

    // Обработчик для открытия проекта
    const handleOpenProject = (projectId: number) => {
        navigate(`/projects/${projectId}`);
    };

    // Переход на страницу всех проектов
    const navigateToAllProjects = () => {
        navigate('/projects');
    };

    // Создание нового проекта
    const handleCreateProject = () => {
        navigate('/create-project');
    };

    if (isLoading && !userData) {
        return <div className={styles.loading}>Загрузка данных профиля...</div>;
    }

    return (
        <div className="main-container">
            <Header />
            <div className="main-content">
                <div className={styles.profileContainer}>
                    <div className={styles.profileLeftColumn}>
                        <div className={styles.profileAvatarContainer}>
                            <img
                                //@ts-ignore
                                src={avatarPreview || userData?.avatar || defaultAvatarImage}
                                alt="Аватар пользователя"
                                className={styles.profileAvatar}
                            />
                            {isEditing && (
                                <div className={styles.avatarUpload}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        id="avatar-upload"
                                    />
                                    <label htmlFor="avatar-upload">Изменить аватар</label>
                                    {errors.avatar && <ErrorField message={errors.avatar} />}
                                </div>
                            )}
                        </div>
                        <div className={styles.profileAchievements}>
                            <h2>Мои достижения</h2>
                            <div className={styles.achievementsContent}>
                                {achievements.length > 0 ? (
                                    <ul className={styles.achievementsList}>
                                        {achievements.map((achievement) => (
                                            <li key={achievement.id} className={styles.achievementItem}>
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
                    <div className={styles.profileRightColumn}>
                        <div className={styles.profileInfoContainer}>
                            <div className={styles.profileInfoHeader}>
                                <h2>Личная информация</h2>
                                {isEditing ? (
                                    <div className={styles.editButtons}>
                                        <Button onClick={handleSave} disabled={isLoading} className={styles.editButton}>
                                            {isLoading ? 'Сохранение...' : 'Сохранить'}
                                        </Button>
                                        <Button onClick={handleCancel} disabled={isLoading} className={styles.editButton}>
                                            Отмена
                                        </Button>
                                    </div>
                                ) : (
                                    <Button onClick={handleEdit} className={styles.editButton}>Изменить</Button>
                                )}
                            </div>
                            {errors.general && (
                                <div className={styles.errorMessage}>
                                    <ErrorField message={errors.general} />
                                </div>
                            )}
                            <div className={styles.profileInfoContent}>
                                {isEditing ? (
                                    // Форма редактирования
                                    <>
                                        <div className={styles.profileInfoItem}>
                                            <label className={styles.infoLabel}>Имя</label>
                                            <Input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                hasError={!!errors.firstName}
                                            />
                                            {errors.firstName && <ErrorField message={errors.firstName} />}
                                        </div>
                                        <div className={styles.profileInfoItem}>
                                            <label className={styles.infoLabel}>Фамилия</label>
                                            <Input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                hasError={!!errors.lastName}
                                            />
                                            {errors.lastName && <ErrorField message={errors.lastName} />}
                                        </div>
                                        <div className={styles.profileInfoItem}>
                                            <label className={styles.infoLabel}>Email</label>
                                            <span className={styles.infoValue}>{formData.email}</span>
                                            <p className={styles.infoHint}>Email нельзя изменить</p>
                                        </div>
                                        <div className={styles.profileInfoItem}>
                                            <label className={styles.infoLabel}>Город</label>
                                            <Input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                hasError={!!errors.city}
                                            />
                                            {errors.city && <ErrorField message={errors.city} />}
                                        </div>
                                    </>
                                ) : (
                                    // Отображение информации
                                    <>
                                        <div className={styles.profileInfoItem}>
                                            <span className={styles.infoLabel}>Имя</span>
                                            <span className={styles.infoValue}>{userData?.first_name}</span>
                                        </div>
                                        <div className={styles.profileInfoItem}>
                                            <span className={styles.infoLabel}>Фамилия</span>
                                            <span className={styles.infoValue}>{userData?.last_name}</span>
                                        </div>
                                        <div className={styles.profileInfoItem}>
                                            <span className={styles.infoLabel}>Email</span>
                                            <span className={styles.infoValue}>{userData?.email}</span>
                                        </div>
                                        <div className={styles.profileInfoItem}>
                                            <span className={styles.infoLabel}>Город</span>
                                            <span className={styles.infoValue}>{userData?.city}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Секция с проектами пользователя */}
                <div className={styles.profileProjectsSection}>
                    <div className={styles.projectsHeader}>
                        <h2>Мои проекты</h2>
                        <Button onClick={handleCreateProject}>Создать проект</Button>
                    </div>
                    <div className={styles.projectsList}>
                        {projects.length > 0 ? (
                            projects.map((project) => (
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
                            ))
                        ) : (
                            <p>У вас пока нет проектов</p>
                        )}
                    </div>
                    <div className={styles.allProjectsButtonContainer}>
                        <Button onClick={navigateToAllProjects} className={styles.allProjectsButton}>
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