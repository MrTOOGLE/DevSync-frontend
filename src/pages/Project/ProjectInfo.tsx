import React, { useState } from 'react';
import styles from '../../styles/ProjectManagement.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import { projectService, ProjectData } from '../../hooks/CreateProjectService.tsx';

interface ProjectInfoProps {
    project: ProjectData;
    onUpdate: (updatedProject: ProjectData) => void;
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({ project, onUpdate }) => {
    // Состояния для редактирования
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description);
    const [isPublic, setIsPublic] = useState(project.is_public);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Сброс формы к исходным значениям
    const resetForm = () => {
        setTitle(project.title);
        setDescription(project.description);
        setIsPublic(project.is_public);
        setErrors({});
    };

    // Начать редактирование
    const handleStartEdit = () => {
        setIsEditing(true);
        resetForm();
    };

    // Отменить редактирование
    const handleCancelEdit = () => {
        setIsEditing(false);
        resetForm();
    };

    // Валидация формы
    const validateForm = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        if (!title.trim()) {
            newErrors.title = 'Название проекта обязательно';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Сохранить изменения
    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            setErrors({});

            const updatedProject = await projectService.updateProject(project.id!, {
                title: title.trim(),
                description: description.trim(),
                is_public: isPublic
            });

            onUpdate(updatedProject);
            setIsEditing(false);
        } catch (error: any) {
            console.error('Ошибка обновления проекта:', error);

            if (error.data) {
                setErrors(error.data);
            } else {
                setErrors({
                    server: error.message || 'Ошибка при сохранении изменений'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Форматирование даты
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            {/* Основная информация */}
            <div className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className={styles.sectionTitle}>Редактирование проекта</h2>
                    {!isEditing && (
                        <button
                            className={styles.primaryButton}
                            onClick={handleStartEdit}
                        >
                            Редактировать
                        </button>
                    )}
                </div>

                {isEditing ? (
                    // Форма редактирования
                    <div>
                        <div className={styles.formGroup}>
                            <Input
                                placeholder="Название проекта*"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                hasError={!!errors.title}
                            />
                            {errors.title && <ErrorField message={errors.title} />}
                        </div>

                        <div className={styles.formGroup}>
                            <textarea
                                className={styles.textarea}
                                placeholder="Описание проекта"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {errors.description && <ErrorField message={errors.description} />}
                        </div>

                        {errors.server && <ErrorField message={errors.server} />}

                        <div className={styles.actionButtons}>
                            <button
                                className={styles.secondaryButton}
                                onClick={handleCancelEdit}
                                disabled={loading}
                            >
                                Отменить
                            </button>
                            <button
                                className={styles.primaryButton}
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                ) : (
                    // Просмотр информации
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', color: '#353536', marginBottom: '8px', fontFamily: '"Helvetica Neue", sans-serif' }}>
                                Название
                            </h3>
                            <p style={{ fontSize: '18px', color: '#7C7C7C', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                {project.title}
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', color: '#353536', marginBottom: '8px', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                Описание
                            </h3>
                            <p style={{ fontSize: '16px', color: '#7C7C7C', lineHeight: '1.5', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                {project.description || 'Описание не указано'}
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', color: '#353536', marginBottom: '8px', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                Дата создания
                            </h3>
                            <p style={{ fontSize: '16px', color: '#7C7C7C', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                {project.date_created ? formatDate(project.date_created) : 'Не указана'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Настройки приватности */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Настройки приватности</h2>

                {isEditing ? (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}
                        >
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '15px 20px',
                                    backgroundColor: isPublic ? 'rgba(255, 221, 45, 0.1)' : '#F6F7F8',
                                    borderRadius: '14px',
                                    border: isPublic ? '2px solid #FFDD2D' : '2px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => setIsPublic(true)}
                            >
                                <span style={{ fontSize: '24px', marginRight: '15px' }}>🌍</span>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#353536', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                        Публичный проект
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#7C7C7C', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                        Проект доступен всем пользователям для просмотра и предложений
                                    </p>
                                </div>
                                <input
                                    type="radio"
                                    name="privacy"
                                    checked={isPublic}
                                    onChange={() => setIsPublic(true)}
                                    style={{ marginLeft: '15px' }}
                                />
                            </label>

                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '15px 20px',
                                    backgroundColor: !isPublic ? 'rgba(255, 221, 45, 0.1)' : '#F6F7F8',
                                    borderRadius: '14px',
                                    border: !isPublic ? '2px solid #FFDD2D' : '2px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => setIsPublic(false)}
                            >
                                <span style={{ fontSize: '24px', marginRight: '15px' }}>🔒</span>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#353536', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                        Приватный проект
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#7C7C7C', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                        Проект доступен только приглашённым участникам
                                    </p>
                                </div>
                                <input
                                    type="radio"
                                    name="privacy"
                                    checked={!isPublic}
                                    onChange={() => setIsPublic(false)}
                                    style={{ marginLeft: '15px' }}
                                />
                            </label>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '20px',
                                backgroundColor: '#F6F7F8',
                                borderRadius: '14px'
                            }}
                        >
                            <span style={{ fontSize: '32px', marginRight: '20px' }}>
                                {project.is_public ? '🌍' : '🔒'}
                            </span>
                            <div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#353536', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                    {project.is_public ? 'Публичный проект' : 'Приватный проект'}
                                </h3>
                                <p style={{ margin: 0, fontSize: '16px', color: '#7C7C7C', fontFamily: '"Helvetica Neue", sans-serif'  }}>
                                    {project.is_public
                                        ? 'Проект доступен всем пользователям для просмотра и предложений'
                                        : 'Проект доступен только приглашённым участникам'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectInfo;