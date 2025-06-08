import React, {useState, useEffect} from 'react';
import styles from '../../styles/ProjectManagement.module.css';
import {Input} from '../../components/common/Input/Input.tsx';
import {ErrorField} from '../../components/common/ErrorField/ErrorField.tsx';
import {
    votingService,
    Voting,
    VotingCreateData
} from '../../hooks/VoitingService.tsx';

interface ProjectVotingProps {
    projectId: number;
}

const ProjectVoting: React.FC<ProjectVotingProps> = ({projectId}) => {
    // Состояния
    const [votings, setVotings] = useState<Voting[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Фильтры
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Создание голосования
    const [showCreateVoting, setShowCreateVoting] = useState(false);
    const [newVoting, setNewVoting] = useState<VotingCreateData & { options_text: string }>({
        title: '',
        body: '',
        end_date: '',
        options: [],
        is_anonymous: false,
        options_text: ''
    });
    const [creating, setCreating] = useState(false);

    // Загрузка голосований при монтировании
    useEffect(() => {
        loadVotings();
    }, [projectId]);

    // Загрузка голосований
    const loadVotings = async () => {
        try {
            setLoading(true);
            setErrors(prev => ({...prev, votings: ''}));

            const votingsResponse = await votingService.getProjectVotings(projectId);
            setVotings(votingsResponse.votings);
        } catch (error: any) {
            console.error('Ошибка загрузки голосований:', error);
            setErrors(prev => ({...prev, votings: error.message || 'Ошибка загрузки голосований'}));
        } finally {
            setLoading(false);
        }
    };

    // Создание голосования
    const handleCreateVoting = async () => {
        if (!newVoting.title.trim()) {
            setErrors(prev => ({...prev, votingTitle: 'Название голосования обязательно'}));
            return;
        }

        if (!newVoting.body.trim()) {
            setErrors(prev => ({...prev, votingBody: 'Описание голосования обязательно'}));
            return;
        }

        if (!newVoting.end_date) {
            setErrors(prev => ({...prev, votingEndDate: 'Дата окончания обязательна'}));
            return;
        }

        if (!newVoting.options_text.trim()) {
            setErrors(prev => ({...prev, votingOptions: 'Варианты ответов обязательны'}));
            return;
        }

        // Парсим варианты ответов из текста
        const options = newVoting.options_text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => ({body: line}));

        if (options.length < 2) {
            setErrors(prev => ({...prev, votingOptions: 'Необходимо минимум 2 варианта ответа'}));
            return;
        }

        try {
            setCreating(true);
            setErrors(prev => ({
                ...prev,
                votingCreate: '',
                votingTitle: '',
                votingBody: '',
                votingEndDate: '',
                votingOptions: ''
            }));

            const votingData: VotingCreateData = {
                title: newVoting.title.trim(),
                body: newVoting.body.trim(),
                end_date: newVoting.end_date,
                options: options,
                is_anonymous: newVoting.is_anonymous
            };

            const createdVoting = await votingService.createVoting(projectId, votingData);
            setVotings(prev => [createdVoting, ...prev]);

            // Сброс формы
            setNewVoting({
                title: '',
                body: '',
                end_date: '',
                options: [],
                is_anonymous: false,
                options_text: ''
            });
            setShowCreateVoting(false);

        } catch (error: any) {
            console.error('Ошибка создания голосования:', error);
            const errorMessage = error.data?.title?.[0] || error.data?.detail || error.message || 'Ошибка при создании голосования';
            setErrors(prev => ({...prev, votingCreate: errorMessage}));
        } finally {
            setCreating(false);
        }
    };

    // Голосование
    const handleVote = async (votingId: number, optionId: number) => {
        try {
            setErrors(prev => ({...prev, vote: ''}));

            await votingService.vote(projectId, votingId, optionId);

            // Обновляем статистику голосования
            await loadVotings();
        } catch (error: any) {
            console.error('Ошибка голосования:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при голосовании';
            setErrors(prev => ({...prev, vote: errorMessage}));
        }
    };

    // Удаление голосования
    const handleDeleteVoting = async (votingId: number) => {
        const voting = votings.find(v => v.id === votingId);
        if (!voting) return;

        if (!confirm(`Вы уверены, что хотите удалить голосование "${voting.title}"?`)) {
            return;
        }

        try {
            setErrors(prev => ({...prev, deleteVoting: ''}));
            await votingService.deleteVoting(projectId, votingId);
            setVotings(prev => prev.filter(v => v.id !== votingId));
        } catch (error: any) {
            console.error('Ошибка удаления голосования:', error);
            const errorMessage = error.data?.detail || error.message || 'Ошибка при удалении голосования';
            setErrors(prev => ({...prev, deleteVoting: errorMessage}));
        }
    };

    // Фильтрация голосований
    const filteredVotings = votings.filter(voting => {
        const matchesStatus = statusFilter === 'all' || voting.status === statusFilter;
        const matchesSearch = voting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            voting.body.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Получение названия статуса
    const getStatusName = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'active': 'Активное',
            'ended': 'Завершено',
            'draft': 'Черновик'
        };
        return statusMap[status] || status;
    };

    // Получение цвета статуса
    const getStatusColor = (status: string): string => {
        const colorMap: { [key: string]: string } = {
            'active': '#28A745',
            'ended': '#7C7C7C',
            'draft': '#FFDD2D'
        };
        return colorMap[status] || '#7C7C7C';
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
                <p>Загрузка голосований...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Заголовок и кнопка создания */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2 className={styles.sectionTitle}>Голосования</h2>
                <button
                    className={styles.primaryButton}
                    onClick={() => setShowCreateVoting(true)}
                >
                    Создать голосование
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
                    placeholder="🔍 Поиск голосований"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{flex: 1}}
                />

                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <span style={{fontSize: '14px', color: '#7C7C7C', whiteSpace: 'nowrap'}}>Статус:</span>
                    <div style={{display: 'flex', gap: '8px'}}>
                        {[
                            {value: 'all', label: 'Все'},
                            {value: 'active', label: 'Активные'},
                            {value: 'ended', label: 'Завершенные'},
                            {value: 'draft', label: 'Черновики'}
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

            {/* Форма создания голосования */}
            {showCreateVoting && (
                <div style={{
                    backgroundColor: '#F6F7F8',
                    padding: '20px',
                    borderRadius: '14px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{marginBottom: '20px', fontSize: '20px', color: '#353536'}}>
                        Новое голосование
                    </h3>

                    <div className={styles.formGroup}>
                        <Input
                            placeholder="Название голосования*"
                            value={newVoting.title}
                            onChange={(e) => setNewVoting(prev => ({...prev, title: e.target.value}))}
                            hasError={!!errors.votingTitle}
                            style={{width: '1120px'}}
                        />
                        {errors.votingTitle && <ErrorField message={errors.votingTitle}/>}
                    </div>

                    <div className={styles.formGroup}>
                        <textarea
                            className={styles.textarea}
                            placeholder="Описание голосования*"
                            value={newVoting.body}
                            onChange={(e) => setNewVoting(prev => ({...prev, body: e.target.value}))}
                            style={{height: '120px', width: '1120px'}}
                        />
                        {errors.votingBody && <ErrorField message={errors.votingBody}/>}
                    </div>

                    <div className={styles.formGroup}>
                        <textarea
                            className={styles.textarea}
                            placeholder="Варианты ответов (каждый с новой строки)*"
                            value={newVoting.options_text}
                            onChange={(e) => setNewVoting(prev => ({...prev, options_text: e.target.value}))}
                            style={{height: '120px', width: '1120px'}}
                        />
                        {errors.votingOptions && <ErrorField message={errors.votingOptions}/>}
                        <div style={{fontSize: '12px', color: '#7C7C7C', marginTop: '5px'}}>
                            Пример:<br/>
                            Вариант 1<br/>
                            Вариант 2<br/>
                            Вариант 3
                        </div>
                    </div>

                    <div style={{marginBottom: '20px'}}>
                        <label style={{fontSize: '14px', color: '#7C7C7C', marginBottom: '5px', display: 'block'}}>
                            Дата окончания*
                        </label>
                        <Input
                            type="datetime-local"
                            value={newVoting.end_date}
                            onChange={(e) => setNewVoting(prev => ({...prev, end_date: e.target.value}))}
                            hasError={!!errors.votingEndDate}
                        />
                        {errors.votingEndDate && <ErrorField message={errors.votingEndDate}/>}
                    </div>

                    <div style={{marginBottom: '20px'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                            <input
                                type="checkbox"
                                checked={newVoting.is_anonymous}
                                onChange={(e) => setNewVoting(prev => ({...prev, is_anonymous: e.target.checked}))}
                                style={{width: '16px', height: '16px'}}
                            />
                            <span style={{fontFamily: 'Helvetica Neue', fontSize: '16px', color: '#353536'}}>
                                Анонимное голосование
                            </span>
                        </label>
                    </div>

                    {errors.votingCreate && <ErrorField message={errors.votingCreate}/>}

                    <div className={styles.actionButtons}>
                        <button
                            className={styles.secondaryButton}
                            onClick={() => {
                                setShowCreateVoting(false);
                                setNewVoting({
                                    title: '',
                                    body: '',
                                    end_date: '',
                                    options: [],
                                    is_anonymous: false,
                                    options_text: ''
                                });
                                setErrors(prev => ({
                                    ...prev,
                                    votingTitle: '',
                                    votingBody: '',
                                    votingEndDate: '',
                                    votingOptions: '',
                                    votingCreate: ''
                                }));
                            }}
                            disabled={creating}
                        >
                            Отменить
                        </button>
                        <button
                            className={styles.primaryButton}
                            onClick={handleCreateVoting}
                            disabled={creating}
                        >
                            {creating ? 'Создание...' : 'Создать'}
                        </button>
                    </div>
                </div>
            )}

            {/* Список голосований */}
            {filteredVotings.length > 0 ? (
                <div className={styles.itemsList}>
                    {filteredVotings.map(voting => {
                        const totalVotes = voting.options.reduce((sum, option) => sum + option.votes_count, 0);

                        return (
                            <div key={voting.id} style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '14px',
                                padding: '25px',
                                marginBottom: '20px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}>
                                {/* Заголовок и статус */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '15px'
                                }}>
                                    <div style={{flex: 1}}>
                                        <h3 style={{
                                            fontSize: '20px',
                                            color: '#353536',
                                            margin: '0 0 8px 0',
                                            fontFamily: 'Helvetica Neue',
                                            fontWeight: '500'
                                        }}>
                                            #{voting.id} {voting.title}
                                        </h3>
                                        <div style={{fontSize: '14px', color: '#7C7C7C'}}>
                                            Создано: {formatDate(voting.date_started)} • {voting.creator.first_name} {voting.creator.last_name}
                                            <br/>
                                            Завершится: {formatDate(voting.end_date)}
                                        </div>
                                    </div>
                                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                        <span style={{
                                            backgroundColor: getStatusColor(voting.status),
                                            color: voting.status === 'draft' ? '#353536' : 'white',
                                            fontSize: '14px',
                                            padding: '6px 12px',
                                            borderRadius: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {getStatusName(voting.status)}
                                        </span>

                                        <button
                                            className={`${styles.iconButton} ${styles.deleteButton}`}
                                            onClick={() => handleDeleteVoting(voting.id)}
                                            title="Удалить голосование"
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
                                    {voting.body}
                                </p>

                                {/* Варианты ответов */}
                                <div style={{marginBottom: '15px'}}>
                                    <div style={{fontSize: '16px', fontWeight: '500', marginBottom: '10px'}}>
                                        Варианты ответов ({totalVotes} голосов)
                                    </div>

                                    {voting.options.map((option, index) => {
                                        const percentage = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0;

                                        return (
                                            <div key={option.id} style={{marginBottom: '10px'}}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '5px'
                                                }}>
                                                    <span style={{
                                                        fontSize: '16px',
                                                        marginRight: '10px',
                                                        minWidth: '60px'
                                                    }}>
                                                        Вариант {index + 1}
                                                    </span>
                                                    <div style={{
                                                        flex: 1,
                                                        height: '8px',
                                                        backgroundColor: '#E0E0E0',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden',
                                                        marginRight: '10px'
                                                    }}>
                                                        <div style={{
                                                            width: `${percentage}%`,
                                                            height: '100%',
                                                            backgroundColor: '#FFDD2D',
                                                            borderRadius: '4px'
                                                        }}/>
                                                    </div>
                                                    <span
                                                        style={{fontSize: '16px', fontWeight: '500', minWidth: '80px'}}>
                                                        {option.votes_count} ({percentage}%)
                                                    </span>
                                                </div>
                                                <div style={{fontSize: '14px', color: '#353536', marginLeft: '70px'}}>
                                                    {option.body}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Кнопки голосования */}
                                {voting.status === 'active' ? (
                                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                                        {voting.options.map((option, index) => (
                                            <button
                                                key={option.id}
                                                onClick={() => handleVote(voting.id, option.id)}
                                                style={{
                                                    backgroundColor: '#F6F7F8',
                                                    color: '#353536',
                                                    border: '2px solid #FFDD2D',
                                                    borderRadius: '11px',
                                                    padding: '10px 20px',
                                                    cursor: 'pointer',
                                                    fontFamily: 'Helvetica Neue',
                                                    fontSize: '16px',
                                                    fontWeight: '400',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#FFDD2D';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#F6F7F8';
                                                }}
                                            >
                                                Вариант {index + 1}
                                            </button>
                                        ))}
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

                                {voting.is_anonymous && (
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#7C7C7C',
                                        marginTop: '10px',
                                        fontStyle: 'italic'
                                    }}>
                                        🔒 Анонимное голосование
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
                        {votings.length === 0 ? 'Пока нет голосований' : 'Ничего не найдено'}
                    </h3>
                    <p>
                        {votings.length === 0
                            ? 'Создайте первое голосование для принятия коллективных решений'
                            : 'Попробуйте изменить фильтры или поисковый запрос'
                        }
                    </p>
                </div>
            )}

            {/* Отображение ошибок */}
            {errors.votings && <ErrorField message={errors.votings}/>}
            {errors.vote && <ErrorField message={errors.vote}/>}
            {errors.deleteVoting && <ErrorField message={errors.deleteVoting}/>}
        </div>
    );
};

export default ProjectVoting;