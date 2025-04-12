import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Определяем типы для вкладок
type TabType = 'projects' | 'roles' | 'offers' | 'voting';

const DevSyncPage: React.FC = () => {
    // Состояние для активной вкладки
    const [activeTab, setActiveTab] = useState<TabType>('projects');

    // Функция для получения пути к изображению в зависимости от активной вкладки
    const getImageForTab = () => {
        switch(activeTab) {
            case 'projects':
                return '/assets/images/projects.png';
            case 'roles':
                return '/assets/images/roles.png';
            case 'offers':
                return '/assets/images/offers.png';
            case 'voting':
                return '/assets/images/voting.png';
            default:
                return '/assets/images/projects.png';
        }
    };

    // TODO: переделать потом ссылку, когда будет создание проекта
    // <Link to="/">Создать проект</Link> ----> <Link to="/create_project">Создать проект</Link>

    return (
        <div className="devsync-page">
            <header>
                <div className="logo">
                    <span>DevSync</span>
                </div>
                <nav>
                    <Link to="/">Создать проект</Link>
                    <Link to="/faq">FAQ</Link>
                </nav>
                <Link to="/login">Личный кабинет</Link>
            </header>

            <main>
                <section className="hero">
                    <h1>О DevSync</h1>
                    <p>Приложение, которое сделает процесс разработки проектов на IT удобным объединением людей, задач и проектов на одной платформе</p>

                    <div className="hero-image">
                        <img src='src/photos/pagesImages/mainPicture.png' alt={'Базовая картинка'}/>
                    </div>
                </section>

                <section className="features">
                    <h2>Возможности DevSync</h2>
                    <div className="feature-tabs">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={activeTab === 'projects' ? 'active' : ''}
                        >
                            Проекты
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={activeTab === 'roles' ? 'active' : ''}
                        >
                            Роли
                        </button>
                        <button
                            onClick={() => setActiveTab('offers')}
                            className={activeTab === 'offers' ? 'active' : ''}
                        >
                            Предложения
                        </button>
                        <button
                            onClick={() => setActiveTab('voting')}
                            className={activeTab === 'voting' ? 'active' : ''}
                        >
                            Голосования
                        </button>
                    </div>

                    <div className="feature-content">
                        <div className="feature-image">
                            <img src={getImageForTab()} alt={`Функция ${activeTab}`} />
                        </div>
                        <div className="feature-description">
                            {activeTab === 'projects' && (
                                <p>Создавайте проекты и управляйте ими. Отслеживайте прогресс и достигайте результатов вместе с командой.</p>
                            )}
                            {activeTab === 'roles' && (
                                <p>Назначайте различные роли участникам команды в зависимости от их навыков и опыта.</p>
                            )}
                            {activeTab === 'offers' && (
                                <p>Делитесь идеями и предложениями по улучшению проекта. Обсуждайте инициативы команды.</p>
                            )}
                            {activeTab === 'voting' && (
                                <p>Принимайте решения демократическим путем. Создавайте голосования и узнавайте мнение всей команды.</p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="benefits">
                    <h2>Почему именно мы?</h2>
                    <div className="benefits-grid">
                        <div className="benefit">
                            <h3>Прозрачность решений</h3>
                            <p>При помощи голосования можно быстро и открыто решить важный вопрос.</p>
                        </div>
                        <div className="benefit">
                            <h3>Свой проект</h3>
                            <p>Создавай проект на любую тему: от программирования до плана уборки комнаты.</p>
                        </div>
                        <div className="benefit">
                            <h3>Создавай роли</h3>
                            <p>При необходимости можно сделать свою роль с помощью гибких настроек прав доступа.</p>
                        </div>
                        <div className="benefit">
                            <h3>Ставь и выполняй задачи</h3>
                            <p>Планируй свою работу на несколько дней вперед при помощи трекера задач.</p>
                        </div>
                    </div>
                </section>

                <section className="get-started">
                    <h2>Начни сегодня</h2>
                    <ol>
                        <li>
                            <h3>Пройди регистрацию</h3>
                            <p>Пройди и заверши регистрацию для работы с платформой</p>
                        </li>
                        <li>
                            <h3>Создай проект</h3>
                            <p>Создай проект со своими настройками и описанием</p>
                        </li>
                        <li>
                            <h3>Собирай команду разработчиков</h3>
                            <p>Добавь в команду людей которые помогут реализовать твой проект, создавай и выполняй задачи</p>
                        </li>
                        <li>
                            <h3>Начинай работу</h3>
                            <p>Создавай задачи и ставь дедлайны, работаем!</p>
                        </li>
                    </ol>
                </section>
            </main>

            <Link to="/register">Регистрация</Link>
        </div>
    );
};

export default DevSyncPage;