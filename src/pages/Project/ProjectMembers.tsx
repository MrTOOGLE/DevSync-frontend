import React, { useState, useEffect } from 'react';
import styles from '../../styles/ProjectManagement.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import {
    projectService,
    ProjectMember,
    Department,
    UserSearchResult
} from '../../hooks/CreateProjectService.tsx';
import { userService } from '../../hooks/UserService.tsx';

interface ProjectMembersProps {
    projectId: number;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId }) => {
    // Состояния для участников и отделов
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Состояния для отделов
    const [expandedDepartments, setExpandedDepartments] = useState<Set<number>>(new Set());
    const [editingDepartment, setEditingDepartment] = useState<number | null>(null);
    const [editDepartmentTitle, setEditDepartmentTitle] = useState('');
    const [editDepartmentDescription, setEditDepartmentDescription] = useState('');

    // Состояния для добавления участников
    const [memberSearch, setMemberSearch] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Состояния для создания отдела
    const [showAddDepartment, setShowAddDepartment] = useState(false);
    const [newDepartmentTitle, setNewDepartmentTitle] = useState('');
    const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
    const [addingDepartment, setAddingDepartment] = useState(false);

    // Загрузка данных при монтировании
    useEffect(() => {
        loadMembers();
        loadDepartments();
    }, [projectId]);

    // Поиск пользователей (теперь ищем отовсюду, а не только участников проекта)
    useEffect(() => {
        const searchUsers = async () => {
            if (memberSearch.length > 2) {
                setIsSearching(true);
                try {
                    const response = await projectService.searchUsers(memberSearch, 1, 10);
                    // Убираем фильтрацию - ищем всех пользователей
                    setSearchResults(response.users);
                } catch (error) {
                    console.error('Ошибка поиска пользователей:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [memberSearch]);

    // Загрузка участников
    const loadMembers = async () => {
        try {
            setLoading(true);
            setErrors(prev => ({ ...prev, members: '' }));
            const membersData = await projectService.getProjectMembers(projectId);
            setMembers(membersData);
        } catch (error: any) {
            console.error('Ошибка загрузки участников:', error);
            setErrors(prev => ({ ...prev, members: error.message || 'Ошибка загрузки участников' }));
        } finally {
            setLoading(false);
        }
    };

    // Загрузка отделов с участниками
    const loadDepartments = async () => {
        try {
            setErrors(prev => ({ ...prev, departments: '' }));
            // Загружаем отделы с параметром members=true для получения участников
            const url = new URL(projectService.getProjectDepartments.toString());
            const response = await fetch(`${url}?members=true`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Добавляем заголовки авторизации если нужно
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDepartments(data.departments || []);
            } else {
                // Fallback на обычную загрузку без участников
                const departmentsData = await projectService.getProjectDepartments(projectId);
                setDepartments(departmentsData);
            }
        } catch (error: any) {
            console.error('Ошибка загрузки отделов:', error);
            setErrors(prev => ({ ...prev, departments: error.message || 'Ошибка загрузки отделов' }));
        }
    };

    // Переключение раскрытия отдела
    const toggleDepartment = (departmentId: number) => {
        const newExpanded = new Set(expandedDepartments);
        if (newExpanded.has(departmentId)) {
            newExpanded.delete(departmentId);
        } else {
            newExpanded.add(departmentId);
        }
        setExpandedDepartments(newExpanded);
    };

    // Начать редактирование отдела
    const startEditDepartment = (department: Department) => {
        setEditingDepartment(department.id!);
        setEditDepartmentTitle(department.title);
        setEditDepartmentDescription(department.description);
    };

    // Сохранить изменения отдела
    const saveEditDepartment = async (departmentId: number) => {
        try {
            setErrors(prev => ({ ...prev, editDepartment: '' }));
            await projectService.updateDepartment(projectId, departmentId, {
                title: editDepartmentTitle,
                description: editDepartmentDescription
            });

            setEditingDepartment(null);
            await loadDepartments();
        } catch (error: any) {
            console.error('Ошибка обновления отдела:', error);
            setErrors(prev => ({ ...prev, editDepartment: error.message || 'Ошибка обновления отдела' }));
        }
    };

    // Отменить редактирование отдела
    const cancelEditDepartment = () => {
        setEditingDepartment(null);
        setEditDepartmentTitle('');
        setEditDepartmentDescription('');
    };

    // Приглашение участника
    const handleInviteMember = async (user: UserSearchResult) => {
        try {
            setErrors(prev => ({ ...prev, invite: '' }));
            await projectService.createInvitation(projectId, user.id);
            setMemberSearch('');
            setSearchResults([]);
            alert(`Приглашение отправлено пользователю ${user.first_name} ${user.last_name}`);
        } catch (error: any) {
            console.error('Ошибка отправки приглашения:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при отправке приглашения';
            setErrors(prev => ({ ...prev, invite: errorMessage }));
        }
    };

    // Удаление участника
    const handleRemoveMember = async (userId: number) => {
        const member = members.find(m => m.user.id === userId);
        if (!member) return;

        if (!confirm(`Вы уверены, что хотите удалить участника ${member.user.first_name} ${member.user.last_name} из проекта?`)) {
            return;
        }

        try {
            setErrors(prev => ({ ...prev, removeMember: '' }));
            await projectService.removeProjectMember(projectId, userId);
            await loadMembers();
            await loadDepartments(); // Обновляем отделы тоже
        } catch (error: any) {
            console.error('Ошибка удаления участника:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при удалении участника';
            setErrors(prev => ({ ...prev, removeMember: errorMessage }));
        }
    };

    // Создание отдела
    const handleCreateDepartment = async () => {
        if (!newDepartmentTitle.trim()) {
            setErrors(prev => ({ ...prev, departmentTitle: 'Название отдела обязательно' }));
            return;
        }

        try {
            setAddingDepartment(true);
            setErrors(prev => ({ ...prev, departmentCreate: '', departmentTitle: '' }));

            await projectService.createDepartment(projectId, {
                title: newDepartmentTitle.trim(),
                description: newDepartmentDescription.trim()
            });

            setNewDepartmentTitle('');
            setNewDepartmentDescription('');
            setShowAddDepartment(false);
            await loadDepartments();
        } catch (error: any) {
            console.error('Ошибка создания отдела:', error);
            const errorMessage = error.data?.title?.[0] || error.data?.detail || error.message || 'Ошибка при создании отдела';
            setErrors(prev => ({ ...prev, departmentCreate: errorMessage }));
        } finally {
            setAddingDepartment(false);
        }
    };

    // Удаление отдела
    const handleDeleteDepartment = async (departmentId: number) => {
        const department = departments.find(d => d.id === departmentId);
        if (!department) return;

        if (!confirm(`Вы уверены, что хотите удалить отдел "${department.title}"?`)) {
            return;
        }

        try {
            setErrors(prev => ({ ...prev, deleteDepartment: '' }));
            await projectService.deleteDepartment(projectId, departmentId);
            await loadDepartments();
        } catch (error: any) {
            console.error('Ошибка удаления отдела:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при удалении отдела';
            setErrors(prev => ({ ...prev, deleteDepartment: errorMessage }));
        }
    };

    if (loading) {
        return (
            <div className={styles.section}>
                <p>Загрузка...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Отделы */}
            <div className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className={styles.sectionTitle}>Отделы</h2>
                    <button
                        className={styles.primaryButton}
                        onClick={() => setShowAddDepartment(true)}
                    >
                        + Добавить отдел
                    </button>
                </div>

                {/* Форма создания отдела */}
                {showAddDepartment && (
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        padding: '20px',
                        borderRadius: '14px',
                        marginBottom: '20px',
                        border: '1px solid #E0E0E0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ fontSize: '18px', color: '#353536', margin: 0 }}>Добавление отдела</h3>
                            <button
                                onClick={() => {
                                    setShowAddDepartment(false);
                                    setNewDepartmentTitle('');
                                    setNewDepartmentDescription('');
                                    setErrors(prev => ({ ...prev, departmentTitle: '', departmentCreate: '' }));
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    color: '#7C7C7C',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.formGroup}>
                            <Input
                                placeholder="Название отдела*"
                                value={newDepartmentTitle}
                                onChange={(e) => setNewDepartmentTitle(e.target.value)}
                                hasError={!!errors.departmentTitle}
                            />
                            {errors.departmentTitle && <ErrorField message={errors.departmentTitle} />}
                        </div>

                        <div className={styles.formGroup}>
                            <textarea
                                className={styles.textarea}
                                placeholder="Описание отдела"
                                value={newDepartmentDescription}
                                onChange={(e) => setNewDepartmentDescription(e.target.value)}
                            />
                        </div>

                        {errors.departmentCreate && <ErrorField message={errors.departmentCreate} />}

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className={styles.primaryButton}
                                onClick={handleCreateDepartment}
                                disabled={addingDepartment}
                            >
                                {addingDepartment ? 'Создание...' : 'Добавить отдел'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Список отделов */}
                {departments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {departments.map(department => (
                            <div key={department.id} style={{
                                backgroundColor: '#F6F7F8',
                                borderRadius: '14px',
                                overflow: 'hidden'
                            }}>
                                {/* Заголовок отдела */}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '20px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => toggleDepartment(department.id!)}
                                >
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: '500', color: '#353536' }}>
                                            {department.title} ({department.members?.length || 0})
                                        </div>
                                        {department.description && (
                                            <div style={{ fontSize: '14px', color: '#7C7C7C', marginTop: '4px' }}>
                                                {department.description}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditDepartment(department);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '16px',
                                                cursor: 'pointer',
                                                padding: '5px'
                                            }}
                                            title="Редактировать отдел"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteDepartment(department.id!);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '16px',
                                                color: '#FF4444',
                                                cursor: 'pointer',
                                                padding: '5px'
                                            }}
                                            title="Удалить отдел"
                                        >
                                            🗑️
                                        </button>
                                        <span style={{
                                            transform: expandedDepartments.has(department.id!) ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease',
                                            fontSize: '14px'
                                        }}>
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                {/* Форма редактирования отдела */}
                                {editingDepartment === department.id && (
                                    <div style={{
                                        padding: '20px',
                                        backgroundColor: '#FFFFFF',
                                        borderTop: '1px solid #E0E0E0'
                                    }}>
                                        <div className={styles.formGroup}>
                                            <Input
                                                placeholder="Название отдела*"
                                                value={editDepartmentTitle}
                                                onChange={(e) => setEditDepartmentTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <textarea
                                                className={styles.textarea}
                                                placeholder="Описание отдела"
                                                value={editDepartmentDescription}
                                                onChange={(e) => setEditDepartmentDescription(e.target.value)}
                                            />
                                        </div>
                                        {errors.editDepartment && <ErrorField message={errors.editDepartment} />}
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={styles.secondaryButton}
                                                onClick={cancelEditDepartment}
                                            >
                                                Отменить
                                            </button>
                                            <button
                                                className={styles.primaryButton}
                                                onClick={() => saveEditDepartment(department.id!)}
                                            >
                                                Сохранить
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Раскрытое содержимое отдела */}
                                {expandedDepartments.has(department.id!) && editingDepartment !== department.id && (
                                    <div style={{
                                        padding: '20px',
                                        backgroundColor: '#FFFFFF',
                                        borderTop: '1px solid #E0E0E0'
                                    }}>
                                        {department.members && department.members.length > 0 ? (
                                            <div>
                                                <h4 style={{ fontSize: '16px', color: '#353536', marginBottom: '15px' }}>
                                                    Участники отдела:
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {department.members.map(member => (
                                                        <div key={member.user.id} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '10px',
                                                            backgroundColor: '#F6F7F8',
                                                            borderRadius: '8px'
                                                        }}>
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                backgroundColor: '#FFDD2D',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                marginRight: '12px',
                                                                fontSize: '16px',
                                                                fontWeight: '500'
                                                            }}>
                                                                {member.user.first_name.charAt(0)}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '16px', fontWeight: '500', color: '#353536' }}>
                                                                    {member.user.first_name} {member.user.last_name}
                                                                </div>
                                                                <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                                                    {member.user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{ color: '#7C7C7C', textAlign: 'center', margin: '20px 0' }}>
                                                В отделе пока нет участников
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🏢</div>
                        <h3>Пока нет отделов</h3>
                        <p>Создайте первый отдел для организации участников проекта</p>
                    </div>
                )}

                {errors.departments && <ErrorField message={errors.departments} />}
                {errors.deleteDepartment && <ErrorField message={errors.deleteDepartment} />}
            </div>

            {/* Все участники */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Все участники ({members.length})</h2>

                <p className={styles.sectionDescription}>
                    Начните вводить имя, фамилию или email нужного человека:
                </p>

                {/* Поиск участников */}
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Input
                        placeholder="🔍 Поиск"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                    />

                    {/* Результаты поиска */}
                    {memberSearch.length > 2 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: '#FFFFFF',
                            borderRadius: '14px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            marginTop: '8px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            zIndex: 10
                        }}>
                            {isSearching ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#7C7C7C' }}>
                                    Поиск...
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <div
                                        key={user.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '12px 20px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onClick={() => handleInviteMember(user)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F6F7F8'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#FFDD2D',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            fontSize: '18px',
                                            fontWeight: '500'
                                        }}>
                                            {user.first_name.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '16px', fontWeight: '500', color: '#353536' }}>
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#7C7C7C' }}>
                                    Ничего не найдено 😔
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {errors.invite && <ErrorField message={errors.invite} />}

                {/* Список участников */}
                {members.length > 0 ? (
                    <div className={styles.itemsList}>
                        {members.map(member => (
                            <div key={member.user.id} className={styles.itemCard}>
                                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundColor: '#FFDD2D',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '15px',
                                        fontSize: '20px',
                                        fontWeight: '500'
                                    }}>
                                        {member.user.first_name.charAt(0)}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemTitle}>
                                            {member.user.first_name} {member.user.last_name}
                                        </div>
                                        <div className={styles.itemDescription}>
                                            {member.user.email}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#7C7C7C', marginTop: '4px' }}>
                                            Присоединился: {new Date(member.date_joined).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.itemActions}>
                                    <button
                                        className={`${styles.iconButton} ${styles.deleteButton}`}
                                        onClick={() => handleRemoveMember(member.user.id)}
                                        title="Удалить участника"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>👥</div>
                        <h3>Пока нет участников</h3>
                        <p>Найдите и пригласите первых участников в проект</p>
                    </div>
                )}

                {errors.members && <ErrorField message={errors.members} />}
                {errors.removeMember && <ErrorField message={errors.removeMember} />}
            </div>
        </div>
    );
};

export default ProjectMembers;