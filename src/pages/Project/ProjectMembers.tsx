import React, { useState, useEffect } from 'react';
import styles from '../../../styles/ProjectManagement.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import {
    projectService,
    ProjectMember,
    Department,
    UserSearchResult
} from '../../hooks/CreateProjectService.tsx';

interface ProjectMembersProps {
    projectId: number;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId }) => {
    // Состояния для участников и отделов
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

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

    // Поиск пользователей
    useEffect(() => {
        const searchUsers = async () => {
            if (memberSearch.length > 2) {
                setIsSearching(true);
                try {
                    const response = await projectService.searchUsers(memberSearch, 1, 10);
                    // Фильтруем уже добавленных участников
                    const filteredResults = response.users.filter(user =>
                        !members.find(member => member.user.id === user.id)
                    );
                    setSearchResults(filteredResults);
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
    }, [memberSearch, members]);

    // Загрузка участников
    const loadMembers = async () => {
        try {
            setLoading(true);
            const membersData = await projectService.getProjectMembers(projectId);
            setMembers(membersData);
        } catch (error: any) {
            console.error('Ошибка загрузки участников:', error);
            setErrors(prev => ({ ...prev, members: 'Ошибка загрузки участников' }));
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
            setErrors(prev => ({ ...prev, departments: 'Ошибка загрузки отделов' }));
        }
    };

    // Приглашение участника
    const handleInviteMember = async (user: UserSearchResult) => {
        try {
            await projectService.createInvitation(projectId, user.id);
            setMemberSearch('');
            setSearchResults([]);
            // Показываем уведомление об отправленном приглашении
            alert(`Приглашение отправлено пользователю ${user.first_name} ${user.last_name}`);
        } catch (error: any) {
            console.error('Ошибка отправки приглашения:', error);
            alert('Ошибка при отправке приглашения');
        }
    };

    // Удаление участника
    const handleRemoveMember = async (userId: number) => {
        if (!confirm('Вы уверены, что хотите удалить этого участника из проекта?')) {
            return;
        }

        try {
            await projectService.removeProjectMember(projectId, userId);
            await loadMembers(); // Перезагружаем список
        } catch (error: any) {
            console.error('Ошибка удаления участника:', error);
            alert('Ошибка при удалении участника');
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
            setErrors({});

            await projectService.createDepartment(projectId, {
                title: newDepartmentTitle.trim(),
                description: newDepartmentDescription.trim()
            });

            // Сбрасываем форму и перезагружаем отделы
            setNewDepartmentTitle('');
            setNewDepartmentDescription('');
            setShowAddDepartment(false);
            await loadDepartments();
        } catch (error: any) {
            console.error('Ошибка создания отдела:', error);
            setErrors({ departmentCreate: 'Ошибка при создании отдела' });
        } finally {
            setAddingDepartment(false);
        }
    };

    // Удаление отдела
    const handleDeleteDepartment = async (departmentId: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот отдел?')) {
            return;
        }

        try {
            await projectService.deleteDepartment(projectId, departmentId);
            await loadDepartments(); // Перезагружаем список
        } catch (error: any) {
            console.error('Ошибка удаления отдела:', error);
            alert('Ошибка при удалении отдела');
        }
    };

    if (loading) {
        return <div>Загрузка...</div>;
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
                        backgroundColor: '#F6F7F8',
                        padding: '20px',
                        borderRadius: '14px',
                        marginBottom: '20px'
                    }}>
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

                        <div className={styles.actionButtons}>
                            <button
                                className={styles.secondaryButton}
                                onClick={() => {
                                    setShowAddDepartment(false);
                                    setNewDepartmentTitle('');
                                    setNewDepartmentDescription('');
                                    setErrors({});
                                }}
                                disabled={addingDepartment}
                            >
                                Отменить
                            </button>
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
                    <div className={styles.itemsList}>
                        {departments.map(department => (
                            <div key={department.id} className={styles.itemCard}>
                                <div className={styles.itemInfo}>
                                    <div className={styles.itemTitle}>{department.title}</div>
                                    {department.description && (
                                        <div className={styles.itemDescription}>
                                            {department.description}
                                        </div>
                                    )}
                                    {department.members && department.members.length > 0 && (
                                        <div style={{ marginTop: '10px', fontSize: '14px', color: '#7C7C7C' }}>
                                            Участников: {department.members.length}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.itemActions}>
                                    <button
                                        className={`${styles.iconButton} ${styles.deleteButton}`}
                                        onClick={() => handleDeleteDepartment(department.id!)}
                                        title="Удалить отдел"
                                    >
                                        🗑️
                                    </button>
                                </div>
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
            </div>

            {/* Участники */}
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
            </div>
        </div>
    );
};

export default ProjectMembers;