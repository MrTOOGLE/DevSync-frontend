import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { Header } from "../../components/common/Header/Header.tsx";
import { Footer } from "../../components/common/Footer/Footer.tsx";
import '../../styles/styles.css';

// Заглушка для данных пользователя
const mockUserData = {
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

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(mockUserData);

    // Заглушка для обработчика редактирования профиля
    const handleEdit = () => {
        console.log('Редактирование профиля');
    };

    // Заглушка для обработчика открытия проекта
    const handleOpenProject = (projectId: number) => {
        console.log(`Открытие проекта ${projectId}`);
        // navigate(`/projects/${projectId}`);
    };

    // Переход на страницу всех проектов
    const navigateToAllProjects = () => {
        // navigate('/projects');
        console.log('Переход на страницу всех проектов');
    };

    return (
        <div className="main-container">
            <Header />
            <div className="main-content">
                <div className="profile-container">
                    {/* Левая колонка - аватар и достижения */}
                    <div className="profile-left-column">
                        <div className="profile-avatar-container">
                            <img src={userData.avatar} alt="Аватар пользователя" className="profile-avatar" />
                        </div>
                        <div className="profile-achievements">
                            <h2>Мои достижения</h2>
                            <div className="achievements-content">
                                {userData.achievements.length > 0 ? (
                                    <ul className="achievements-list">
                                        {userData.achievements.map(achievement => (
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
                                <button onClick={handleEdit} className="edit-button">Изменить</button>
                            </div>
                            <div className="profile-info-content">
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Секция с проектами пользователя */}
                <div className="profile-projects-section">
                    <h2>Мои проекты</h2>
                    <div className="projects-list">
                        {userData.projects.map(project => (
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
                        <button onClick={navigateToAllProjects} className="all-projects-button">
                            Все проекты
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;