import React, { useState, useEffect } from 'react';
import styles from '../../styles/ProjectManagement.module.css';
import rolesStyles from '../../styles/ProjectRoles.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import { projectService, Role } from '../../hooks/CreateProjectService.tsx';

interface ProjectRolesProps {
    projectId: number;
}

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

// @ts-ignore
interface RoleWithPermissions extends Role {
    permissions?: RolePermission[];
}

const ProjectRoles: React.FC<ProjectRolesProps> = ({ projectId }) => {
    // Состояния для ролей
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingPermissions, setSavingPermissions] = useState(false);
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

    // Загрузка ролей при монтировании
    useEffect(() => {
        loadRoles();
    }, [projectId]);

    // Загрузка ролей
    const loadRoles = async () => {
        try {
            setLoading(true);
            setErrors(prev => ({ ...prev, roles: '' }));
            const rolesData = await projectService.getProjectRoles(projectId, true);
            setRoles(rolesData);

            // Выбираем первую роль по умолчанию
            if (rolesData.length > 0 && !selectedRole) {
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

    // Загрузка прав роли
    const loadRolePermissions = async (roleId: number) => {
        try {
            setErrors(prev => ({ ...prev, permissions: '' }));

            const response = await fetch(`http://localhost:80/api/v1/projects/${projectId}/roles/${roleId}/permissions/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRolePermissions(data.permissions || []);
            } else {
                throw new Error('Ошибка загрузки прав роли');
            }
        } catch (error: any) {
            console.error('Ошибка загрузки прав роли:', error);
            setErrors(prev => ({ ...prev, permissions: error.message || 'Ошибка загрузки прав роли' }));
        }
    };

    // Выбор роли
    const handleSelectRole = async (role: Role) => {
        setSelectedRole(role);
        await loadRolePermissions(role.id!);
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

            const response = await fetch(`http://localhost:80/api/v1/projects/${projectId}/roles/${selectedRole.id}/permissions/batch/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(permissionsData)
            });

            if (response.ok) {
                alert('Права роли успешно обновлены');
            } else {
                throw new Error('Ошибка сохранения прав роли');
            }
        } catch (error: any) {
            console.error('Ошибка сохранения прав роли:', error);
            setErrors(prev => ({ ...prev, savePermissions: error.message || 'Ошибка сохранения прав роли' }));
        } finally {
            setSavingPermissions(false);
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

            const createdRole = await projectService.createRole(projectId, {
                name: newRoleName.trim(),
                color: newRoleColor,
                rank: roles.length + 1
            });

            setRoles(prev => [...prev, createdRole]);
            setNewRoleName('');
            setNewRoleColor('#00BCD4');
            setShowCreateRole(false);

            // Выбираем созданную роль
            setSelectedRole(createdRole);
            await loadRolePermissions(createdRole.id!);
        } catch (error: any) {
            console.error('Ошибка создания роли:', error);
            const errorMessage = error.data?.name?.[0] || error.data?.detail || error.message || 'Ошибка при создании роли';
            setErrors(prev => ({ ...prev, createRole: errorMessage }));
        } finally {
            setCreating(false);
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
            await projectService.deleteRole(projectId, selectedRole.id!);

            const updatedRoles = roles.filter(r => r.id !== selectedRole.id);
            setRoles(updatedRoles);

            // Выбираем первую доступную роль
            if (updatedRoles.length > 0) {
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
            const updatedRole = await projectService.updateRole(projectId, selectedRole.id!, {
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
            <div className={styles.section}>
                <p>Загрузка ролей...</p>
            </div>
        );
    }

    return (
        <div className={rolesStyles.rolesContainer}>
            {/* Заголовок */}
            <div className={rolesStyles.rolesHeader}>
                <h1>Роли</h1>
                <p>Создавай роли, назначай им разные права и меняй внешний вид ролей пользователей для гибкой настройки совместной работы в проекте</p>
            </div>

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
                                    {(role as any).members_count || 0} 👤
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
                                                        ✗
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
    );
};

export default ProjectRoles;