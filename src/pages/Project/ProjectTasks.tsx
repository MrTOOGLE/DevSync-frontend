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
    const [newTask, setNewTask] = useState<TaskCreateData & {
        department_id?: number;
        assignee_id?: number;
        deadline_end?: string;
    }>({
        title: '',
        description: '',
        priority: 'medium',
        deadline: '',
        deadline_end: '',
        department_id: undefined,
        assignee_id: undefined
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

            const tasksData = await tasksService.getProjectTasks(projectId);
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

            // Формируем дедлайн
            let deadlineString = '';
            if (newTask.deadline && newTask.deadline_end) {
                const startDate = new Date(newTask.deadline).toLocaleDateString('ru-RU');
                const endDate = new Date(newTask.deadline_end).toLocaleDateString('ru-RU');
                deadlineString = `${startDate} - ${endDate}`;
            } else if (newTask.deadline) {
                deadlineString = new Date(newTask.deadline).toLocaleDateString('ru-RU');
            }

            const taskData: TaskCreateData = {
                title: newTask.title,
                description: newTask.description || '',
                priority: newTask.priority,
                deadline: deadlineString,
                assignee: newTask.assignee_id
            };

            const createdTask = await tasksService.createTask(projectId, taskData);
            setTasks(prev => [createdTask, ...prev]);

            // Сброс формы
            setNewTask({
                title: '',
                description: '',
                priority: 'medium',
                deadline: '',
                deadline_end: '',
                department_id: undefined,
                assignee_id: undefined
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
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDepartment = filters.departments.length === 0; // Пока без отделов в задачах
        const matchesAssignee = filters.assignees.length === 0 ||
            (task.assignee && filters.assignees.includes(task.assignee.id));

        return matchesSearch && matchesDepartment && matchesAssignee;
    });

    // Получение названия отдела
    const getDepartmentName = (departmentId?: number): string => {
        if (!departmentId) return 'Без отдела';
        const department = departments.find(d => d.id === departmentId);
        return department?.title || 'Неизвестный отдел';
    };

    // Получение участника
    // @ts-ignore
    const getMemberName = (memberId?: number): string => {
        if (!memberId) return 'Не назначен';
        const member = members.find(m => m.user.id === memberId);
        return member ? `${member.user.first_name} ${member.user.last_name}` : 'Неизвестный участник';
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
                                    <h4 style={{ fontSize: '16px', color: '#353536', marginBottom: '10px' }}>Участники</h4>
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
                                        description: '',
                                        priority: 'medium',
                                        deadline: '',
                                        deadline_end: '',
                                        department_id: undefined,
                                        assignee_id: undefined
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
                                Название
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
                                Дедлайн
                            </label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <Input
                                    type="date"
                                    value={newTask.deadline}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                                    style={{ flex: 1 }}
                                />
                                <span style={{ color: '#7C7C7C' }}>—</span>
                                <Input
                                    type="date"
                                    value={newTask.deadline_end}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, deadline_end: e.target.value }))}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '16px', color: '#353536', marginBottom: '8px', display: 'block' }}>
                                Отдел
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {departments.map(department => (
                                    <button
                                        key={department.id}
                                        type="button"
                                        onClick={() => setNewTask(prev => ({
                                            ...prev,
                                            department_id: prev.department_id === department.id ? undefined : department.id
                                        }))}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: newTask.department_id === department.id ? '#FFDD2D' : '#F6F7F8',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: newTask.department_id === department.id ? '500' : '400'
                                        }}
                                    >
                                        {department.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label style={{ fontSize: '16px', color: '#353536', marginBottom: '8px', display: 'block' }}>
                                Исполнитель
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                {members.map(member => (
                                    <div
                                        key={member.user.id}
                                        onClick={() => setNewTask(prev => ({
                                            ...prev,
                                            assignee_id: prev.assignee_id === member.user.id ? undefined : member.user.id
                                        }))}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 12px',
                                            backgroundColor: newTask.assignee_id === member.user.id ? '#FFDD2D' : '#F6F7F8',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            border: newTask.assignee_id === member.user.id ? '2px solid #FFDD2D' : '2px solid transparent'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: newTask.assignee_id === member.user.id ? '#FFFFFF' : '#FFDD2D',
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
                                            fontWeight: newTask.assignee_id === member.user.id ? '500' : '400'
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
                        gridTemplateColumns: 'auto 150px 150px 150px 40px',
                        gap: '20px',
                        padding: '20px',
                        backgroundColor: '#F6F7F8',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#353536'
                    }}>
                        <div>Название</div>
                        <div>Дедлайн</div>
                        <div>Отдел</div>
                        <div>Исполнитель</div>
                        <div></div>
                    </div>

                    {/* Строки задач */}
                    {filteredTasks.map((task, index) => (
                        <div
                            key={task.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 150px 150px 150px 40px',
                                gap: '20px',
                                padding: '20px',
                                borderTop: index > 0 ? '1px solid #F6F7F8' : 'none',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: task.status === 'completed' ? '#28A745' : '#FFDD2D'
                                }}></div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#353536', marginBottom: '4px' }}>
                                        {task.title}
                                    </div>
                                    {task.description && (
                                        <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                            {task.description.length > 100
                                                ? `${task.description.substring(0, 100)}...`
                                                : task.description
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                {task.deadline || 'Не указан'}
                            </div>

                            <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                {getDepartmentName(newTask.department_id)}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {task.assignee ? (
                                    <>
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
                                    </>
                                ) : (
                                    <span style={{ fontSize: '14px', color: '#7C7C7C' }}>Не назначен</span>
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
        </div>
    );
};

export default ProjectTasks;