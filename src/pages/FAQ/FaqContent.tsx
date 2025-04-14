import {JSX} from 'react';
import styles from '../../styles/FaqPage.module.css'
import img1 from '../../photos/FAQ/img1FAQ.png'
import img2 from '../../photos/FAQ/img2FAQ.png'
import img3 from '../../photos/FAQ/img3FAQ.png'
import img4 from '../../photos/FAQ/img4FAQ.png'
import img5 from '../../photos/FAQ/img5FAQ.png'
import img6 from '../../photos/FAQ/img6FAQ.png'

export type FaqKey = 'start' | 'projects' | 'tasks' | 'suggestions' | 'voting';

type FaqSection = {
    content: JSX.Element;
};

export const FaqContent: Record<FaqKey, FaqSection> = {
    start: {
        content: (
            <>
                <div className={styles.section}>
                    <h3>Добро пожаловать в DevSync</h3>
                    <div className={styles["text-imgSection"]}>
                        <div className={styles.textWelcome}>
                            <p>
                                Система управления предложениями — это
                                внутренний инструмент, созданный для
                                сотрудников Т-Банка с целью повышения
                                эффективности разработки проектов.
                                Здесь вы можете создавать проекты,
                                предлагать улучшения, голосовать за
                                изменения и следить за ходом реализации
                                идей.
                            </p>
                        </div>
                        <div className={styles.imgWelcome}>
                            <img src={img1} alt="img1"/>
                        </div>
                    </div>
                    <hr/>
                </div>

                <div className={styles.section}>
                    <h3>Что нужно, чтобы начать работу</h3>
                    <div className={styles.textSection}>
                        <p>Для начала работы с системой вам необходимо быть сотрудником Т-Банка
                            и пройти процедуру регистрации.</p>
                        <br/>
                        <ol>
                            <li>Перейдите на страницу входа.</li>
                            <li>Выберите «Регистрация» и введите корпоративный email.</li>
                            <li>Создайте надёжный пароль и подтвердите электронную почту.</li>
                            <li>После регистрации вы можете войти в систему, используя указанные данные.</li>
                        </ol>
                        <br/>
                        <p><span>Важно:</span> доступ в систему возможен только после подтверждения email.</p>
                    </div>
                    <hr/>
                </div>

                <div className={styles.section}>
                    <h3>Личный кабинет</h3>
                    <div className={styles["text-imgSection"]}>
                        <div className={styles.textPersonalAccount}>
                            <p>После входа вы попадёте в личный кабинет. Здесь вы можете:</p>
                            <br/>
                            <ol>
                                <li>Изменить свои данные (имя, фото, должность и пр.),</li>
                                <li>Просматривать уведомления,</li>
                                <li>Управлять участием в проектах,</li>
                                <li>Отслеживать активность и изменения в ваших предложениях и задачах.</li>
                            </ol>
                        </div>
                        <div className={styles.imgPersonalAccount}>
                            <img src={img2} alt="img2"/>
                        </div>
                    </div>
                    <hr/>
                </div>
            </>
        ),
    },
    projects: {
        content: (
            <>
                <div className={styles.section}>
                    <h3>Проекты — сердце DevSync</h3>
                    <div className={styles.textSection}>
                        <p>Раздел «Проекты» — это основа всей системы. Каждый проект объединяет
                            пользователей, задачи, предложения и обсуждения в рамках одной цели.</p>
                    </div>
                    <hr/>
                </div>

                <div className={styles.section}>
                    <h3>Создание проекта</h3>
                    <div className={styles["text-imgSection"]}>
                        <div className={styles.textCreateProject}>
                            <p>Чтобы начать работу над инициативами, создайте
                                новый проект:</p>
                            <br/>
                            <ol>
                                <li>Перейдите в раздел «Проекты».</li>
                                <li>Нажмите кнопку «Создать проект».</li>
                                <li>Укажите название, описание и цели проекта.</li>
                                <li>Добавьте участников — по email или через поиск.</li>
                            </ol>
                            <br/>
                            <p>Создатель проекта автоматически получает административные
                                права и может управлять участниками и настройками.</p>
                        </div>
                        <div className={styles.imgCreateProject}>
                            <img src={img3} alt="img3"/>
                        </div>
                    </div>
                    <hr/>
                </div>

                <div className={styles.section}>
                    <h3>Управление участниками</h3>
                    <div className={styles.textSection}>
                        <p>Вы можете:</p>
                        <br/>
                        <ul>
                            <li>Добавлять новых участников;</li>
                            <li>Назначать роли (участник, администратор);</li>
                            <li>Удалять пользователей из проекта.</li>
                        </ul>
                        <br/>
                        <p>Все действия отображаются в истории изменений.</p>
                    </div>
                    <hr/>
                </div>
            </>
        ),
    },
    tasks: {
        content: (
            <>
                <div className={styles.section}>
                    <h3>Назначение и отслеживание задач</h3>
                    <div className={styles["text-imgSection"]}>
                        <div className={styles.textTasks}>
                            <p>Задачи помогают структурировать работу по предложениям. Обычно они
                                создаются для реализации принятого улучшения. Задачи позволяют
                                превратить идеи в конкретные действия.</p>
                            <br/>
                            <p>Основные возможности:</p>
                            <br/>
                            <ol>
                                <li>Создание задачи в рамках проекта с описанием и <br/> дедлайном.</li>
                                <li>Назначение ответственного и участников задачи.</li>
                                <li>Отслеживание статуса выполнения: в работе, завершено, на паузе и др.</li>
                                <li>Комментирование и история изменений по задаче.</li>
                            </ol>
                            <br/>
                            <p>Задачи связаны с предложениями и обеспечивают
                                практическую реализацию идей.</p>
                        </div>
                        <div className={styles.imgTasks}>
                            <img src={img4} alt="img4"/>
                        </div>
                    </div>
                    <hr/>
                </div>
            </>
        ),
    },
    suggestions: {
        content: (
            <>
                <div className={styles.section}>
                    <h3>Предложения</h3>
                    <div className={styles.textSection}>
                        <p>Раздел, где каждый участник может внести вклад в улучшение проекта.</p>
                    </div>
                    <hr/>
                </div>

                <div className={styles.section}>
                    <h3>Создание предложения</h3>
                    <div className={styles["text-imgSection"]}>
                        <div className={styles.textSuggestion}>
                            <p>Любой участник проекта может предложить улучшение:</p>
                            <br/>
                            <ol>
                                <li>Перейдите в проект → вкладка «Предложения».</li>
                                <li>Нажмите «Новое предложение».</li>
                                <li>Укажите название, краткое и подробное описание.</li>
                                <li>При необходимости — прикрепите файлы и добавьте теги.</li>
                            </ol>
                            <br/>
                            <p>Предложения автоматически получают статус «Новое» и становятся
                                доступны для обсуждения и голосования.</p>
                        </div>
                        <div className={styles.imgSuggestion}>
                            <img src={img5} alt="img5"/>
                        </div>
                    </div>
                    <hr/>
                </div>

                <div className={styles.section}>
                    <h3>Обсуждение и теги</h3>
                    <div className={styles.textSection}>
                        <p>Раздел, где каждый участник может внести вклад в улучшение проекта.</p>
                        <br/>
                        <p>Вы можете:</p>
                        <br/>
                        <ol>
                            <li>Оставлять замечания.</li>
                            <li>Обсуждать детали с другими участниками.</li>
                            <li>Прикреплять файлы.</li>
                        </ol>
                        <br/>
                        <p>Используйте теги и категории для быстрой фильтрации и поиска нужных
                            предложений.</p>
                    </div>
                    <hr/>
                </div>

                <div className={styles.section}>
                    <h3>Статусы предложений</h3>
                    <div className={styles.textSection}>
                        <ol>
                            <li>Новое – только что создано.</li>
                            <li>На рассмотрении – предложение изучается участниками проекта.</li>
                            <li>Принято – идея одобрена, можно приступать к реализации.</li>
                            <li>Отклонено – предложение не будет реализовано.</li>
                        </ol>
                        <br/>
                        <p>Каждый пользователь может комментировать и обсуждать предложения.</p>
                    </div>
                    <hr/>
                </div>
            </>
        ),
    },
    voting: {
        content: (
            <>
                <div className={styles.section}>
                    <h3>Голосование</h3>
                    <div className={styles.textSection}>
                        <p>Прозрачный механизм принятия решений в команде.</p>
                    </div>
                    <hr/>
                </div>

                <div className={styles.section}>
                    <h3>Мнение каждого участника — важно</h3>
                    <div className={styles.textSection}>
                        <p>Как это работает</p>
                        <br/>
                        <ol>
                            <li>Каждый участник может проголосовать за или против предложения.</li>
                            <li>Система отображает количество голосов и их соотношение.</li>
                            <li>Итоги голосования помогают определить возможность реализации идеи.</li>
                        </ol>
                        <br/>
                        <p>Принятое предложение может быть преобразовано в задачу и
                            добавлено в план проекта</p>
                    </div>
                    <hr/>
                </div>

                <div className={styles.section}>
                    <h3>Фильтрация предложений</h3>
                    <div className={styles["text-imgSection"]}>
                        <div className={styles.textFilter}>
                            <p>Вы можете фильтровать предложения по:</p>
                            <br/>
                            <ul>
                                <li>Статусу (Новое, На рассмотрении, Принято и т.д.).</li>
                                <li>Автору.</li>
                                <li>Дате создания.</li>
                                <li>Количеству голосов.</li>
                                <li>Тегам.</li>
                            </ul>
                        </div>
                        <div className={styles.imgFilter}>
                            <img src={img6} alt="img6"/>
                        </div>
                    </div>
                    <hr/>
                </div>

                <div className={styles.section}>
                    <h3>Результаты голосования</h3>
                    <div className={styles.textSection}>
                        <p>На основании голосов система может автоматически менять статус
                            предложения или уведомлять администратора о необходимости
                            принятия решения.</p>
                    </div>
                    <hr/>
                </div>
            </>
        ),
    },
};
