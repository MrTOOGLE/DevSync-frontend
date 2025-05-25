import React, { useState, useEffect } from 'react';
import styles from '../../../styles/ProjectManagement.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { Select } from '../../components/common/Select/Select.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';

// Типы для задач
interface Task {
    id: number;
    title: string;
    description: string;
    status: 'new' | 'in_progress' | 'completed' | 'on_hold';
    priority: 'low' | 'medium' | 'high';
    assignee?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        avatar: string | null;
    };
    deadline?: string;
    created_at: string;
    updated_at: string;
}

interface TaskCreateData {
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee?: number;
    deadline?: string;
}

interface ProjectTasksProps {
    projectId: number;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId }) => {
    // Состояния
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Фильтры
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Создание задачи
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [newTask, setNewTask] = useState<TaskCreateData>({
        title: '',
        description: '',
        status: 'new',
        priority: 'medium',
        deadline: ''
    });
    const [creating, setCreating] = useState(false);

    // Загрузка задач при монтировании
    useEffect(() => {
        loadTasks();
    }, [projectId]);

    // Загрузка задач
    const loadTasks = async () => {
        try {
            setLoading(true);

            // Моковые данные для демонстрации
            const mockTasks: Task[] = [
                {
                    id: 1,
                    title: 'Разработать макет главной страницы',
                    description: 'Создать дизайн-макет главной страницы с учетом фирменного стиля',
                    status: 'in_progress',
                    priority: 'high',
                    assignee: {
                        id: 1,
                        first_name: 'Александра',
                        last_name: 'Ланшакова',
                        email: 'avk465@tbank.ru',
                        avatar: null
                    },
                    deadline: '2025-06-10',
                    created_at: '2025-05-20T10:00:00Z',
                    updated_at: '2025-05-22T14:30:00Z'
                },
                {
                    id: 2,
                    title: 'Настроить CI/CD pipeline',
                    description: 'Настроить автоматическую сборку и развертывание приложения',
                    status: 'new',
                    priority: 'medium',
                    deadline: '2025-06-15',
                    created_at: '2025-05-21T09:00:00Z',
                    updated_at: '2025-05-21T09:00:00Z'
                },
                {
                    id: 3,
                    title: 'Провести код-ревью',
                    description: 'Проверить качество кода модуля авторизации',
                    status: 'completed',
                    priority: 'low',
                    assignee: {
                        id: 2,
                        first_name: 'Владислав',
                        last_name: 'Дживаваспрингович',
                        email: 'vlad@tbank.ru',
                        avatar: null
                    },
                    created_at: '2025-05-18T16:00:00Z',
                    updated_at: '2025-05-19T11:20:00Z'
                },
                {
                    id: 4,
                    title: 'Разработать макет главной страницы',
                    description: 'Создать дизайн-макет главной страницы с учетом возможностей...',
                    status: 'new',
                    priority: 'high',
                    deadline: '10.03.2025 - 10.04.2025',
                    created_at: '2025-05-20T10:00:00Z',
                    updated_at: '2025-05-22T14:30:00Z'
                }
            ];

            setTasks(mockTasks);
        } catch (error: any) {
            console.error('Ошибка загрузки задач:', error);
            setErrors(prev => ({ ...prev, tasks: 'Ошибка загрузки задач' }));
        } finally {
            setLoading(false);
        }
    };

    // Создание задачи
    const handleCreateTask = async () => {
        if (!newTask.title.trim()) {
            setErrors(prev => ({ ...prev, taskTitle: 'Название задачи обязательно' }));
            return;
        }

        try {
            setCreating(true);
            setErrors({});

            // Здесь должен быть запрос к API
            const mockNewTask: Task = {
                id: Date.now(),
                title: newTask.title,
                description: newTask.description,
                status: newTask.status as Task['status'],
                priority: newTask.priority as Task['priority'],
                deadline: newTask.deadline || undefined,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            setTasks(prev => [mockNewTask, ...prev]);

            // Сброс формы
            setNewTask({
                title: '',
                description: '',
                status: 'new',
                priority: 'medium',
                deadline: ''
            });
            setShowCreateTask(false);

        } catch (error: any) {
            console.error('Ошибка создания задачи:', error);
            setErrors({ taskCreate: 'Ошибка при создании задачи' });
        } finally {
            setCreating(false);
        }
    };

    // Обновление статуса задачи
    const handleUpdateTaskStatus = async (taskId: number, newStatus: Task['status']) => {
        try {
            // Здесь должен быть запрос к API
            setTasks(prev => prev.map(task =>
                task.id === taskId
                    ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
                    : task
            ));
        } catch (error: any) {
            console.error('Ошибка обновления задачи:', error);
            alert('Ошибка при обновлении задачи');
        }
    };

    // Удаление задачи
    const handleDeleteTask = async (taskId: number) => {
        if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
            return;
        }

        try {
            // Здесь должен быть запрос к API
            setTasks(prev => prev.filter(task => task.id !== taskId));
        } catch (error: any) {
            console.error('Ошибка удаления задачи:', error);
            alert('Ошибка при удалении задачи');
        }
    };

    // Фильтрация задач
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Получение названия статуса
    const getStatusName = (status: Task['status']): string => {
        switch (status) {
            case 'new': return 'Новая';
            case 'in_progress': return 'В работе';
            case 'completed': return 'Завершена';
            case 'on_hold': return 'На паузе';
            default: return status;
        }
    };

    // Получение цвета статуса
    const getStatusColor = (status: Task['status']): string => {
        switch (status) {
            case 'new': return '#7C7C7C';
            case 'in_progress': return '#126DF7';
            case 'completed': return '#28A745';
            case 'on_hold': return '#FFC107';
            default: return '#7C7C7C';
        }
    };

    // Получение цвета приоритета
    const getPriorityColor = (priority: Task['priority']): string => {
        switch (priority) {
            case 'high': return '#FF4444';
            case 'medium': return '#FFC107';
            case 'low': return '#28A745';
            default: return '#7C7C7C';
        }
    };

    if (loading) {
        return <div>Загрузка задач...</div>;
    }

    return (
        <div>
            {/* Заголовок и кнопка создания */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className={styles.sectionTitle}>Задачи</h2>
                <button
                    className={styles.primaryButton}
                    onClick={() => setShowCreateTask(true)}
                >
                    Создать
                </button>
            </div>

            {/* Фильтры */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px',
                padding: '20px',
                backgroundColor: '#F6F7F8',
                borderRadius: '14px'
            }}>
                <Input
                    placeholder="🔍 Поиск"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1 }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', color: '#7C7C7C' }}>Фильтры</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <span
                            style={{
                                padding: '5px 12px',
                                backgroundColor: '#FFDD2D',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}
                        >
                            Отдел разработки
                        </span>
                        <span
                            style={{
                                padding: '5px 12px',
                                backgroundColor: '#E0E0E0',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#7C7C7C'
                            }}
                        >
                            Отдел дизайна
                        </span>
                        <span
                            style={{
                                padding: '5px 12px',
                                backgroundColor: '#E0E0E0',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#7C7C7C'
                            }}
                        >
                            Отдел аналитики
                        </span>
                    </div>
                </div>
            </div>

            {/* Форма создания задачи */}
            {showCreateTask && (
                <div style={{
                    backgroundColor: '#F6F7F8',
                    padding: '20px',
                    borderRadius: '14px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#353536' }}>
                        Создание новой задачи
                    </h3>

                    <div className={styles.formGroup}>
                        <Input
                            placeholder="Название задачи*"
                            value={newTask.title}
                            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                            hasError={!!errors.taskTitle}
                        />
                        {errors.taskTitle && <ErrorField message={errors.taskTitle} />}
                    </div>

                    <div className={styles.formGroup}>
                        <textarea
                            className={styles.textarea}
                            placeholder="Описание задачи"
                            value={newTask.description}
                            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '14px', color: '#7C7C7C', marginBottom: '5px', display: 'block' }}>
                                Дедлайн
                            </label>
                            <Input
                                type="text"
                                value={newTask.deadline}
                                onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                                placeholder="дата начала - дата окончания"
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '14px', color: '#7C7C7C', marginBottom: '5px', display: 'block' }}>
                                Отдел
                            </label>
                            <Select>
                                <option value="">Отдел разработки</option>
                                <option value="design">Отдел дизайна</option>
                                <option value="analytics">Отдел аналитики</option>
                            </Select>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '14px', color: '#7C7C7C', marginBottom: '5px', display: 'block' }}>
                                Исполнитель
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    backgroundColor: '#FFDD2D',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>
                                    А
                                </div>
                                <span style={{ fontSize: '14px', color: '#353536' }}>
                                    Александра Ланшакова
                                </span>
                            </div>
                        </div>
                    </div>

                    {errors.taskCreate && <ErrorField message={errors.taskCreate} />}

                    <div className={styles.actionButtons}>
                        <button
                            className={styles.secondaryButton}
                            onClick={() => {
                                setShowCreateTask(false);
                                setNewTask({
                                    title: '',
                                    description: '',
                                    status: 'new',
                                    priority: 'medium',
                                    deadline: ''
                                });
                                setErrors({});
                            }}
                            disabled={creating}
                        >
                            Отменить
                        </button>
                        <button
                            className={styles.primaryButton}
                            onClick={handleCreateTask}
                            disabled={creating}
                        >
                            {creating ? 'Создание...' : 'Создать'}
                        </button>
                    </div>
                </div>
            )}

            {/* Таблица задач */}
            {filteredTasks.length > 0 ? (
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* Заголовок таблицы */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                        gap: '20px',
                        padding: '20px',
                        backgroundColor: '#F6F7F8',
                        fontFamily: 'Helvetica Neue',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#353536'
                    }}>
                        <div>Название</div>
                        <div>Дедлайн</div>
                        <div>Отдел</div>
                        <div>Исполнитель</div>
                        <div></div>
                    </div>

                    {/* Строки таблицы */}
                    {filteredTasks.map((task, index) => (
                        <div key={task.id} style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                            gap: '20px',
                            padding: '20px',
                            borderTop: index > 0 ? '1px solid #F6F7F8' : 'none',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '500', color: '#353536', marginBottom: '5px' }}>
                                    {task.title}
                                </div>
                                <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                    {task.description}
                                </div>
                            </div>

                            <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                {task.deadline || '—'}
                            </div>

                            <div>
                                <span style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#FFDD2D',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}>
                                    Отдел разработки
                                </span>
                            </div>

                            <div>
                                {task.assignee ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            backgroundColor: '#FFDD2D',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {task.assignee.first_name.charAt(0)}
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#353536' }}>
                                            {task.assignee.first_name} {task.assignee.last_name}
                                        </span>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '14px', color: '#7C7C7C' }}>—</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                    className={`${styles.iconButton} ${styles.deleteButton}`}
                                    onClick={() => handleDeleteTask(task.id)}
                                    title="Удалить задачу"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📋</div>
                    <h3>
                        {tasks.length === 0 ? 'Пока нет задач' : 'Ничего не найдено'}
                    </h3>
                    <p>
                        {tasks.length === 0
                            ? 'Создайте первую задачу для начала работы над проектом'
                            : 'Попробуйте изменить фильтры или поисковый запрос'
                        }
                    </p>
                </div>
            )}

            {errors.tasks && <ErrorField message={errors.tasks} />}
        </div>
    );
};

export default ProjectTasks;