import React, { useState, useEffect } from 'react';
import styles from '../../styles/ProjectManagement.module.css';
import { Input } from '../../components/common/Input/Input.tsx';
import { ErrorField } from '../../components/common/ErrorField/ErrorField.tsx';
import {
    suggestionsService,
    Suggestion,
    SuggestionCreateData
} from '../../hooks/VoitingService.tsx';

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
            setErrors(prev => ({ ...prev, suggestions: '' }));

            const suggestionsData = await suggestionsService.getProjectSuggestions(projectId);
            setSuggestions(suggestionsData);
        } catch (error: any) {
            console.error('Ошибка загрузки предложений:', error);
            setErrors(prev => ({ ...prev, suggestions: error.message || 'Ошибка загрузки предложений' }));
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
            setErrors(prev => ({
                ...prev,
                suggestionCreate: '',
                suggestionTitle: '',
                suggestionDescription: ''
            }));

            const createdSuggestion = await suggestionsService.createSuggestion(projectId, newSuggestion);
            setSuggestions(prev => [createdSuggestion, ...prev]);

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
            const errorMessage = error.data?.title?.[0] || error.data?.detail || error.message || 'Ошибка при создании предложения';
            setErrors(prev => ({ ...prev, suggestionCreate: errorMessage }));
        } finally {
            setCreating(false);
        }
    };

    // Голосование
    const handleVote = async (suggestionId: number, voteType: 'for' | 'against') => {
        try {
            setErrors(prev => ({ ...prev, vote: '' }));

            await suggestionsService.voteForSuggestion(projectId, suggestionId, { vote_type: voteType });

            // Обновляем локальное состояние
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
            const errorMessage = error.data?.detail || error.message || 'Ошибка при голосовании';
            setErrors(prev => ({ ...prev, vote: errorMessage }));
        }
    };

    // Удаление предложения
    const handleDeleteSuggestion = async (suggestionId: number) => {
        const suggestion = suggestions.find(s => s.id === suggestionId);
        if (!suggestion) return;

        if (!confirm(`Вы уверены, что хотите удалить предложение "${suggestion.title}"?`)) {
            return;
        }

        try {
            setErrors(prev => ({ ...prev, deleteSuggestion: '' }));
            await suggestionsService.deleteSuggestion(projectId, suggestionId);
            setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        } catch (error: any) {
            console.error('Ошибка удаления предложения:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при удалении предложения';
            setErrors(prev => ({ ...prev, deleteSuggestion: errorMessage }));
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
        return (
            <div className={styles.section}>
                <p>Загрузка предложений...</p>
            </div>
        );
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
                    Создать предложение
                </button>
            </div>

            {/* Фильтры */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px',
                padding: '20px',
                backgroundColor: '#F6F7F8',
                borderRadius: '14px',
                alignItems: 'center'
            }}>
                <Input
                    placeholder="🔍 Поиск предложений"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1 }}
                />

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#7C7C7C', whiteSpace: 'nowrap' }}>Статус:</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { value: 'all', label: 'Все' },
                            { value: 'new', label: 'Новые' },
                            { value: 'under_review', label: 'На рассмотрении' },
                            { value: 'approved', label: 'Принятые' },
                            { value: 'rejected', label: 'Отклоненные' }
                        ].map(filter => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                style={{
                                    padding: '5px 12px',
                                    backgroundColor: statusFilter === filter.value ? '#FFDD2D' : '#E0E0E0',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: statusFilter === filter.value ? '500' : '400',
                                    color: statusFilter === filter.value ? '#353536' : '#7C7C7C',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
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
                        Новое предложение
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
                            style={{ height: '120px' }}
                        />
                        {errors.suggestionDescription && <ErrorField message={errors.suggestionDescription} />}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '14px', color: '#7C7C7C', marginBottom: '5px', display: 'block' }}>
                            Дедлайн (необязательно)
                        </label>
                        <Input
                            type="datetime-local"
                            value={newSuggestion.deadline}
                            onChange={(e) => setNewSuggestion(prev => ({ ...prev, deadline: e.target.value }))}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '16px', color: '#353536', marginBottom: '15px' }}>
                            Настройки
                        </h4>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={newSuggestion.allow_multiple_votes}
                                onChange={(e) => setNewSuggestion(prev => ({ ...prev, allow_multiple_votes: e.target.checked }))}
                                style={{ width: '16px', height: '16px' }}
                            />
                            <span style={{ fontFamily: 'Helvetica Neue', fontSize: '16px', color: '#353536' }}>
                                Разрешить множественный выбор вариантов ответа
                            </span>
                        </label>
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
                                setErrors(prev => ({
                                    ...prev,
                                    suggestionTitle: '',
                                    suggestionDescription: '',
                                    suggestionCreate: ''
                                }));
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
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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

                                        <button
                                            className={`${styles.iconButton} ${styles.deleteButton}`}
                                            onClick={() => handleDeleteSuggestion(suggestion.id)}
                                            title="Удалить предложение"
                                        >
                                            🗑️
                                        </button>
                                    </div>
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
                                        📅 Открыто до: {formatDate(suggestion.deadline)}
                                    </div>
                                )}

                                {/* Результаты голосования */}
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px' }}>
                                        Результаты голосования
                                    </div>

                                    {/* Голоса "За" */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '20px', marginRight: '10px' }}>👍</span>
                                        <span style={{ fontSize: '16px', marginRight: '10px', minWidth: '60px' }}>За</span>
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
                                                backgroundColor: '#28A745',
                                                borderRadius: '4px'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '16px', fontWeight: '500', minWidth: '80px' }}>
                                            {suggestion.votes_for} ({forPercentage}%)
                                        </span>
                                    </div>

                                    {/* Голоса "Против" */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '20px', marginRight: '10px' }}>👎</span>
                                        <span style={{ fontSize: '16px', marginRight: '10px', minWidth: '60px' }}>Против</span>
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
                                        <span style={{ fontSize: '16px', fontWeight: '500', minWidth: '80px' }}>
                                            {suggestion.votes_against} ({againstPercentage}%)
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '14px', color: '#7C7C7C' }}>
                                        Всего голосов: {totalVotes}
                                        {suggestion.comments_count && suggestion.comments_count > 0 && (
                                            <> • Комментариев: {suggestion.comments_count}</>
                                        )}
                                    </div>
                                </div>

                                {/* Кнопки голосования */}
                                {suggestion.status === 'new' || suggestion.status === 'under_review' ? (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleVote(suggestion.id, 'for')}
                                            style={{
                                                backgroundColor: suggestion.user_vote === 'for' ? '#28A745' : '#F6F7F8',
                                                color: suggestion.user_vote === 'for' ? 'white' : '#353536',
                                                border: suggestion.user_vote === 'for' ? '2px solid #28A745' : '2px solid transparent',
                                                borderRadius: '11px',
                                                padding: '10px 20px',
                                                cursor: 'pointer',
                                                fontFamily: 'Helvetica Neue',
                                                fontSize: '16px',
                                                fontWeight: suggestion.user_vote === 'for' ? '500' : '400',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            👍 За
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
                                            👎 Против
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

            {/* Отображение ошибок */}
            {errors.suggestions && <ErrorField message={errors.suggestions} />}
            {errors.vote && <ErrorField message={errors.vote} />}
            {errors.deleteSuggestion && <ErrorField message={errors.deleteSuggestion} />}
        </div>
    );
};

export default ProjectVoting;