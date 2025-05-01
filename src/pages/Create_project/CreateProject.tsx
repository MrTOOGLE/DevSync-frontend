import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/styles.css";
import styles from '../../styles/CreateProject.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { Button } from '../../components/common/Button/Button.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import { Header } from "../../components/common/Header/Header.tsx";
import { Footer } from "../../components/common/Footer/Footer.tsx";
import { projectService, ProjectData} from '../../hooks/CreateProjectService.tsx';

// Типы для формы создания проекта
interface CreateProjectFormData {
    title: string;
    description: string;
    is_public: boolean;
}

// Типы для пользователя в поиске
interface UserSearchResult {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
}

// Типы для отдела с выбранными участниками
interface DepartmentWithSelectedMembers {
    id?: number;
    title: string;
    description: string;
    project?: number;
    date_created?: string;
    selectedMembers: UserSearchResult[];
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
    const [departments, setDepartments] = useState<DepartmentWithSelectedMembers[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    // Поиск пользователей
    const [memberSearch, setMemberSearch] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);

    // Состояния для полей отдела
    const [departmentTitle, setDepartmentTitle] = useState('');
    const [departmentDescription, setDepartmentDescription] = useState('');

    // Состояние для модального окна добавления участников в отдел
    const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

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

    // Поиск пользователей (заглушка для демонстрации)
    useEffect(() => {
        if (memberSearch.length > 2) {
            // Заглушка для поиска пользователей
            const mockUsers: UserSearchResult[] = [
                { id: 1, name: 'Александра Лапшакова', email: 'avk65@tbank.ru', avatar: null },
                { id: 2, name: 'Иван Петров', email: 'ipetrov@tbank.ru', avatar: null },
                { id: 3, name: 'Мария Смирнова', email: 'msmirnova@tbank.ru', avatar: null },
                { id: 4, name: 'Алексей Козлов', email: 'akozlov@tbank.ru', avatar: null }
            ];

            setSearchResults(mockUsers.filter(user =>
                user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                user.email.toLowerCase().includes(memberSearch.toLowerCase())
            ));
        } else {
            setSearchResults([]);
        }
    }, [memberSearch]);

    // Добавление участника в общий список
    const handleAddMember = (user: UserSearchResult) => {
        // Проверяем, не добавлен ли уже такой участник
        if (!members.find(m => m.id === user.id)) {
            setMembers([...members, user]);
        }

        setMemberSearch('');
        setSearchResults([]);
    };

    // Удаление участника из общего списка
    const handleRemoveMember = (userId: number) => {
        setMembers(members.filter(m => m.id !== userId));

        // Также удаляем участника из всех отделов
        setDepartments(departments.map(dept => ({
            ...dept,
            selectedMembers: dept.selectedMembers.filter(m => m.id !== userId)
        })));
    };

    // Добавление отдела
    const handleAddDepartment = () => {
        if (departmentTitle.trim()) {
            setDepartments([...departments, {
                title: departmentTitle,
                description: departmentDescription,
                selectedMembers: []
            }]);
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

    // Добавление участника в отдел
    const handleAddMemberToDepartment = (user: UserSearchResult, departmentIndex: number) => {
        // Проверяем, не добавлен ли пользователь уже в отдел
        if (!departments[departmentIndex].selectedMembers.find(m => m.id === user.id)) {
            const newDepartments = [...departments];
            newDepartments[departmentIndex].selectedMembers.push(user);
            setDepartments(newDepartments);
        }
    };

    // Удаление участника из отдела
    const handleRemoveMemberFromDepartment = (userId: number, departmentIndex: number) => {
        const newDepartments = [...departments];
        newDepartments[departmentIndex].selectedMembers =
            newDepartments[departmentIndex].selectedMembers.filter(m => m.id !== userId);
        setDepartments(newDepartments);
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

            // После успешного создания проекта добавляем отделы
            for (const department of departments) {
                try {
                    const createdDepartment = await projectService.createDepartment(createdProject.id!, {
                        title: department.title,
                        description: department.description
                    });

                    // Добавляем участников в отдел
                    for (const member of department.selectedMembers) {
                        try {
                            // Сначала создаем приглашение, если пользователь еще не приглашен
                            await projectService.createInvitation(createdProject.id!, member.id);

                            // Затем добавляем в отдел
                            if (createdDepartment.id) {
                                await projectService.assignUserToDepartment(
                                    createdProject.id!,
                                    member.id,
                                    createdDepartment.id
                                );
                            }
                        } catch (error) {
                            console.error(`Ошибка при добавлении участника ${member.id} в отдел:`, error);
                            // Продолжаем, не останавливаясь при ошибке
                        }
                    }
                } catch (error) {
                    console.error(`Ошибка при создании отдела ${department.title}:`, error);
                    // Продолжаем, не останавливаясь при ошибке
                }
            }

            // Приглашаем участников, которые не в отделах
            const membersInDepartments = new Set(
                departments.flatMap(dept => dept.selectedMembers.map(m => m.id))
            );

            for (const member of members) {
                if (!membersInDepartments.has(member.id)) {
                    try {
                        await projectService.createInvitation(createdProject.id!, member.id);
                    } catch (error) {
                        console.error(`Ошибка при приглашении участника ${member.id}:`, error);
                        // Продолжаем, не останавливаясь при ошибке
                    }
                }
            }

            // Перенаправляем на страницу проекта
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
                                    {searchResults.length > 0 ? (
                                        searchResults.map(user => (
                                            <div
                                                key={user.id}
                                                className={styles.searchResultItem}
                                                onClick={() => handleAddMember(user)}
                                            >
                                                <div className={styles.userAvatar}>
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} />
                                                    ) : (
                                                        <div className={styles.defaultAvatar}>
                                                            {user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.userInfo}>
                                                    <div className={styles.userName}>{user.name}</div>
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
                                                <img src={member.avatar} alt={member.name} />
                                            ) : (
                                                <div className={styles.defaultAvatar}>
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.memberInfo}>
                                            <div className={styles.memberName}>{member.name}</div>
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
                        <div className={styles.departmentForm}>
                            <div className={styles.formGroup}>
                                <Input
                                    placeholder="Название отдела*"
                                    value={departmentTitle}
                                    onChange={(e) => setDepartmentTitle(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <textarea
                                    placeholder="Описание отдела"
                                    value={departmentDescription}
                                    onChange={(e) => setDepartmentDescription(e.target.value)}
                                    className={styles.textarea}
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
                        </div>

                        {/* Список добавленных отделов */}
                        {departments.length > 0 && (
                            <div className={styles.departmentsList}>
                                <h3>Добавленные отделы:</h3>
                                {departments.map((department, index) => (
                                    <div key={index} className={styles.departmentItem}>
                                        <div className={styles.departmentContent}>
                                            <h4 className={styles.departmentTitle}>{department.title}</h4>
                                            {department.description && (
                                                <p className={styles.departmentDescription}>{department.description}</p>
                                            )}

                                            {/* Секция для отображения участников отдела */}
                                            {department.selectedMembers.length > 0 && (
                                                <div className={styles.departmentMembers}>
                                                    <h5>Участники отдела:</h5>
                                                    <div className={styles.membersList}>
                                                        {department.selectedMembers.map(member => (
                                                            <div key={member.id} className={styles.memberItem}>
                                                                <div className={styles.memberAvatar}>
                                                                    {member.avatar ? (
                                                                        <img src={member.avatar} alt={member.name} />
                                                                    ) : (
                                                                        <div className={styles.defaultAvatar}>
                                                                            {member.name.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className={styles.memberInfo}>
                                                                    <div className={styles.memberName}>{member.name}</div>
                                                                    <div className={styles.memberEmail}>{member.email}</div>
                                                                </div>
                                                                <button
                                                                    className={styles.removeButton}
                                                                    onClick={() => handleRemoveMemberFromDepartment(member.id, index)}
                                                                    aria-label="Удалить участника из отдела"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Кнопка для добавления участников в отдел */}
                                            <button
                                                className={styles.addToDepartmentButton}
                                                onClick={() => setSelectedDepartment(index)}
                                            >
                                                Добавить участников в отдел
                                            </button>
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

            {/* Модальное окно для добавления участников в отдел */}
            {selectedDepartment !== null && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Добавление участников в отдел "{departments[selectedDepartment].title}"</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setSelectedDepartment(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.availableMembers}>
                                <h4>Доступные участники:</h4>
                                {members.filter(member =>
                                    !departments[selectedDepartment].selectedMembers.some(m => m.id === member.id)
                                ).length > 0 ? (
                                    members.filter(member =>
                                        !departments[selectedDepartment].selectedMembers.some(m => m.id === member.id)
                                    ).map(member => (
                                        <div key={member.id} className={styles.memberItem}>
                                            <div className={styles.memberAvatar}>
                                                {member.avatar ? (
                                                    <img src={member.avatar} alt={member.name} />
                                                ) : (
                                                    <div className={styles.defaultAvatar}>
                                                        {member.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.memberInfo}>
                                                <div className={styles.memberName}>{member.name}</div>
                                                <div className={styles.memberEmail}>{member.email}</div>
                                            </div>
                                            <button
                                                className={styles.addButton}
                                                onClick={() => handleAddMemberToDepartment(member, selectedDepartment)}
                                                aria-label="Добавить участника в отдел"
                                            >
                                                +
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noAvailableMembers}>
                                        {members.length === 0
                                            ? "Сначала добавьте участников в проект"
                                            : "Все участники уже добавлены в этот отдел"}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button onClick={() => setSelectedDepartment(null)}>
                                Закрыть
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateProjectPage;