import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/ProjectManagement.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import {
    projectService,
    ProjectMember,
    Department,
    UserSearchResult
} from '../../hooks/CreateProjectService.tsx';
import { authService } from '../../hooks/AuthService.tsx';
import API_CONFIG from '../../utils/Urls.ts';

interface ProjectMembersProps {
    projectId: number;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId }) => {
    const navigate = useNavigate();

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

    // Состояния для поиска участников (только внутри проекта)
    const [memberSearch, setMemberSearch] = useState('');
    const [filteredMembers, setFilteredMembers] = useState<ProjectMember[]>([]);

    // Состояния для добавления участников (поиск всех пользователей для приглашения)
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteSearch, setInviteSearch] = useState('');
    const [inviteSearchResults, setInviteSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearchingForInvite, setIsSearchingForInvite] = useState(false);

    // Состояния для создания отдела
    const [showAddDepartment, setShowAddDepartment] = useState(false);
    const [newDepartmentTitle, setNewDepartmentTitle] = useState('');
    const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
    const [addingDepartment, setAddingDepartment] = useState(false);

    // Состояния для управления участниками отделов
    const [showAddMemberToDepartment, setShowAddMemberToDepartment] = useState<number | null>(null);
    const [departmentMemberSearch, setDepartmentMemberSearch] = useState('');

    // Функция безопасной фильтрации участников отдела
    const getSafeMembers = (members?: ProjectMember[]): ProjectMember[] => {
        if (!members || !Array.isArray(members)) {
            return [];
        }

        return members.filter(member =>
            member &&
            member.user &&
            member.user.id &&
            member.user.first_name &&
            member.user.last_name
        );
    };

    // Error boundary для рендеринга участников отдела
    const renderDepartmentMembers = (department: Department) => {
        try {
            const safeMembers = getSafeMembers(department.members);

            if (safeMembers.length === 0) {
                return (
                    <p style={{ color: '#7C7C7C', textAlign: 'center', margin: '20px 0' }}>
                        В отделе пока нет участников
                    </p>
                );
            }

            return (
                <div className={styles.departmentMembers}>
                    {safeMembers.map(member => (
                        <div key={member.user.id} className={styles.departmentMember}>
                            <div className={styles.departmentMemberAvatar}>
                                {member.user.first_name?.charAt(0) || '?'}
                            </div>
                            <div className={styles.departmentMemberInfo}>
                                <div className={styles.departmentMemberName}>
                                    {member.user.first_name || 'Без имени'} {member.user.last_name || ''}
                                </div>
                                <div className={styles.departmentMemberEmail}>
                                    {member.user.email || 'Нет email'}
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemoveMemberFromDepartment(department.id!, member.user.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#FF4444',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    padding: '5px'
                                }}
                                title="Удалить из отдела"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            );
        } catch (error) {
            console.error('Ошибка рендеринга участников отдела:', error);
            return (
                <p style={{ color: '#FF4444', textAlign: 'center', margin: '20px 0' }}>
                    Ошибка загрузки участников отдела
                </p>
            );
        }
    };

    // Загрузка данных при монтировании
    useEffect(() => {
        loadMembers();
        loadDepartments();
    }, [projectId]);

    // Фильтрация участников при изменении поискового запроса
    useEffect(() => {
        if (memberSearch.trim()) {
            const filtered = members.filter(member =>
                member.user.first_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                member.user.last_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                member.user.email.toLowerCase().includes(memberSearch.toLowerCase())
            );
            setFilteredMembers(filtered);
        } else {
            setFilteredMembers(members);
        }
    }, [memberSearch, members]);

    // Поиск пользователей для приглашения (глобальный поиск)
    useEffect(() => {
        const searchUsers = async () => {
            if (inviteSearch.length > 2) {
                setIsSearchingForInvite(true);
                try {
                    const response = await projectService.searchUsers(inviteSearch, 1, 10);
                    // Исключаем уже добавленных участников
                    const memberIds = members.map(m => m.user.id);
                    const availableUsers = response.users.filter(user => !memberIds.includes(user.id));
                    setInviteSearchResults(availableUsers);
                } catch (error) {
                    console.error('Ошибка поиска пользователей:', error);
                    setInviteSearchResults([]);
                } finally {
                    setIsSearchingForInvite(false);
                }
            } else {
                setInviteSearchResults([]);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [inviteSearch, members]);

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

    // Загрузка отделов
    const loadDepartments = async () => {
        try {
            setErrors(prev => ({ ...prev, departments: '' }));

            const baseUrl = API_CONFIG.FULL_URL.DEPARTMENTS.BASE_URL(projectId);
            const urlWithParams = `${baseUrl}?members=true`;

            const response = await fetch(urlWithParams, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (response.ok) {
                const data = await response.json();
                const rawDepartments = data.departments || [];

                // Очищаем данные от некорректных участников
                const cleanDepartments = rawDepartments.map((dept: Department) => ({
                    ...dept,
                    members: getSafeMembers(dept.members)
                }));

                setDepartments(cleanDepartments);
            } else {
                console.warn('Не удалось загрузить отделы с участниками, загружаем без участников');
                const departmentsData = await projectService.getProjectDepartments(projectId);
                setDepartments(departmentsData.map((dept: Department) => ({
                    ...dept,
                    members: []
                })));
            }
        } catch (error: any) {
            console.error('Ошибка загрузки отделов:', error);
            setErrors(prev => ({ ...prev, departments: error.message || 'Ошибка загрузки отделов' }));

            // Fallback при ошибке - загружаем отделы без участников
            try {
                const departmentsData = await projectService.getProjectDepartments(projectId);
                setDepartments(departmentsData.map((dept: Department) => ({
                    ...dept,
                    members: []
                })));
            } catch (fallbackError) {
                console.error('Fallback тоже не сработал:', fallbackError);
            }
        }
    };

    // Переключение раскрытия отдела
    const toggleDepartment = (departmentId: number) => {
        setExpandedDepartments(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(departmentId)) {
                newExpanded.delete(departmentId);
            } else {
                newExpanded.add(departmentId);
            }
            return newExpanded;
        });
    };

    // Переход на страницу управления ролями пользователя
    const handleManageUserRoles = (userId: number) => {
        navigate(`/projects/${projectId}/roles/${userId}`);
    };

    // Приглашение участника
    const handleInviteMember = async (user: UserSearchResult) => {
        try {
            setErrors(prev => ({ ...prev, invite: '' }));
            await projectService.createInvitation(projectId, user.id);
            setInviteSearch('');
            setInviteSearchResults([]);
            setShowInviteModal(false);
            alert(`Приглашение отправлено пользователю ${user.first_name} ${user.last_name}`);
        } catch (error: any) {
            console.error('Ошибка отправки приглашения:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при отправке приглашения';
            setErrors(prev => ({ ...prev, invite: errorMessage }));
        }
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
            await loadDepartments();
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

    // Добавление участника в отдел
    const handleAddMemberToDepartment = async (departmentId: number, userId: number) => {
        try {
            setErrors(prev => ({ ...prev, addMemberToDepartment: '' }));
            await projectService.assignDepartmentToMember(projectId, userId, departmentId);
            await loadDepartments();
            setShowAddMemberToDepartment(null);
            setDepartmentMemberSearch('');
        } catch (error: any) {
            console.error('Ошибка добавления участника в отдел:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при добавлении участника в отдел';
            setErrors(prev => ({ ...prev, addMemberToDepartment: errorMessage }));
        }
    };

    // Удаление участника из отдела
    const handleRemoveMemberFromDepartment = async (departmentId: number, userId: number) => {
        const department = departments.find(d => d.id === departmentId);
        const safeMembers = getSafeMembers(department?.members);
        const member = safeMembers.find(m => m.user.id === userId);

        if (!member || !department) return;

        if (!confirm(`Вы уверены, что хотите удалить ${member.user.first_name} ${member.user.last_name} из отдела "${department.title}"?`)) {
            return;
        }

        try {
            setErrors(prev => ({ ...prev, removeMemberFromDepartment: '' }));

            const response = await fetch(API_CONFIG.FULL_URL.MEMBERS.REMOVE_DEPARTMENT(projectId, userId, departmentId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении участника из отдела');
            }

            await loadDepartments();
        } catch (error: any) {
            console.error('Ошибка удаления участника из отдела:', error);
            const errorMessage = error.message || 'Ошибка при удалении участника из отдела';
            setErrors(prev => ({ ...prev, removeMemberFromDepartment: errorMessage }));
        }
    };

    // Безопасное получение доступных участников для отдела
    const getAvailableMembersForDepartment = (departmentId: number) => {
        const department = departments.find(d => d.id === departmentId);
        if (!department) return members;

        const safeMembers = getSafeMembers(department.members);
        const departmentMemberIds = safeMembers.map(m => m.user.id);

        return members.filter(member =>
            member?.user?.id &&
            !departmentMemberIds.includes(member.user.id)
        );
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
                        Добавить отдел
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontFamily: '"Helvetica Neue", sans-serif' }}>
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
                                style={{width: '1050px'}}
                            />
                            {errors.departmentTitle && <ErrorField message={errors.departmentTitle} />}
                        </div>

                        <div className={styles.formGroup}>
                            <textarea
                                className={styles.textarea}
                                placeholder="Описание отдела"
                                value={newDepartmentDescription}
                                onChange={(e) => setNewDepartmentDescription(e.target.value)}
                                style={{width: '1050px', fontFamily: '"Helvetica Neue", sans-serif', fontSize: '21px'}}
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
                            <div key={department.id} className={styles.departmentCard}>
                                {/* Заголовок отдела */}
                                <div className={styles.departmentHeader}>
                                    <div
                                        onClick={() => toggleDepartment(department.id!)}
                                        style={{ flex: 1, cursor: 'pointer' }}
                                    >
                                        <div className={styles.departmentTitle}>
                                            {/* Подсчет участников */}
                                            {department.title} ({getSafeMembers(department.members).length})
                                        </div>
                                        {department.description && (
                                            <div className={styles.departmentDescription}>
                                                {department.description}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.departmentActions}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditDepartment(department);
                                            }}
                                            className={styles.departmentEditButton}
                                            title="Редактировать отдел"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteDepartment(department.id!);
                                            }}
                                            className={styles.departmentDeleteButton}
                                            title="Удалить отдел"
                                        >
                                            🗑️
                                        </button>
                                        <span
                                            className={`${styles.departmentExpandIcon} ${expandedDepartments.has(department.id!) ? styles.departmentExpandIconRotated : ''}`}
                                            onClick={() => toggleDepartment(department.id!)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                {/* Форма редактирования отдела */}
                                {editingDepartment === department.id && (
                                    <div className={styles.departmentContent}>
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
                                    <div className={styles.departmentContent}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <h4 style={{ fontSize: '16px', color: '#353536', margin: 0, fontFamily: '"Helvetica Neue", sans-serif' }}>
                                                Участники отдела:
                                            </h4>
                                            <button
                                                onClick={() => setShowAddMemberToDepartment(department.id!)}
                                                style={{
                                                    backgroundColor: '#FFDD2D',
                                                    color: '#353536',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '6px 12px',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}
                                            >
                                                + Добавить участника
                                            </button>
                                        </div>

                                        {/* Рендеринг участников */}
                                        {renderDepartmentMembers(department)}

                                        {/* Модальное окно для добавления участника в отдел */}
                                        {showAddMemberToDepartment === department.id && (
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
                                                    maxWidth: '500px',
                                                    width: '90%',
                                                    maxHeight: '70vh',
                                                    overflowY: 'auto'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                        <h3 style={{ fontSize: '20px', color: '#353536', margin: 0 }}>
                                                            Добавить участника в отдел "{department.title}"
                                                        </h3>
                                                        <button
                                                            onClick={() => {
                                                                setShowAddMemberToDepartment(null);
                                                                setDepartmentMemberSearch('');
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

                                                    <div style={{ marginBottom: '20px' }}>
                                                        <Input
                                                            placeholder="🔍 Поиск участников"
                                                            value={departmentMemberSearch}
                                                            onChange={(e) => setDepartmentMemberSearch(e.target.value)}
                                                            style={{width: '455px'}}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        {getAvailableMembersForDepartment(department.id!)
                                                            .filter(member =>
                                                                member.user.first_name.toLowerCase().includes(departmentMemberSearch.toLowerCase()) ||
                                                                member.user.last_name.toLowerCase().includes(departmentMemberSearch.toLowerCase()) ||
                                                                member.user.email.toLowerCase().includes(departmentMemberSearch.toLowerCase())
                                                            )
                                                            .map(member => (
                                                                <div
                                                                    key={member.user.id}
                                                                    onClick={() => handleAddMemberToDepartment(department.id!, member.user.id)}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        padding: '12px',
                                                                        backgroundColor: '#F6F7F8',
                                                                        borderRadius: '12px',
                                                                        cursor: 'pointer',
                                                                        transition: 'background-color 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFDD2D'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F6F7F8'}
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
                                                                        fontSize: '16px',
                                                                        fontWeight: '500'
                                                                    }}>
                                                                        {member.user.first_name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#353536' }}>
                                                                            {member.user.first_name} {member.user.last_name}
                                                                        </div>
                                                                        <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                                                            {member.user.email}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                        {getAvailableMembersForDepartment(department.id!).length === 0 && (
                                                            <p style={{ textAlign: 'center', color: '#7C7C7C', margin: '20px 0' }}>
                                                                Все участники проекта уже добавлены в этот отдел
                                                            </p>
                                                        )}
                                                    </div>

                                                    {errors.addMemberToDepartment && (
                                                        <ErrorField message={errors.addMemberToDepartment} />
                                                    )}
                                                </div>
                                            </div>
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
                {errors.addMemberToDepartment && <ErrorField message={errors.addMemberToDepartment} />}
                {errors.removeMemberFromDepartment && <ErrorField message={errors.removeMemberFromDepartment} />}
            </div>

            {/* Все участники */}
            <div className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className={styles.sectionTitle}>Все участники ({members.length})</h2>
                    <button
                        className={styles.primaryButton}
                        onClick={() => setShowInviteModal(true)}
                    >
                        Пригласить участника
                    </button>
                </div>

                <p className={styles.sectionDescription}>
                    Поиск среди участников проекта:
                </p>

                {/* Поиск среди участников проекта */}
                <div style={{ marginBottom: '20px' }}>
                    <Input
                        placeholder="🔍 Поиск участников проекта"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        style={{width: '1093px'}}
                    />
                </div>

                {/* Список участников */}
                {filteredMembers.length > 0 ? (
                    <div className={styles.itemsList}>
                        {filteredMembers.map(member => (
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
                                        className={styles.primaryButton}
                                        onClick={() => handleManageUserRoles(member.user.id)}
                                        style={{ marginRight: '10px', padding: '8px 12px', fontSize: '14px' }}
                                    >
                                        Роли
                                    </button>
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
                        <h3>
                            {members.length === 0 ? 'Пока нет участников' : 'Ничего не найдено'}
                        </h3>
                        <p>
                            {members.length === 0
                                ? 'Пригласите первых участников в проект'
                                : 'Попробуйте изменить поисковый запрос'
                            }
                        </p>
                    </div>
                )}

                {errors.members && <ErrorField message={errors.members} />}
                {errors.removeMember && <ErrorField message={errors.removeMember} />}
            </div>

            {/* Модальное окно приглашения участника */}
            {showInviteModal && (
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
                            <h3 style={{ fontSize: '24px', color: '#353536', margin: 0 }}>Пригласить участника</h3>
                            <button
                                onClick={() => {
                                    setShowInviteModal(false);
                                    setInviteSearch('');
                                    setInviteSearchResults([]);
                                    setErrors(prev => ({ ...prev, invite: '' }));
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

                        <p style={{ fontSize: '16px', color: '#7C7C7C', marginBottom: '20px' }}>
                            Начните вводить имя, фамилию или email нужного человека:
                        </p>

                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <Input
                                placeholder="🔍 Поиск пользователей для приглашения"
                                value={inviteSearch}
                                onChange={(e) => setInviteSearch(e.target.value)}
                            />

                            {/* Результаты поиска для приглашения */}
                            {inviteSearch.length > 2 && (
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
                                    {isSearchingForInvite ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#7C7C7C' }}>
                                            Поиск...
                                        </div>
                                    ) : inviteSearchResults.length > 0 ? (
                                        inviteSearchResults.map(user => (
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectMembers;