import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/styles.css";
import styles from '../../styles/CreateProject.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { Button } from '../../components/common/Button/Button.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import { Header } from "../../components/common/Header/Header.tsx";
import { Footer } from "../../components/common/Footer/Footer.tsx";
import { projectService, ProjectData, Department, UserSearchResult } from '../../hooks/CreateProjectService.tsx';

// Типы для формы создания проекта
interface CreateProjectFormData {
    title: string;
    description: string;
    is_public: boolean;
}

// Интерфейс для отдела с назначенными участниками
interface DepartmentWithMembers extends Department {
    assignedMembers: UserSearchResult[];
}

// Типы для ошибок формы
interface FormErrors {
    title?: string;
    description?: string;
    members?: string;
    departments?: string;
    server?: string;
}

const CreateProjectPage: React.FC = () => {
    const navigate = useNavigate();

    // Состояние формы
    const [formData, setFormData] = useState<CreateProjectFormData>({
        title: '',
        description: '',
        is_public: true // По умолчанию публичный проект
    });

    // Списки участников и отделов
    const [members, setMembers] = useState<UserSearchResult[]>([]);
    const [departments, setDepartments] = useState<DepartmentWithMembers[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    // Поиск пользователей
    const [memberSearch, setMemberSearch] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Состояния для полей отдела
    const [departmentTitle, setDepartmentTitle] = useState('');
    const [departmentDescription, setDepartmentDescription] = useState('');

    // Состояния для добавления участников в отделы
    const [showAddMemberModal, setShowAddMemberModal] = useState<number | null>(null); // ID отдела для которого показываем модалку

    // Обработчик изменения полей формы
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Обработчик изменения типа приватности проекта
    const handlePrivacyChange = (isPublic: boolean) => {
        setFormData({
            ...formData,
            is_public: isPublic
        });
    };

    // Поиск пользователей через API
    useEffect(() => {
        const searchUsers = async () => {
            if (memberSearch.length > 2) {
                setIsSearching(true);
                try {
                    const response = await projectService.searchUsers(memberSearch, 1, 10);
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

    // Добавление участника в список
    const handleAddMember = (user: UserSearchResult) => {
        // Проверяем, не добавлен ли уже такой участник
        if (!members.find(m => m.id === user.id)) {
            setMembers([...members, user]);
        }

        setMemberSearch('');
        setSearchResults([]);
    };

    // Удаление участника из списка
    const handleRemoveMember = (userId: number) => {
        setMembers(members.filter(m => m.id !== userId));
    };

    // Добавление отдела
    const handleAddDepartment = () => {
        if (departmentTitle.trim()) {
            const newDepartment: DepartmentWithMembers = {
                title: departmentTitle,
                description: departmentDescription,
                assignedMembers: []
            };
            setDepartments([...departments, newDepartment]);
            setDepartmentTitle('');
            setDepartmentDescription('');
        }
    };

    // Удаление отдела
    const handleRemoveDepartment = (index: number) => {
        const newDepartments = [...departments];
        newDepartments.splice(index, 1);
        setDepartments(newDepartments);
    };

    // Показать модалку добавления участника в отдел
    const handleShowAddMemberModal = (departmentIndex: number) => {
        setShowAddMemberModal(departmentIndex);
    };

    // Скрыть модалку
    const handleHideAddMemberModal = () => {
        setShowAddMemberModal(null);
    };

    // Добавление участника в отдел из списка найденных
    const handleAddMemberToDepartment = (departmentIndex: number, user: UserSearchResult) => {
        const updatedDepartments = [...departments];

        // Проверяем, не добавлен ли уже такой участник в отдел
        if (!updatedDepartments[departmentIndex].assignedMembers.find(m => m.id === user.id)) {
            updatedDepartments[departmentIndex].assignedMembers.push(user);
            setDepartments(updatedDepartments);
        }

        // Закрываем модалку
        setShowAddMemberModal(null);
    };

    // Удаление участника из отдела
    const handleRemoveMemberFromDepartment = (departmentIndex: number, userId: number) => {
        const updatedDepartments = [...departments];
        updatedDepartments[departmentIndex].assignedMembers =
            updatedDepartments[departmentIndex].assignedMembers.filter(m => m.id !== userId);
        setDepartments(updatedDepartments);
    };

    // Валидация формы
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Поле обязательное';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Отправка формы на сервер
    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);

            // Создаем проект
            const createdProject: ProjectData = await projectService.createProject({
                title: formData.title,
                description: formData.description,
                is_public: formData.is_public
            });

            // После успешного создания проекта, добавляем отделы
            for (const department of departments) {
                await projectService.createDepartment(createdProject.id!, {
                    title: department.title,
                    description: department.description
                });
            }

            // Приглашаем участников
            for (const member of members) {
                await projectService.createInvitation(createdProject.id!, member.id);
            }

            // Перенаправляем пользователя на страницу проекта
            navigate(`/projects/${createdProject.id}`);
        } catch (error: any) {
            console.error('Ошибка при создании проекта:', error);

            if (error.data) {
                const newErrors: FormErrors = {};

                if (error.data.title) {
                    newErrors.title = error.data.title[0];
                }

                if (error.data.description) {
                    newErrors.description = error.data.description[0];
                }

                setErrors(newErrors);
            } else {
                setErrors({ server: error.message || 'Произошла ошибка при создании проекта' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="main-container">
            <Header />
            <div className="main-content">
                <div className={styles.createProjectContainer}>
                    <h1>Добавление сведений о проекте</h1>
                    <p className={styles.subtitle}>
                        Объедините усилия команды для достижения общих целей! Здесь вы можете создать новый групповой проект, определить его цели и пригласить участников для совместной работы.
                    </p>
                    <p className={styles.required}>Обязательные поля помечены звездочкой *</p>

                    {/* Основная информация о проекте */}
                    <div className={styles.formGroup}>
                        <Input
                            name="title"
                            placeholder="Название проекта*"
                            value={formData.title}
                            onChange={handleInputChange}
                            hasError={!!errors.title}
                            className={styles.input}
                        />
                        {errors.title && <ErrorField message={errors.title} />}
                    </div>

                    <div className={styles.formGroup}>
                        <textarea
                            name="description"
                            placeholder="Описание проекта (необязательно, но желательно)"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={styles.textarea}
                        />
                    </div>

                    {/* Блок добавления участников */}
                    <div className={styles.sectionContainer}>
                        <h2>Добавление участника</h2>
                        <p>Начни вводить имя, фамилию или email нужного человека, выбери из списка:</p>

                        <div className={styles.searchContainer}>
                            <div className={styles.searchInputWrapper}>
                                <span className={styles.searchIcon}>🔍</span>
                                <input
                                    type="text"
                                    placeholder="Поиск"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>

                            {/* Результаты поиска */}
                            {memberSearch.length > 2 && (
                                <div className={styles.searchResults}>
                                    {isSearching ? (
                                        <div className={styles.noResults}>Поиск...</div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map(user => (
                                            <div
                                                key={user.id}
                                                className={styles.searchResultItem}
                                                onClick={() => handleAddMember(user)}
                                            >
                                                <div className={styles.userAvatar}>
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                                                    ) : (
                                                        <div className={styles.defaultAvatar}>
                                                            {user.first_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.userInfo}>
                                                    <div className={styles.userName}>{user.first_name} {user.last_name}</div>
                                                    <div className={styles.userEmail}>{user.email}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.noResults}>Ничего не найдено 😔</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Список добавленных участников */}
                        {members.length > 0 && (
                            <div className={styles.membersList}>
                                <h3>Добавленные участники:</h3>
                                {members.map(member => (
                                    <div key={member.id} className={styles.memberItem}>
                                        <div className={styles.memberAvatar}>
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={`${member.first_name} ${member.last_name}`} />
                                            ) : (
                                                <div className={styles.defaultAvatar}>
                                                    {member.first_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.memberInfo}>
                                            <div className={styles.memberName}>{member.first_name} {member.last_name}</div>
                                            <div className={styles.memberEmail}>{member.email}</div>
                                        </div>
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveMember(member.id)}
                                            aria-label="Удалить участника"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Блок добавления отделов */}
                    <div className={styles.sectionContainer}>
                        <h2>Добавление отделов</h2>
                        <p>
                            Разделите участников на отделы для удобной организации работы. Это поможет управлять задачами,
                            назначать ответственных и фильтровать предложения по командам.
                        </p>
                        <p>
                            Необязательно указывать всё сразу — вы всегда сможете создать, изменить или удалить отделы после
                            запуска проекта в настройках.
                        </p>

                        {/* Форма добавления отдела */}
                            <div className={styles.formGroup}>
                                <Input
                                    placeholder="Название отдела*"
                                    value={departmentTitle}
                                    onChange={(e) => setDepartmentTitle(e.target.value)}
                                    className={styles.inputForDepartment}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <textarea
                                    placeholder="Описание отдела"
                                    value={departmentDescription}
                                    onChange={(e) => setDepartmentDescription(e.target.value)}
                                    className={styles.textareaForDepartment}
                                />
                            </div>
                            <div className={styles.addDepartmentButton}>
                                <Button
                                    onClick={handleAddDepartment}
                                    disabled={!departmentTitle.trim()}
                                >
                                    Добавить отдел
                                </Button>
                            </div>

                        {/* Список добавленных отделов */}
                        {departments.length > 0 && (
                            <div className={styles.departmentsList}>
                                <h3>Добавленные отделы:</h3>
                                {departments.map((department, index) => (
                                    <div key={index} className={styles.departmentItem}>
                                        <div className={styles.departmentContent}>
                                            <div className={styles.departmentHeader}>
                                                <h4 className={styles.departmentTitle}>{department.title}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => handleShowAddMemberModal(index)}
                                                    className={styles.addMemberButton}
                                                    title="Добавить участника в отдел"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {department.description && (
                                                <p className={styles.departmentDescription}>{department.description}</p>
                                            )}

                                            {/* Список участников отдела */}
                                            {department.assignedMembers.length > 0 && (
                                                <div className={styles.membersList}>
                                                    <h5>Участники отдела:</h5>
                                                    {department.assignedMembers.map(member => (
                                                        <div key={member.id} className={styles.memberItem}>
                                                            <div className={styles.memberAvatar}>
                                                                {member.avatar ? (
                                                                    <img src={member.avatar} alt={`${member.first_name} ${member.last_name}`} />
                                                                ) : (
                                                                    <div className={styles.defaultAvatar}>
                                                                        {member.first_name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className={styles.memberInfo}>
                                                                <div className={styles.memberName}>{member.first_name} {member.last_name}</div>
                                                                <div className={styles.memberEmail}>{member.email}</div>
                                                            </div>
                                                            <button
                                                                className={styles.removeButton}
                                                                onClick={() => handleRemoveMemberFromDepartment(index, member.id)}
                                                                aria-label="Удалить участника из отдела"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveDepartment(index)}
                                            aria-label="Удалить отдел"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Модальное окно для добавления участника в отдел */}
                        {showAddMemberModal !== null && (
                            <div className={styles.modalOverlay} onClick={handleHideAddMemberModal}>
                                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                                    <div className={styles.modalHeader}>
                                        <h3>Добавить участника в отдел</h3>
                                        <button onClick={handleHideAddMemberModal} className={styles.modalClose}>
                                            ✕
                                        </button>
                                    </div>
                                    <div className={styles.modalContent}>
                                        {members.length > 0 ? (
                                            <div className={styles.membersList}>
                                                {members
                                                    .filter(member =>
                                                        !departments[showAddMemberModal]?.assignedMembers.find(m => m.id === member.id)
                                                    )
                                                    .map(member => (
                                                        <div
                                                            key={member.id}
                                                            className={styles.selectableMemberItem}
                                                            onClick={() => handleAddMemberToDepartment(showAddMemberModal, member)}
                                                        >
                                                            <div className={styles.memberAvatar}>
                                                                {member.avatar ? (
                                                                    <img src={member.avatar} alt={`${member.first_name} ${member.last_name}`} />
                                                                ) : (
                                                                    <div className={styles.defaultAvatar}>
                                                                        {member.first_name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className={styles.memberInfo}>
                                                                <div className={styles.memberName}>{member.first_name} {member.last_name}</div>
                                                                <div className={styles.memberEmail}>{member.email}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {members.filter(member =>
                                                    !departments[showAddMemberModal]?.assignedMembers.find(m => m.id === member.id)
                                                ).length === 0 && (
                                                    <p className={styles.noMembers}>Все участники уже добавлены в этот отдел</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className={styles.noMembers}>
                                                Сначала добавьте участников в проект через поиск выше
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Настройки приватности */}
                    <div className={styles.sectionContainer}>
                        <h2>Настройки приватности</h2>
                        <p>
                            Выберите, кто сможет видеть и участвовать в этом проекте. Вы всегда можете изменить уровень
                            приватности проекта позже в настройках.
                        </p>

                        <div className={styles.privacyOptions}>
                            <div
                                className={`${styles.privacyOption} ${formData.is_public ? styles.selected : ''}`}
                                onClick={() => handlePrivacyChange(true)}
                            >
                                <div className={styles.privacyIcon}>🌍</div>
                                <div className={styles.privacyContent}>
                                    <h3>Публичный проект</h3>
                                    <p>
                                        Проект доступен всем пользователям для просмотра и предложений, что удобно для открытых
                                        инициатив и кросс-командной работы.
                                    </p>
                                </div>
                                <div className={styles.privacyRadio}>
                                    <div className={`${styles.radioCircle} ${formData.is_public ? styles.radioChecked : ''}`}></div>
                                </div>
                            </div>

                            <div
                                className={`${styles.privacyOption} ${!formData.is_public ? styles.selected : ''}`}
                                onClick={() => handlePrivacyChange(false)}
                            >
                                <div className={styles.privacyIcon}>🔒</div>
                                <div className={styles.privacyContent}>
                                    <h3>Приватный проект</h3>
                                    <p>
                                        Проект доступен только приглашённым участникам, что обеспечивает конфиденциальность и
                                        подходит для внутренних или ограниченных инициатив.
                                    </p>
                                </div>
                                <div className={styles.privacyRadio}>
                                    <div className={`${styles.radioCircle} ${!formData.is_public ? styles.radioChecked : ''}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Отображение ошибок сервера */}
                    {errors.server && (
                        <div className={styles.serverError}>
                            <ErrorField message={errors.server} />
                        </div>
                    )}

                    {/* Кнопка отправки формы */}
                    <div className={styles.submitContainer}>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Создание...' : 'Создать проект'}
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CreateProjectPage;