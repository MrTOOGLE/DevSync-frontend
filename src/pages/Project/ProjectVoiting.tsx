import React, { useState, useEffect } from 'react';
import styles from '../../../styles/ProjectManagement.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';

// Типы для предложений и голосований
interface Suggestion {
    id: number;
    title: string;
    description: string;
    status: 'new' | 'under_review' | 'approved' | 'rejected';
    author: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        avatar: string | null;
    };
    votes_for: number;
    votes_against: number;
    user_vote?: 'for' | 'against' | null;
    created_at: string;
    deadline?: string;
    allow_multiple_votes: boolean;
}

interface SuggestionCreateData {
    title: string;
    description: string;
    deadline?: string;
    allow_multiple_votes: boolean;
}

interface ProjectVotingProps {
    projectId: number;
}

const ProjectVoting: React.FC<ProjectVotingProps> = ({ projectId }) => {
    // Состояния
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Фильтры
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Создание предложения
    const [showCreateSuggestion, setShowCreateSuggestion] = useState(false);
    const [newSuggestion, setNewSuggestion] = useState<SuggestionCreateData>({
        title: '',
        description: '',
        deadline: '',
        allow_multiple_votes: false
    });
    const [creating, setCreating] = useState(false);

    // Загрузка предложений при монтировании
    useEffect(() => {
        loadSuggestions();
    }, [projectId]);

    // Загрузка предложений
    const loadSuggestions = async () => {
        try {
            setLoading(true);

            // Моковые данные для демонстрации
            const mockSuggestions: Suggestion[] = [
                {
                    id: 15524,
                    title: 'Установка кофемашины на 3 этаже офиса',
                    description: 'Всех очень интересует момент, где же нам пить кофе всем вместе, если наша любимая кофейня закрылась. Мы придумали решение - поставить кофемашину прямо в офисе на 3 этаже в правом крыле. От нас требуется лишь показать, что это нам действительно нужно: голосуй "за", если хочешь и "против", если не хочешь. От нас будет нужно купить кофе и вкусняшки!',
                    status: 'new',
                    author: {
                        id: 1,
                        first_name: 'Александра',
                        last_name: 'Ланшакова',
                        email: 'avk465@tbank.ru',
                        avatar: null
                    },
                    votes_for: 122,
                    votes_against: 2,
                    user_vote: null,
                    created_at: '2025-02-15T13:23:00Z',
                    deadline: '2025-03-10T19:00:00Z',
                    allow_multiple_votes: false
                },
                {
                    id: 15525,
                    title: 'Добавление геймификации енотика-полоскуна в игру',
                    description: 'Предлагаю добавить нового персонажа - енотика-полоскуна для разнообразия игрового процесса',
                    status: 'under_review',
                    author: {
                        id: 2,
                        first_name: 'Никита',
                        last_name: 'Пупкин',
                        email: 'nikita@tbank.ru',
                        avatar: null
                    },
                    votes_for: 45,
                    votes_against: 12,
                    user_vote: 'for',
                    created_at: '2025-02-10T13:45:00Z',
                    allow_multiple_votes: true
                },
                {
                    id: 15526,
                    title: 'Переход с Python на Java',
                    description: 'Предлагаю перевести весь backend на Java для улучшения производительности',
                    status: 'rejected',
                    author: {
                        id: 3,
                        first_name: 'Владислав',
                        last_name: 'Дживаваспрингович',
                        email: 'vlad@tbank.ru',
                        avatar: null
                    },
                    votes_for: 8,
                    votes_against: 156,
                    user_vote: 'against',
                    created_at: '2025-01-11T16:45:00Z',
                    allow_multiple_votes: false
                }
            ];

            setSuggestions(mockSuggestions);
        } catch (error: any) {
            console.error('Ошибка загрузки предложений:', error);
            setErrors(prev => ({ ...prev, suggestions: 'Ошибка загрузки предложений' }));
        } finally {
            setLoading(false);
        }
    };

    // Создание предложения
    const handleCreateSuggestion = async () => {
        if (!newSuggestion.title.trim()) {
            setErrors(prev => ({ ...prev, suggestionTitle: 'Название предложения обязательно' }));
            return;
        }

        if (!newSuggestion.description.trim()) {
            setErrors(prev => ({ ...prev, suggestionDescription: 'Описание предложения обязательно' }));
            return;
        }

        try {
            setCreating(true);
            setErrors({});

            // Здесь должен быть запрос к API
            const mockNewSuggestion: Suggestion = {
                id: Date.now(),
                title: newSuggestion.title,
                description: newSuggestion.description,
                status: 'new',
                author: {
                    id: 1, // Текущий пользователь
                    first_name: 'Текущий',
                    last_name: 'Пользователь',
                    email: 'user@tbank.ru',
                    avatar: null
                },
                votes_for: 0,
                votes_against: 0,
                user_vote: null,
                created_at: new Date().toISOString(),
                deadline: newSuggestion.deadline || undefined,
                allow_multiple_votes: newSuggestion.allow_multiple_votes
            };

            setSuggestions(prev => [mockNewSuggestion, ...prev]);

            // Сброс формы
            setNewSuggestion({
                title: '',
                description: '',
                deadline: '',
                allow_multiple_votes: false
            });
            setShowCreateSuggestion(false);

        } catch (error: any) {
            console.error('Ошибка создания предложения:', error);
            setErrors({ suggestionCreate: 'Ошибка при создании предложения' });
        } finally {
            setCreating(false);
        }
    };

    // Голосование
    const handleVote = async (suggestionId: number, voteType: 'for' | 'against') => {
        try {
            // Здесь должен быть запрос к API
            setSuggestions(prev => prev.map(suggestion => {
                if (suggestion.id === suggestionId) {
                    let updatedSuggestion = { ...suggestion };

                    // Убираем предыдущий голос
                    if (suggestion.user_vote === 'for') {
                        updatedSuggestion.votes_for--;
                    } else if (suggestion.user_vote === 'against') {
                        updatedSuggestion.votes_against--;
                    }

                    // Добавляем новый голос
                    if (voteType === 'for') {
                        updatedSuggestion.votes_for++;
                    } else {
                        updatedSuggestion.votes_against++;
                    }

                    updatedSuggestion.user_vote = voteType;
                    return updatedSuggestion;
                }
                return suggestion;
            }));
        } catch (error: any) {
            console.error('Ошибка голосования:', error);
            alert('Ошибка при голосовании');
        }
    };

    // Фильтрация предложений
    const filteredSuggestions = suggestions.filter(suggestion => {
        const matchesStatus = statusFilter === 'all' || suggestion.status === statusFilter;
        const matchesSearch = suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            suggestion.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Получение названия статуса
    const getStatusName = (status: Suggestion['status']): string => {
        switch (status) {
            case 'new': return 'Новое';
            case 'under_review': return 'На рассмотрении';
            case 'approved': return 'Принято';
            case 'rejected': return 'Отклонено';
            default: return status;
        }
    };

    // Получение цвета статуса
    const getStatusColor = (status: Suggestion['status']): string => {
        switch (status) {
            case 'new': return '#FFDD2D';
            case 'under_review': return '#126DF7';
            case 'approved': return '#28A745';
            case 'rejected': return '#FF4444';
            default: return '#7C7C7C';
        }
    };

    // Форматирование даты
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div>Загрузка предложений...</div>;
    }

    return (
        <div>
            {/* Заголовок и кнопка создания */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className={styles.sectionTitle}>Голосования</h2>
                <button
                    className={styles.primaryButton}
                    onClick={() => setShowCreateSuggestion(true)}
                >
                    Создать
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
                    placeholder="🔍 Поиск"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1 }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', color: '#7C7C7C' }}>Фильтры</span>
                    <button style={{
                        backgroundColor: '#E0E0E0',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}>
                        ✕
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <span
                        style={{
                            padding: '5px 12px',
                            backgroundColor: '#FFDD2D',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}
                    >
                        Отдел разработки
                    </span>
                    <span
                        style={{
                            padding: '5px 12px',
                            backgroundColor: '#E0E0E0',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#7C7C7C'
                        }}
                    >
                        Отдел дизайна
                    </span>
                    <span
                        style={{
                            padding: '5px 12px',
                            backgroundColor: '#E0E0E0',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#7C7C7C'
                        }}
                    >
                        Отдел аналитики
                    </span>
                </div>
            </div>

            {/* Форма создания предложения */}
            {showCreateSuggestion && (
                <div style={{
                    backgroundColor: '#F6F7F8',
                    padding: '20px',
                    borderRadius: '14px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#353536' }}>
                        Предложение
                    </h3>

                    <div className={styles.formGroup}>
                        <Input
                            placeholder="Название предложения*"
                            value={newSuggestion.title}
                            onChange={(e) => setNewSuggestion(prev => ({ ...prev, title: e.target.value }))}
                            hasError={!!errors.suggestionTitle}
                        />
                        {errors.suggestionTitle && <ErrorField message={errors.suggestionTitle} />}
                    </div>

                    <div className={styles.formGroup}>
                        <textarea
                            className={styles.textarea}
                            placeholder="Описание предложения*"
                            value={newSuggestion.description}
                            onChange={(e) => setNewSuggestion(prev => ({ ...prev, description: e.target.value }))}
                            style={{ height: '100px' }}
                        />
                        {errors.suggestionDescription && <ErrorField message={errors.suggestionDescription} />}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <Input
                            type="datetime-local"
                            value={newSuggestion.deadline}
                            onChange={(e) => setNewSuggestion(prev => ({ ...prev, deadline: e.target.value }))}
                            placeholder="Дата и время окончания"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '16px', color: '#353536', marginBottom: '15px' }}>
                            Варианты ответов
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button style={{
                                    backgroundColor: '#FEE0E0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    color: '#FF2727'
                                }}>
                                    ✕
                                </button>
                                <Input placeholder="Ответ" style={{ flex: 1 }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button style={{
                                    backgroundColor: '#FEE0E0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    color: '#FF2727'
                                }}>
                                    ✕
                                </button>
                                <Input placeholder="Ответ" style={{ flex: 1 }} />
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', margin: '15px 0', color: '#7C7C7C', fontSize: '14px' }}>
                            Можно добавить ещё 8 ответов
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '16px', color: '#353536', marginBottom: '15px' }}>
                            Настройки
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={newSuggestion.allow_multiple_votes}
                                    onChange={(e) => setNewSuggestion(prev => ({ ...prev, allow_multiple_votes: e.target.checked }))}
                                />
                                <span style={{ fontFamily: 'Helvetica Neue', fontSize: '16px', color: '#353536' }}>
                                    Анонимное голосование
                                </span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={newSuggestion.allow_multiple_votes}
                                    onChange={(e) => setNewSuggestion(prev => ({ ...prev, allow_multiple_votes: e.target.checked }))}
                                />
                                <span style={{ fontFamily: 'Helvetica Neue', fontSize: '16px', color: '#353536' }}>
                                    Выбор нескольких вариантов ответа
                                </span>
                            </label>
                        </div>
                    </div>

                    {errors.suggestionCreate && <ErrorField message={errors.suggestionCreate} />}

                    <div className={styles.actionButtons}>
                        <button
                            className={styles.secondaryButton}
                            onClick={() => {
                                setShowCreateSuggestion(false);
                                setNewSuggestion({
                                    title: '',
                                    description: '',
                                    deadline: '',
                                    allow_multiple_votes: false
                                });
                                setErrors({});
                            }}
                            disabled={creating}
                        >
                            Отменить
                        </button>
                        <button
                            className={styles.primaryButton}
                            onClick={handleCreateSuggestion}
                            disabled={creating}
                        >
                            {creating ? 'Создание...' : 'Создать'}
                        </button>
                    </div>
                </div>
            )}

            {/* Список предложений */}
            {filteredSuggestions.length > 0 ? (
                <div className={styles.itemsList}>
                    {filteredSuggestions.map(suggestion => {
                        const totalVotes = suggestion.votes_for + suggestion.votes_against;
                        const forPercentage = totalVotes > 0 ? Math.round((suggestion.votes_for / totalVotes) * 100) : 0;
                        const againstPercentage = totalVotes > 0 ? Math.round((suggestion.votes_against / totalVotes) * 100) : 0;

                        return (
                            <div key={suggestion.id} style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '14px',
                                padding: '25px',
                                marginBottom: '20px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}>
                                {/* Заголовок и статус */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{
                                            fontSize: '20px',
                                            color: '#353536',
                                            margin: '0 0 8px 0',
                                            fontFamily: 'Helvetica Neue',
                                            fontWeight: '500'
                                        }}>
                                            #{suggestion.id} {suggestion.title}
                                        </h3>
                                        <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                            {formatDate(suggestion.created_at)} • {suggestion.author.first_name} {suggestion.author.last_name}
                                        </div>
                                    </div>
                                    <span style={{
                                        backgroundColor: getStatusColor(suggestion.status),
                                        color: suggestion.status === 'new' ? '#353536' : 'white',
                                        fontSize: '14px',
                                        padding: '6px 12px',
                                        borderRadius: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {getStatusName(suggestion.status)}
                                    </span>
                                </div>

                                {/* Описание */}
                                <p style={{
                                    fontSize: '16px',
                                    color: '#353536',
                                    lineHeight: '1.5',
                                    margin: '0 0 20px 0'
                                }}>
                                    {suggestion.description}
                                </p>

                                {/* Дедлайн */}
                                {suggestion.deadline && (
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#7C7C7C',
                                        marginBottom: '15px'
                                    }}>
                                        Открыто до: {formatDate(suggestion.deadline)}
                                    </div>
                                )}

                                {/* Результаты голосования */}
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px' }}>
                                        Голосование
                                    </div>

                                    {/* Голоса "За" */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '20px', marginRight: '10px' }}>⭕</span>
                                        <span style={{ fontSize: '16px', marginRight: '10px' }}>За</span>
                                        <div style={{
                                            flex: 1,
                                            height: '8px',
                                            backgroundColor: '#E0E0E0',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            marginRight: '10px'
                                        }}>
                                            <div style={{
                                                width: `${forPercentage}%`,
                                                height: '100%',
                                                backgroundColor: '#FFDD2D',
                                                borderRadius: '4px'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '16px', fontWeight: '500' }}>
                                            {forPercentage}%
                                        </span>
                                    </div>

                                    {/* Голоса "Против" */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '20px', marginRight: '10px' }}>🚫</span>
                                        <span style={{ fontSize: '16px', marginRight: '10px' }}>Против</span>
                                        <div style={{
                                            flex: 1,
                                            height: '8px',
                                            backgroundColor: '#E0E0E0',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            marginRight: '10px'
                                        }}>
                                            <div style={{
                                                width: `${againstPercentage}%`,
                                                height: '100%',
                                                backgroundColor: '#FF4444',
                                                borderRadius: '4px'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '16px', fontWeight: '500' }}>
                                            {againstPercentage}%
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                        Результаты голосования ({totalVotes} голосов)
                                    </div>
                                </div>

                                {/* Кнопки голосования */}
                                {suggestion.status === 'new' || suggestion.status === 'under_review' ? (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleVote(suggestion.id, 'for')}
                                            style={{
                                                backgroundColor: suggestion.user_vote === 'for' ? '#FFDD2D' : '#F6F7F8',
                                                color: '#353536',
                                                border: suggestion.user_vote === 'for' ? '2px solid #FFDD2D' : '2px solid transparent',
                                                borderRadius: '11px',
                                                padding: '10px 20px',
                                                cursor: 'pointer',
                                                fontFamily: 'Helvetica Neue',
                                                fontSize: '16px',
                                                fontWeight: suggestion.user_vote === 'for' ? '500' : '400',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            👍 За ({suggestion.votes_for})
                                        </button>
                                        <button
                                            onClick={() => handleVote(suggestion.id, 'against')}
                                            style={{
                                                backgroundColor: suggestion.user_vote === 'against' ? '#FF4444' : '#F6F7F8',
                                                color: suggestion.user_vote === 'against' ? 'white' : '#353536',
                                                border: suggestion.user_vote === 'against' ? '2px solid #FF4444' : '2px solid transparent',
                                                borderRadius: '11px',
                                                padding: '10px 20px',
                                                cursor: 'pointer',
                                                fontFamily: 'Helvetica Neue',
                                                fontSize: '16px',
                                                fontWeight: suggestion.user_vote === 'against' ? '500' : '400',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            👎 Против ({suggestion.votes_against})
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#7C7C7C',
                                        fontStyle: 'italic'
                                    }}>
                                        Голосование завершено
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🗳️</div>
                    <h3>
                        {suggestions.length === 0 ? 'Пока нет предложений' : 'Ничего не найдено'}
                    </h3>
                    <p>
                        {suggestions.length === 0
                            ? 'Создайте первое предложение для голосования'
                            : 'Попробуйте изменить фильтры или поисковый запрос'
                        }
                    </p>
                </div>
            )}

            {errors.suggestions && <ErrorField message={errors.suggestions} />}
        </div>
    );
};

export default ProjectVoting;