import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../../styles/styles.css";
import styles from '../../styles/ProjectManagement.module.css';
import { Header } from "../../components/common/Header/Header.tsx";
import { Footer } from "../../components/common/Footer/Footer.tsx";
import { projectService, ProjectData } from '../../hooks/CreateProjectService.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';

// Компоненты для каждого раздела
import ProjectInfo from './ProjectInfo.tsx';
import ProjectMembers from './ProjectMembers.tsx';
import ProjectTasks from './ProjectTasks.tsx';
import ProjectVoting from './ProjectVoiting.tsx';

// Типы для табов
type TabType = 'info' | 'members' | 'tasks' | 'voting';

const ProjectPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    // Состояние
    const [activeTab, setActiveTab] = useState<TabType>('info');
    const [project, setProject] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Загрузка данных проекта
    useEffect(() => {
        if (projectId) {
            loadProject(parseInt(projectId));
        } else {
            navigate('/');
        }
    }, [projectId, navigate]);

    const loadProject = async (id: number) => {
        try {
            setLoading(true);
            setError('');

            const projectData = await projectService.getProject(id);
            setProject(projectData);
        } catch (error: any) {
            console.error('Ошибка загрузки проекта:', error);
            setError(error.message || 'Ошибка загрузки проекта');

            // Если проект не найден или нет доступа, перенаправляем на главную
            if (error.status === 404 || error.status === 403) {
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    // Обновление данных проекта
    const handleProjectUpdate = (updatedProject: ProjectData) => {
        setProject(updatedProject);
    };

    // Определение названий табов
    const getTabName = (tab: TabType): string => {
        switch (tab) {
            case 'info': return 'О проекте';
            case 'members': return 'Участники';
            case 'tasks': return 'Задачи';
            case 'voting': return 'Голосования';
            default: return '';
        }
    };

    // Показать загрузку
    if (loading) {
        return (
            <div className="main-container">
                <Header />
                <div className="main-content">
                    <div className={styles.loadingContainer}>
                        <h2>Загрузка проекта...</h2>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Показать ошибку
    if (error || !project) {
        return (
            <div className="main-container">
                <Header />
                <div className="main-content">
                    <div className={styles.errorContainer}>
                        <h2>Ошибка</h2>
                        <ErrorField message={error || 'Проект не найден'} />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="main-container">
            <Header />
            <div className="main-content">
                <div className={styles.projectContainer}>
                    {/* Заголовок проекта */}
                    <div className={styles.projectHeader}>
                        <div className={styles.projectTitle}>
                            <h1>{project.title}</h1>
                            <div className={styles.projectMeta}>
                                <span className={styles.projectOwner}>
                                    Владелец: {project.owner?.first_name} {project.owner?.last_name}
                                </span>
                                <span className={styles.projectStatus}>
                                    {project.is_public ? '🌍 Публичный' : '🔒 Приватный'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Навигация по табам */}
                    <div className={styles.tabNavigation}>
                        {(['info', 'members', 'tasks', 'voting'] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                className={`${styles.tabButton} ${activeTab === tab ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {getTabName(tab)}
                            </button>
                        ))}
                    </div>

                    {/* Контент табов */}
                    <div className={styles.tabContent}>
                        {activeTab === 'info' && (
                            <ProjectInfo
                                project={project}
                                onUpdate={handleProjectUpdate}
                            />
                        )}
                        {activeTab === 'members' && (
                            <ProjectMembers
                                projectId={project.id!}
                            />
                        )}
                        {activeTab === 'tasks' && (
                            <ProjectTasks
                                projectId={project.id!}
                            />
                        )}
                        {activeTab === 'voting' && (
                            <ProjectVoting
                                projectId={project.id!}
                            />
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProjectPage;