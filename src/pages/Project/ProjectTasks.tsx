import React, { useState, useEffect } from 'react';
import styles from '../../styles/ProjectManagement.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import {
    tasksService,
    Task,
    TaskCreateData
} from '../../hooks/TaskService.tsx';
import { projectService, Department, ProjectMember } from '../../hooks/CreateProjectService.tsx';
import { format } from 'date-fns'

interface ProjectTasksProps {
    projectId: number;
}

interface TaskFilters {
    departments: number[];
    assignees: number[];
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId }) => {
    // Состояния
    const [tasks, setTasks] = useState<Task[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Фильтры и поиск
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<TaskFilters>({
        departments: [],
        assignees: []
    });

    // Создание задачи
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [newTask, setNewTask] = useState<{
        title: string;
        assignees: number[];
        department?: number;
        start_date?: string;
        end_date?: string;
    }>({
        title: '',
        assignees: [],
        department: undefined,
        start_date: undefined,
        end_date: undefined
    });
    const [creating, setCreating] = useState(false);

    // Загрузка данных при монтировании
    useEffect(() => {
        loadTasks();
        loadDepartments();
        loadMembers();
    }, [projectId]);

    // Загрузка задач
    const loadTasks = async () => {
        try {
            setLoading(true);
            setErrors(prev => ({ ...prev, tasks: '' }));

            const tasksData = await tasksService.getProjectTasks(projectId, true);
            setTasks(tasksData);
        } catch (error: any) {
            console.error('Ошибка загрузки задач:', error);
            setErrors(prev => ({ ...prev, tasks: error.message || 'Ошибка загрузки задач' }));
        } finally {
            setLoading(false);
        }
    };

    // Загрузка отделов
    const loadDepartments = async () => {
        try {
            const departmentsData = await projectService.getProjectDepartments(projectId);
            setDepartments(departmentsData);
        } catch (error: any) {
            console.error('Ошибка загрузки отделов:', error);
        }
    };

    // Загрузка участников
    const loadMembers = async () => {
        try {
            const membersData = await projectService.getProjectMembers(projectId);
            setMembers(membersData);
        } catch (error: any) {
            console.error('Ошибка загрузки участников:', error);
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

            // Подготавливаем данные для создания задачи
            const taskData: TaskCreateData = {
                title: newTask.title.trim(),
                assignees: newTask.assignees,
                department: newTask.department,
                // Преобразуем даты в ISO формат только если они заполнены

                start_date: newTask.start_date ? format(new Date(newTask.start_date), 'yyyy-MM-dd') : undefined,
                end_date: newTask.end_date ? format(new Date(newTask.end_date), 'yyyy-MM-dd') : undefined
            };

            const createdTask = await tasksService.createTask(projectId, taskData);
            setTasks(prev => [createdTask, ...prev]);

            // Сброс формы
            setNewTask({
                title: '',
                assignees: [],
                department: undefined,
                start_date: undefined,
                end_date: undefined
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

    // Переключение статуса выполнения задачи
    const handleToggleTaskCompletion = async (taskId: number, isCompleted: boolean) => {
        try {
            setErrors(prev => ({ ...prev, toggleTask: '' }));
            await tasksService.toggleTaskCompletion(projectId, taskId, isCompleted);

            // Обновляем локальное состояние
            setTasks(prev => prev.map(task =>
                task.id === taskId ? { ...task, is_completed: isCompleted } : task
            ));
        } catch (error: any) {
            console.error('Ошибка изменения статуса задачи:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при изменении статуса задачи';
            setErrors(prev => ({ ...prev, toggleTask: errorMessage }));
        }
    };

    // Применение фильтров
    const applyFilters = () => {
        setShowFilters(false);
    };

    // Сброс фильтров
    const resetFilters = () => {
        setFilters({
            departments: [],
            assignees: []
        });
    };

    // Фильтрация задач
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDepartment = filters.departments.length === 0 ||
            (task.department && filters.departments.includes(task.department));

        const matchesAssignee = filters.assignees.length === 0 ||
            task.assignees.some(assignee => filters.assignees.includes(assignee.id));

        return matchesSearch && matchesDepartment && matchesAssignee;
    });

    // Получение названия отдела
    const getDepartmentName = (departmentId?: number | null): string => {
        if (!departmentId) return 'Без отдела';
        const department = departments.find(d => d.id === departmentId);
        return department?.title || 'Неизвестный отдел';
    };

    // Форматирование даты
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Не указана';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    // Получение минимальной даты для input[type="date"]
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
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
            {/* Заголовок и управление */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                gap: '15px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                    <Input
                        placeholder="🔍 Поиск задач"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1, maxWidth: '400px' }}
                    />

                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                padding: '12px 20px',
                                backgroundColor: '#F6F7F8',
                                border: 'none',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span>🔧</span>
                            Фильтры
                        </button>

                        {/* Всплывающие фильтры */}
                        {showFilters && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                backgroundColor: '#FFFFFF',
                                borderRadius: '14px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                padding: '20px',
                                marginTop: '8px',
                                zIndex: 10,
                                minWidth: '300px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '18px', color: '#353536', margin: 0 }}>Фильтры</h3>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '18px',
                                            color: '#7C7C7C',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Фильтр по отделам */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '16px', color: '#353536', marginBottom: '10px' }}>Отдел</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {departments.map(department => (
                                            <button
                                                key={department.id}
                                                onClick={() => {
                                                    const newDepartments = filters.departments.includes(department.id!)
                                                        ? filters.departments.filter(id => id !== department.id)
                                                        : [...filters.departments, department.id!];
                                                    setFilters(prev => ({ ...prev, departments: newDepartments }));
                                                }}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: filters.departments.includes(department.id!) ? '#FFDD2D' : '#F6F7F8',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    fontWeight: filters.departments.includes(department.id!) ? '500' : '400'
                                                }}
                                            >
                                                {department.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Фильтр по участникам */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '16px', color: '#353536', marginBottom: '10px' }}>Исполнители</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                                        {members.map(member => (
                                            <label key={member.user.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.assignees.includes(member.user.id)}
                                                    onChange={(e) => {
                                                        const newAssignees = e.target.checked
                                                            ? [...filters.assignees, member.user.id]
                                                            : filters.assignees.filter(id => id !== member.user.id);
                                                        setFilters(prev => ({ ...prev, assignees: newAssignees }));
                                                    }}
                                                />
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
                                                    {member.user.first_name.charAt(0)}
                                                </div>
                                                <span style={{ fontSize: '14px' }}>
                                                    {member.user.first_name} {member.user.last_name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <button
                                        onClick={resetFilters}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#F6F7F8',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Сбросить
                                    </button>
                                    <button
                                        onClick={applyFilters}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#FFDD2D',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Применить
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className={styles.primaryButton}
                    onClick={() => setShowCreateTask(true)}
                >
                    Создать
                </button>
            </div>

            {/* Форма создания задачи */}
            {showCreateTask && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '30px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '24px', color: '#353536', margin: 0 }}>Создание задачи</h3>
                            <button
                                onClick={() => {
                                    setShowCreateTask(false);
                                    setNewTask({
                                        title: '',
                                        assignees: [],
                                        department: undefined,
                                        start_date: undefined,
                                        end_date: undefined
                                    });
                                    setErrors(prev => ({ ...prev, taskTitle: '', taskCreate: '' }));
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    color: '#7C7C7C',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '16px', color: '#353536', marginBottom: '8px', display: 'block' }}>
                                Название*
                            </label>
                            <Input
                                placeholder="Название задачи*"
                                value={newTask.title}
                                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                hasError={!!errors.taskTitle}
                            />
                            {errors.taskTitle && <ErrorField message={errors.taskTitle} />}
                        </div>

                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '16px', color: '#353536', marginBottom: '8px', display: 'block' }}>
                                Период выполнения (необязательно)
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#7C7C7C', marginBottom: '5px', display: 'block' }}>
                                        Дата начала
                                    </label>
                                    <Input
                                        type="date"
                                        value={newTask.start_date || ''}
                                        min={getTodayDate()}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, start_date: e.target.value || undefined }))}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '14px', color: '#7C7C7C', marginBottom: '5px', display: 'block' }}>
                                        Дата окончания
                                    </label>
                                    <Input
                                        type="date"
                                        value={newTask.end_date || ''}
                                        min={newTask.start_date || getTodayDate()}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, end_date: e.target.value || undefined }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '16px', color: '#353536', marginBottom: '8px', display: 'block' }}>
                                Отдел
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setNewTask(prev => ({ ...prev, department: undefined }))}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: !newTask.department ? '#FFDD2D' : '#F6F7F8',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        fontWeight: !newTask.department ? '500' : '400'
                                    }}
                                >
                                    Без отдела
                                </button>
                                {departments.map(department => (
                                    <button
                                        key={department.id}
                                        type="button"
                                        onClick={() => setNewTask(prev => ({
                                            ...prev,
                                            department: prev.department === department.id ? undefined : department.id
                                        }))}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: newTask.department === department.id ? '#FFDD2D' : '#F6F7F8',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: newTask.department === department.id ? '500' : '400'
                                        }}
                                    >
                                        {department.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '16px', color: '#353536', marginBottom: '8px', display: 'block' }}>
                                Исполнители
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {members.map(member => (
                                    <div
                                        key={member.user.id}
                                        onClick={() => {
                                            const isSelected = newTask.assignees.includes(member.user.id);
                                            setNewTask(prev => ({
                                                ...prev,
                                                assignees: isSelected
                                                    ? prev.assignees.filter(id => id !== member.user.id)
                                                    : [...prev.assignees, member.user.id]
                                            }));
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 12px',
                                            backgroundColor: newTask.assignees.includes(member.user.id) ? '#FFDD2D' : '#F6F7F8',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            border: newTask.assignees.includes(member.user.id) ? '2px solid #FFDD2D' : '2px solid transparent'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: newTask.assignees.includes(member.user.id) ? '#FFFFFF' : '#FFDD2D',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}>
                                            {member.user.first_name.charAt(0)}
                                        </div>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: newTask.assignees.includes(member.user.id) ? '500' : '400'
                                        }}>
                                            {member.user.first_name} {member.user.last_name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {errors.taskCreate && <ErrorField message={errors.taskCreate} />}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button
                                className={styles.primaryButton}
                                onClick={handleCreateTask}
                                disabled={creating}
                            >
                                {creating ? 'Создание...' : 'Создать'}
                            </button>
                        </div>
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
                        gridTemplateColumns: 'auto 150px 150px 200px 60px',
                        gap: '20px',
                        padding: '20px',
                        backgroundColor: '#F6F7F8',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#353536'
                    }}>
                        <div>Название</div>
                        <div>Начало</div>
                        <div>Окончание</div>
                        <div>Исполнители</div>
                        <div></div>
                    </div>

                    {/* Строки задач */}
                    {filteredTasks.map((task, index) => (
                        <div
                            key={task.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 150px 150px 200px 60px',
                                gap: '20px',
                                padding: '20px',
                                borderTop: index > 0 ? '1px solid #F6F7F8' : 'none',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="checkbox"
                                    checked={task.is_completed}
                                    onChange={(e) => handleToggleTaskCompletion(task.id, e.target.checked)}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#FFDD2D'
                                    }}
                                />
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: task.is_completed ? '#28A745' : '#FFDD2D'
                                }}></div>
                                <div>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        color: '#353536',
                                        marginBottom: '4px',
                                        textDecoration: task.is_completed ? 'line-through' : 'none'
                                    }}>
                                        {task.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#7C7C7C' }}>
                                        {getDepartmentName(task.department)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                {formatDate(task.start_date)}
                            </div>

                            <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                {formatDate(task.end_date)}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                {task.assignees.length > 0 ? (
                                    task.assignees.slice(0, 3).map(assignee => (
                                        <div
                                            key={assignee.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
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
                                                {assignee.first_name.charAt(0)}
                                            </div>
                                            {task.assignees.length === 1 && (
                                                <span style={{ fontSize: '12px', color: '#353536' }}>
                                                    {assignee.first_name}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <span style={{ fontSize: '14px', color: '#7C7C7C' }}>Не назначены</span>
                                )}
                                {task.assignees.length > 3 && (
                                    <span style={{ fontSize: '12px', color: '#7C7C7C' }}>
                                        +{task.assignees.length - 3}
                                    </span>
                                )}
                            </div>

                            <div>
                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '16px',
                                        color: '#FF4444',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
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

            {/* Отображение ошибок */}
            {errors.tasks && <ErrorField message={errors.tasks} />}
            {errors.deleteTask && <ErrorField message={errors.deleteTask} />}
            {errors.toggleTask && <ErrorField message={errors.toggleTask} />}
        </div>
    );
};

export default ProjectTasks;