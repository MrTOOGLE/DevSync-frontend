import React, { useState, useEffect } from 'react';
import styles from '../../styles/ProjectManagement.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { Select } from '../../components/common/Select/Select.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import {
    tasksService,
    Task,
    TaskCreateData
} from '../../hooks/TaskService.tsx';

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
            setErrors(prev => ({ ...prev, tasks: '' }));

            const tasksData = await tasksService.getProjectTasks(projectId);
            setTasks(tasksData);
        } catch (error: any) {
            console.error('Ошибка загрузки задач:', error);
            setErrors(prev => ({ ...prev, tasks: error.message || 'Ошибка загрузки задач' }));
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
            setErrors(prev => ({ ...prev, taskCreate: '', taskTitle: '' }));

            const createdTask = await tasksService.createTask(projectId, newTask);
            setTasks(prev => [createdTask, ...prev]);

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
            const errorMessage = error.data?.title?.[0] || error.data?.detail || error.message || 'Ошибка при создании задачи';
            setErrors(prev => ({ ...prev, taskCreate: errorMessage }));
        } finally {
            setCreating(false);
        }
    };

    // Обновление статуса задачи
    const handleUpdateTaskStatus = async (taskId: number, newStatus: Task['status']) => {
        try {
            setErrors(prev => ({ ...prev, updateTask: '' }));
            await tasksService.updateTask(projectId, taskId, { status: newStatus });

            setTasks(prev => prev.map(task =>
                task.id === taskId
                    ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
                    : task
            ));
        } catch (error: any) {
            console.error('Ошибка обновления задачи:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при обновлении задачи';
            setErrors(prev => ({ ...prev, updateTask: errorMessage }));
        }
    };

    // Удаление задачи
    const handleDeleteTask = async (taskId: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (!confirm(`Вы уверены, что хотите удалить задачу "${task.title}"?`)) {
            return;
        }

        try {
            setErrors(prev => ({ ...prev, deleteTask: '' }));
            await tasksService.deleteTask(projectId, taskId);
            setTasks(prev => prev.filter(task => task.id !== taskId));
        } catch (error: any) {
            console.error('Ошибка удаления задачи:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при удалении задачи';
            setErrors(prev => ({ ...prev, deleteTask: errorMessage }));
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

    // Получение названия приоритета
    const getPriorityName = (priority: Task['priority']): string => {
        switch (priority) {
            case 'low': return 'Низкий';
            case 'medium': return 'Средний';
            case 'high': return 'Высокий';
            default: return priority;
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
        return (
            <div className={styles.section}>
                <p>Загрузка задач...</p>
            </div>
        );
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
                    Создать задачу
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
                    placeholder="🔍 Поиск задач"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1 }}
                />

                <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ minWidth: '150px' }}
                >
                    <option value="all">Все статусы</option>
                    <option value="new">Новые</option>
                    <option value="in_progress">В работе</option>
                    <option value="completed">Завершенные</option>
                    <option value="on_hold">На паузе</option>
                </Select>
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
                                type="date"
                                value={newTask.deadline}
                                onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '14px', color: '#7C7C7C', marginBottom: '5px', display: 'block' }}>
                                Приоритет
                            </label>
                            <Select
                                value={newTask.priority}
                                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                            >
                                <option value="low">Низкий</option>
                                <option value="medium">Средний</option>
                                <option value="high">Высокий</option>
                            </Select>
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
                                setErrors(prev => ({ ...prev, taskTitle: '', taskCreate: '' }));
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

            {/* Список задач */}
            {filteredTasks.length > 0 ? (
                <div className={styles.itemsList}>
                    {filteredTasks.map((task) => (
                        <div key={task.id} style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '14px',
                            padding: '20px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            marginBottom: '15px'
                        }}>
                            {/* Заголовок задачи */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '500',
                                        color: '#353536',
                                        margin: '0 0 5px 0'
                                    }}>
                                        {task.title}
                                    </h3>
                                    {task.description && (
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#7C7C7C',
                                            margin: '0 0 10px 0',
                                            lineHeight: '1.4'
                                        }}>
                                            {task.description}
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    {/* Статус */}
                                    <span style={{
                                        backgroundColor: getStatusColor(task.status),
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {getStatusName(task.status)}
                                    </span>

                                    {/* Приоритет */}
                                    <span style={{
                                        backgroundColor: getPriorityColor(task.priority),
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {getPriorityName(task.priority)}
                                    </span>

                                    {/* Кнопка удаления */}
                                    <button
                                        className={`${styles.iconButton} ${styles.deleteButton}`}
                                        onClick={() => handleDeleteTask(task.id)}
                                        title="Удалить задачу"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {/* Мета информация */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#7C7C7C' }}>
                                    {task.deadline && (
                                        <span>📅 {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
                                    )}
                                    {task.assignee && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span>👤</span>
                                            <span>{task.assignee.first_name} {task.assignee.last_name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Кнопки смены статуса */}
                                {task.status !== 'completed' && (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {task.status === 'new' && (
                                            <button
                                                onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                                                style={{
                                                    backgroundColor: '#126DF7',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '4px 8px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Взять в работу
                                            </button>
                                        )}
                                        {task.status === 'in_progress' && (
                                            <button
                                                onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                                style={{
                                                    backgroundColor: '#28A745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '4px 8px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Завершить
                                            </button>
                                        )}
                                    </div>
                                )}
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

            {/* Отображение ошибок */}
            {errors.tasks && <ErrorField message={errors.tasks} />}
            {errors.updateTask && <ErrorField message={errors.updateTask} />}
            {errors.deleteTask && <ErrorField message={errors.deleteTask} />}
        </div>
    );
};

export default ProjectTasks;