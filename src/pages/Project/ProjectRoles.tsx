import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../../styles/styles.css";
import styles from '../../styles/ProjectManagement.module.css';
import rolesStyles from '../../styles/ProjectRoles.module.css';
import { Header } from "../../components/common/Header/Header.tsx";
import { Footer } from "../../components/common/Footer/Footer.tsx";
import { Input } from '../../components/common/Input/Input.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import { projectService, Role, ProjectMember } from '../../hooks/CreateProjectService.tsx';

interface Permission {
    codename: string;
    name: string;
    category: string;
    description: string;
}

interface RolePermission {
    permission: Permission;
    value: boolean | null;
}

interface RoleWithMembers extends Role {
    members_count?: number;
}

const ProjectRolesPage: React.FC = () => {
    const { projectId, userId } = useParams<{ projectId: string; userId?: string }>();
    const navigate = useNavigate();

    // Основные состояния
    const [project, setProject] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<ProjectMember | null>(null);
    const [roles, setRoles] = useState<RoleWithMembers[]>([]);
    const [selectedRole, setSelectedRole] = useState<RoleWithMembers | null>(null);
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
    const [userRoles, setUserRoles] = useState<Role[]>([]);

    // Состояния загрузки
    const [loading, setLoading] = useState(true);
    const [savingPermissions, setSavingPermissions] = useState(false);
    const [assigningRole, setAssigningRole] = useState(false);
    const [removingRole, setRemovingRole] = useState(false);

    // Ошибки
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Создание роли
    const [showCreateRole, setShowCreateRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleColor, setNewRoleColor] = useState('#00BCD4');
    const [creating, setCreating] = useState(false);

    // Поиск
    const [searchQuery, setSearchQuery] = useState('');

    // Доступные цвета для ролей
    const roleColors = [
        '#00BCD4', '#FF5722', '#E91E63', '#4CAF50', '#2196F3', '#FF9800',
        '#9C27B0', '#795548', '#607D8B', '#F44336', '#3F51B5', '#FFEB3B',
        '#FFC107', '#FF5722', '#CDDC39', '#009688', '#673AB7', '#8BC34A'
    ];

    // Определяем режим работы
    const isUserManagement = !!userId;

    // Загрузка данных при монтировании
    useEffect(() => {
        if (projectId) {
            loadProject();
            loadRoles();
            if (userId) {
                loadSelectedUser();
                loadUserRoles();
            }
        } else {
            navigate('/');
        }
    }, [projectId, userId, navigate]);

    // Загрузка проекта
    const loadProject = async () => {
        try {
            const projectData = await projectService.getProject(parseInt(projectId!));
            setProject(projectData);
        } catch (error: any) {
            console.error('Ошибка загрузки проекта:', error);
            setErrors(prev => ({ ...prev, project: error.message || 'Ошибка загрузки проекта' }));
        }
    };

    // Загрузка информации о выбранном пользователе
    const loadSelectedUser = async () => {
        try {
            const members = await projectService.getProjectMembers(parseInt(projectId!));
            const user = members.find(m => m.user.id === parseInt(userId!));
            setSelectedUser(user || null);
        } catch (error: any) {
            console.error('Ошибка загрузки пользователя:', error);
        }
    };

    // Загрузка ролей
    const loadRoles = async () => {
        try {
            setLoading(true);
            setErrors(prev => ({ ...prev, roles: '' }));
            const rolesData = await projectService.getProjectRoles(parseInt(projectId!), true);
            setRoles(rolesData);

            // Выбираем первую роль по умолчанию для режима управления ролями
            if (rolesData.length > 0 && !selectedRole && !isUserManagement) {
                setSelectedRole(rolesData[0]);
                await loadRolePermissions(rolesData[0].id!);
            }
        } catch (error: any) {
            console.error('Ошибка загрузки ролей:', error);
            setErrors(prev => ({ ...prev, roles: error.message || 'Ошибка загрузки ролей' }));
        } finally {
            setLoading(false);
        }
    };

    // ИСПРАВЛЕНИЕ: Загрузка ролей пользователя через правильный API endpoint
    const loadUserRoles = async () => {
        if (!userId) return;

        try {
            const userRolesData = await projectService.getMemberRoles(parseInt(projectId!), parseInt(userId));
            setUserRoles(userRolesData);
        } catch (error: any) {
            console.error('Ошибка загрузки ролей пользователя:', error);
            setErrors(prev => ({ ...prev, userRoles: error.message || 'Ошибка загрузки ролей пользователя' }));
        }
    };

    // Загрузка прав роли
    const loadRolePermissions = async (roleId: number) => {
        try {
            setErrors(prev => ({ ...prev, permissions: '' }));

            const response = await projectService.getRolePermissions(parseInt(projectId!), roleId);
            setRolePermissions(response.permissions || []);
        } catch (error: any) {
            console.error('Ошибка загрузки прав роли:', error);
            setErrors(prev => ({ ...prev, permissions: error.message || 'Ошибка загрузки прав роли' }));
        }
    };

    // Выбор роли
    const handleSelectRole = async (role: RoleWithMembers) => {
        setSelectedRole(role);
        if (!isUserManagement) {
            await loadRolePermissions(role.id!);
        }
    };

    // ИСПРАВЛЕНИЕ: Назначение роли пользователю через правильный сервис
    const handleAssignRole = async (roleId: number) => {
        if (!userId) return;

        try {
            setAssigningRole(true);
            setErrors(prev => ({ ...prev, assignRole: '' }));

            await projectService.assignRoleToMember(parseInt(projectId!), parseInt(userId), roleId);
            await loadUserRoles();
        } catch (error: any) {
            console.error('Ошибка назначения роли:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка назначения роли';
            setErrors(prev => ({ ...prev, assignRole: errorMessage }));
        } finally {
            setAssigningRole(false);
        }
    };

    // ИСПРАВЛЕНИЕ: Удаление роли у пользователя через правильный сервис
    const handleRemoveRole = async (roleId: number) => {
        if (!userId) return;

        try {
            setRemovingRole(true);
            setErrors(prev => ({ ...prev, removeRole: '' }));

            await projectService.removeRoleFromMember(parseInt(projectId!), parseInt(userId), roleId);
            await loadUserRoles();
        } catch (error: any) {
            console.error('Ошибка удаления роли:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка удаления роли';
            setErrors(prev => ({ ...prev, removeRole: errorMessage }));
        } finally {
            setRemovingRole(false);
        }
    };

    // Создание роли
    const handleCreateRole = async () => {
        if (!newRoleName.trim()) {
            setErrors(prev => ({ ...prev, createRole: 'Название роли обязательно' }));
            return;
        }

        try {
            setCreating(true);
            setErrors(prev => ({ ...prev, createRole: '' }));

            const createdRole = await projectService.createRole(parseInt(projectId!), {
                name: newRoleName.trim(),
                color: newRoleColor,
                rank: roles.length + 1
            });

            setRoles(prev => [...prev, createdRole]);
            setNewRoleName('');
            setNewRoleColor('#00BCD4');
            setShowCreateRole(false);

            // Выбираем созданную роль
            if (!isUserManagement) {
                setSelectedRole(createdRole);
                await loadRolePermissions(createdRole.id!);
            }
        } catch (error: any) {
            console.error('Ошибка создания роли:', error);
            const errorMessage = error.data?.name?.[0] || error.data?.detail || error.message || 'Ошибка при создании роли';
            setErrors(prev => ({ ...prev, createRole: errorMessage }));
        } finally {
            setCreating(false);
        }
    };

    // Изменение права
    const handlePermissionChange = (permissionCodename: string, value: boolean | null) => {
        setRolePermissions(prev =>
            prev.map(rp =>
                rp.permission.codename === permissionCodename
                    ? { ...rp, value: value }
                    : rp
            )
        );
    };

    // Сохранение прав роли
    const handleSavePermissions = async () => {
        if (!selectedRole) return;

        try {
            setSavingPermissions(true);
            setErrors(prev => ({ ...prev, savePermissions: '' }));

            const permissionsData: {[key: string]: boolean | null} = {};
            rolePermissions.forEach(rp => {
                permissionsData[rp.permission.codename] = rp.value;
            });

            await projectService.updateRolePermissions(parseInt(projectId!), selectedRole.id!, permissionsData);
            alert('Права роли успешно обновлены');
        } catch (error: any) {
            console.error('Ошибка сохранения прав роли:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка сохранения прав роли';
            setErrors(prev => ({ ...prev, savePermissions: errorMessage }));
        } finally {
            setSavingPermissions(false);
        }
    };

    // Удаление роли
    const handleDeleteRole = async () => {
        if (!selectedRole) return;

        if (!confirm(`Вы уверены, что хотите удалить роль "${selectedRole.name}"?`)) {
            return;
        }

        try {
            setErrors(prev => ({ ...prev, deleteRole: '' }));
            await projectService.deleteRole(parseInt(projectId!), selectedRole.id!);

            const updatedRoles = roles.filter(r => r.id !== selectedRole.id);
            setRoles(updatedRoles);

            // Выбираем первую доступную роль
            if (updatedRoles.length > 0 && !isUserManagement) {
                setSelectedRole(updatedRoles[0]);
                await loadRolePermissions(updatedRoles[0].id!);
            } else {
                setSelectedRole(null);
                setRolePermissions([]);
            }
        } catch (error: any) {
            console.error('Ошибка удаления роли:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при удалении роли';
            setErrors(prev => ({ ...prev, deleteRole: errorMessage }));
        }
    };

    // Обновление роли
    const handleUpdateRole = async (field: string, value: string) => {
        if (!selectedRole) return;

        try {
            const updatedRole = await projectService.updateRole(parseInt(projectId!), selectedRole.id!, {
                [field]: value
            });

            setSelectedRole(updatedRole);
            setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
        } catch (error: any) {
            console.error('Ошибка обновления роли:', error);
        }
    };

    // Фильтрация ролей
    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ИСПРАВЛЕНИЕ: Получение доступных ролей для назначения (исключаем уже назначенные)
    const getAvailableRoles = () => {
        const userRoleIds = userRoles.map(role => role.id);
        return roles.filter(role => !userRoleIds.includes(role.id));
    };

    // Группировка прав по категориям
    const groupedPermissions = rolePermissions.reduce((groups, rp) => {
        const category = rp.permission.category;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(rp);
        return groups;
    }, {} as {[key: string]: RolePermission[]});

    // Получение названия категории на русском
    const getCategoryName = (category: string): string => {
        const categoryMap: {[key: string]: string} = {
            'Отделы': 'Отделы',
            'Роли': 'Роли',
            'Голосования': 'Голосования',
            'Задачи': 'Задачи',
            'Участники': 'Участники',
            'Проект': 'Управление проектом',
            'Комментарии': 'Комментарии'
        };
        return categoryMap[category] || category;
    };

    // Получение цвета категории
    const getCategoryColor = (category: string): string => {
        const colorMap: {[key: string]: string} = {
            'Отделы': '#FFDD2D',
            'Роли': '#E91E63',
            'Голосования': '#2196F3',
            'Задачи': '#4CAF50'
        };
        return colorMap[category] || '#FFDD2D';
    };

    if (loading) {
        return (
            <div className="main-container">
                <Header />
                <div className="main-content">
                    <div className={styles.loadingContainer}>
                        <h2>Загрузка ролей...</h2>
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
                    {/* Breadcrumbs */}
                    <div style={{ marginBottom: '20px', fontSize: '14px', color: '#7C7C7C' }}>
                        <span
                            onClick={() => navigate(`/projects/${projectId}`)}
                            style={{ cursor: 'pointer', color: '#126DF7' }}
                        >
                            {project?.title || 'Проект'}
                        </span>
                        <span style={{ margin: '0 8px' }}>→</span>
                        <span
                            onClick={() => navigate(`/projects/${projectId}`, { state: { activeTab: 'members' } })}
                            style={{ cursor: 'pointer', color: '#126DF7' }}
                        >
                            Участники
                        </span>
                        <span style={{ margin: '0 8px' }}>→</span>
                        <span>
                            {isUserManagement
                                ? `Роли пользователя ${selectedUser?.user.first_name} ${selectedUser?.user.last_name}`
                                : 'Управление ролями'
                            }
                        </span>
                    </div>

                    <div className={rolesStyles.rolesContainer}>
                        {/* Заголовок */}
                        <div className={rolesStyles.rolesHeader}>
                            <h1>
                                {isUserManagement
                                    ? `Роли пользователя ${selectedUser?.user.first_name} ${selectedUser?.user.last_name}`
                                    : 'Роли проекта'
                                }
                            </h1>
                            <p>
                                {isUserManagement
                                    ? 'Назначайте роли пользователю для управления его правами в проекте'
                                    : 'Создавай роли, назначай им разные права и меняй внешний вид ролей пользователей для гибкой настройки совместной работы в проекте'
                                }
                            </p>
                        </div>

                        {/* Режим управления ролями пользователя */}
                        {isUserManagement ? (
                            <div className={rolesStyles.userRoleManagement}>
                                {/* Текущие роли пользователя */}
                                <div className={rolesStyles.currentRoles}>
                                    <h3>Текущие роли:</h3>
                                    {userRoles.length > 0 ? (
                                        <div className={rolesStyles.rolesList}>
                                            {userRoles.map(role => (
                                                <div key={role.id} className={rolesStyles.roleItem}>
                                                    <div
                                                        className={rolesStyles.roleColor}
                                                        style={{ backgroundColor: role.color }}
                                                    ></div>
                                                    <span className={rolesStyles.roleName}>{role.name}</span>
                                                    <button
                                                        onClick={() => handleRemoveRole(role.id!)}
                                                        disabled={removingRole}
                                                        className={rolesStyles.removeRoleButton}
                                                        title="Удалить роль"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>У участника пока нет ролей</p>
                                    )}
                                </div>

                                {/* Доступные роли для назначения */}
                                <div className={rolesStyles.availableRoles}>
                                    <h3>Назначить роль:</h3>
                                    <div className={rolesStyles.rolesList}>
                                        {getAvailableRoles().map(role => (
                                            <div key={role.id} className={rolesStyles.roleItem}>
                                                <div
                                                    className={rolesStyles.roleColor}
                                                    style={{ backgroundColor: role.color }}
                                                ></div>
                                                <span className={rolesStyles.roleName}>{role.name}</span>
                                                <button
                                                    onClick={() => handleAssignRole(role.id!)}
                                                    disabled={assigningRole}
                                                    className={rolesStyles.assignRoleButton}
                                                >
                                                    + Назначить
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {getAvailableRoles().length === 0 && (
                                        <p>Все доступные роли уже назначены</p>
                                    )}
                                </div>

                                {/* Создание новой роли */}
                                <div className={rolesStyles.createNewRole}>
                                    <button
                                        onClick={() => setShowCreateRole(true)}
                                        className={rolesStyles.createRoleButton}
                                    >
                                        Создать новую роль
                                    </button>
                                </div>

                                {errors.assignRole && <ErrorField message={errors.assignRole} />}
                                {errors.removeRole && <ErrorField message={errors.removeRole} />}
                                {errors.userRoles && <ErrorField message={errors.userRoles} />}
                            </div>
                        ) : (
                            /* Режим полного управления ролями проекта */
                            <>
                                {/* Права по умолчанию */}
                                <div className={rolesStyles.defaultPermissionsCard}>
                                    <div className={rolesStyles.defaultPermissionsIcon}>👥</div>
                                    <div className={rolesStyles.defaultPermissionsContent}>
                                        <h3>Права по умолчанию</h3>
                                        <p><span className={rolesStyles.everyoneTag}>#everyone</span> распространяется на всех участников проекта по умолчанию</p>
                                    </div>
                                    <div className={rolesStyles.defaultPermissionsArrow}>→</div>
                                </div>

                                {/* Поиск и создание */}
                                <div className={rolesStyles.searchCreateContainer}>
                                    <div className={rolesStyles.searchContainer}>
                                        <Input
                                            placeholder="🔍 Поиск"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={rolesStyles.searchInput}
                                        />
                                    </div>
                                    <button
                                        className={rolesStyles.createButton}
                                        onClick={() => setShowCreateRole(true)}
                                    >
                                        Создать
                                    </button>
                                </div>

                                <p className={rolesStyles.roleOrderHint}>
                                    Для участников используется цвет их высшей роли. Перетащите роли, чтобы упорядочить их.
                                </p>

                                {/* Основной контент */}
                                <div className={rolesStyles.mainContent}>
                                    {/* Левая панель - список ролей */}
                                    <div className={rolesStyles.rolesList}>
                                        <h3>Роли - {roles.length}</h3>

                                        {filteredRoles.map(role => (
                                            <div
                                                key={role.id}
                                                className={`${rolesStyles.roleItem} ${selectedRole?.id === role.id ? rolesStyles.roleItemActive : ''}`}
                                                onClick={() => handleSelectRole(role)}
                                            >
                                                <div
                                                    className={rolesStyles.roleColor}
                                                    style={{ backgroundColor: role.color }}
                                                ></div>
                                                <div className={rolesStyles.roleInfo}>
                                                    <div className={rolesStyles.roleName}>{role.name}</div>
                                                    <div className={rolesStyles.roleMembersCount}>
                                                        {role.members_count || 0} 👤
                                                    </div>
                                                </div>
                                                <div className={rolesStyles.roleActions}>⋯</div>
                                            </div>
                                        ))}

                                        {filteredRoles.length === 0 && (
                                            <div className={rolesStyles.noRoles}>
                                                Роли не найдены
                                            </div>
                                        )}
                                    </div>

                                    {/* Правая панель - редактирование роли */}
                                    <div className={rolesStyles.roleEditor}>
                                        {selectedRole ? (
                                            <>
                                                <div className={rolesStyles.roleEditorHeader}>
                                                    <h2>Редактировать роль - {selectedRole.name}</h2>
                                                    <button
                                                        className={rolesStyles.advancedSettingsButton}
                                                        title="Обычные настройки"
                                                    >
                                                        ⚙️ Обычные настройки
                                                    </button>
                                                </div>

                                                <p className={rolesStyles.requiredFieldsNote}>
                                                    Обязательные поля помечены звездочкой *
                                                </p>

                                                {/* Название роли */}
                                                <div className={rolesStyles.fieldGroup}>
                                                    <Input
                                                        value={selectedRole.name}
                                                        onChange={(e) => handleUpdateRole('name', e.target.value)}
                                                        placeholder="Название роли*"
                                                        className={rolesStyles.roleNameInput}
                                                    />
                                                </div>

                                                {/* Цвет роли */}
                                                <div className={rolesStyles.fieldGroup}>
                                                    <label className={rolesStyles.fieldLabel}>Цвет роли*</label>
                                                    <div className={rolesStyles.colorPicker}>
                                                        {roleColors.map(color => (
                                                            <div
                                                                key={color}
                                                                className={`${rolesStyles.colorOption} ${selectedRole.color === color ? rolesStyles.colorOptionSelected : ''}`}
                                                                style={{ backgroundColor: color }}
                                                                onClick={() => handleUpdateRole('color', color)}
                                                            >
                                                                {selectedRole.color === color && <span className={rolesStyles.colorCheckmark}>✓</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Права доступа */}
                                                <div className={rolesStyles.permissionsSection}>
                                                    <h3>Права доступа</h3>

                                                    {Object.entries(groupedPermissions).map(([category, permissions]) => (
                                                        <div key={category} className={rolesStyles.permissionCategory}>
                                                            <div
                                                                className={rolesStyles.categoryHeader}
                                                                style={{ backgroundColor: getCategoryColor(category) }}
                                                            >
                                                                <h4>{getCategoryName(category)}</h4>
                                                            </div>

                                                            {permissions.map(rp => (
                                                                <div key={rp.permission.codename} className={rolesStyles.permissionItem}>
                                                                    <div className={rolesStyles.permissionInfo}>
                                                                        <div className={rolesStyles.permissionName}>
                                                                            {rp.permission.name}
                                                                        </div>
                                                                        <div className={rolesStyles.permissionDescription}>
                                                                            {rp.permission.description}
                                                                        </div>
                                                                    </div>
                                                                    <div className={rolesStyles.permissionControls}>
                                                                        <button
                                                                            className={`${rolesStyles.permissionButton} ${rp.value === true ? rolesStyles.permissionButtonActive : ''}`}
                                                                            onClick={() => handlePermissionChange(rp.permission.codename, true)}
                                                                        >
                                                                            ✓
                                                                        </button>
                                                                        <button
                                                                            className={`${rolesStyles.permissionButton} ${rp.value === false ? rolesStyles.permissionButtonActive : ''}`}
                                                                            onClick={() => handlePermissionChange(rp.permission.codename, false)}
                                                                        >
                                                                            ✗
                                                                        </button>
                                                                        <button
                                                                            className={`${rolesStyles.permissionButton} ${rp.value === null ? rolesStyles.permissionButtonActive : ''}`}
                                                                            onClick={() => handlePermissionChange(rp.permission.codename, null)}
                                                                        >
                                                                            ◐
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Кнопки действий */}
                                                <div className={rolesStyles.actionButtons}>
                                                    <button
                                                        className={rolesStyles.saveButton}
                                                        onClick={handleSavePermissions}
                                                        disabled={savingPermissions}
                                                    >
                                                        {savingPermissions ? 'Сохранение...' : 'Сохранить'}
                                                    </button>
                                                    <button
                                                        className={rolesStyles.deleteButton}
                                                        onClick={handleDeleteRole}
                                                    >
                                                        🗑️ Удалить роль
                                                    </button>
                                                </div>

                                                {errors.savePermissions && <ErrorField message={errors.savePermissions} />}
                                                {errors.deleteRole && <ErrorField message={errors.deleteRole} />}
                                            </>
                                        ) : (
                                            <div className={rolesStyles.noRoleSelected}>
                                                <h3>Выберите роль для редактирования</h3>
                                                <p>Выберите роль из списка слева или создайте новую роль</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Модальное окно создания роли */}
                        {showCreateRole && (
                            <div className={rolesStyles.modalOverlay}>
                                <div className={rolesStyles.modal}>
                                    <div className={rolesStyles.modalHeader}>
                                        <h3>Создать новую роль</h3>
                                        <button
                                            onClick={() => {
                                                setShowCreateRole(false);
                                                setNewRoleName('');
                                                setNewRoleColor('#00BCD4');
                                                setErrors(prev => ({ ...prev, createRole: '' }));
                                            }}
                                            className={rolesStyles.modalClose}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className={rolesStyles.modalContent}>
                                        <div className={rolesStyles.fieldGroup}>
                                            <Input
                                                placeholder="Название роли*"
                                                value={newRoleName}
                                                onChange={(e) => setNewRoleName(e.target.value)}
                                                hasError={!!errors.createRole}
                                                style={{width: '350px'}}
                                            />
                                            {errors.createRole && <ErrorField message={errors.createRole} />}
                                        </div>

                                        <div className={rolesStyles.fieldGroup}>
                                            <label className={rolesStyles.fieldLabel}>Цвет роли*</label>
                                            <div className={rolesStyles.colorPicker}>
                                                {roleColors.map(color => (
                                                    <div
                                                        key={color}
                                                        className={`${rolesStyles.colorOption} ${newRoleColor === color ? rolesStyles.colorOptionSelected : ''}`}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => setNewRoleColor(color)}
                                                    >
                                                        {newRoleColor === color && <span className={rolesStyles.colorCheckmark}>✓</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={rolesStyles.modalActions}>
                                        <button
                                            className={rolesStyles.secondaryButton}
                                            onClick={() => {
                                                setShowCreateRole(false);
                                                setNewRoleName('');
                                                setNewRoleColor('#00BCD4');
                                                setErrors(prev => ({ ...prev, createRole: '' }));
                                            }}
                                            disabled={creating}
                                        >
                                            Отменить
                                        </button>
                                        <button
                                            className={rolesStyles.primaryButton}
                                            onClick={handleCreateRole}
                                            disabled={creating}
                                        >
                                            {creating ? 'Создание...' : 'Создать роль'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {errors.roles && <ErrorField message={errors.roles} />}
                        {errors.permissions && <ErrorField message={errors.permissions} />}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProjectRolesPage;