import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../../styles/styles.css'
import styles from "../../styles/WelcomePage.module.css";
import {Header} from "../../components/common/Header/Header.tsx";
import {Footer} from "../../components/common/Footer/Footer.tsx";
import mainImage from '../../photos/WelcomePage/mainPicture.png'
import {Button} from "../../components/common/Button/Button.tsx";
import {RadioButton} from "../../components/common/RadioButton/RadioButton.tsx";
import img1 from "../../photos/WelcomePage/3 1.svg"
import img2 from "../../photos/WelcomePage/2 1.svg"

// Определяем типы для вкладок
type TabType = 'projects' | 'roles' | 'offers' | 'voting';

const DevSyncPage: React.FC = () => {
    // Состояние для активной вкладки
    const [activeTab, setActiveTab] = useState<TabType>('projects');
    const navigate = useNavigate();

    // Функция для получения пути к изображению в зависимости от активной вкладки
    const getImageForTab = () => {
        switch (activeTab) {
            case 'projects':
                return '/assets/images/projects.png';
            case 'roles':
                return '/assets/images/roles.png';
            case 'offers':
                return '/assets/images/offers.png';
            case 'voting':
                return '/assets/images/voting.png';
            default:
                return '/assets/images/projects.png';
        }
    };

    // TODO: переделать потом ссылку, когда будет создание проекта
    // <Link to="/">Создать проект</Link> ----> <Link to="/create_project">Создать проект</Link>

    return (
        <div className="main-container">
            <Header/>
            <div className="main-content">
                <section className={styles.section}>
                    <div className={styles.about}>
                        <div className={styles.heading}>
                            <h1>О DevSync</h1>
                            <p>Приложение, которое обеспечивает совместную работу при разработке ПО, которое
                                обеспечивает
                                возможность голосования за предложения по изменениям продукта</p>
                        </div>
                        <div className={styles.aboutImg}>
                            <img src={mainImage} alt={'Базовая картинка'}/>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.possibilities}>
                        <h2>Возможности DevSync</h2>
                        <div className={styles.possibilitiesButtons}>
                            <RadioButton
                                label="Проекты"
                                value="projects"
                                name="possibilities"
                                checked={activeTab === 'projects'}
                                onChange={() => setActiveTab('projects')}
                            />
                            <RadioButton
                                label="Роли"
                                value="roles"
                                name="possibilities"
                                checked={activeTab === 'roles'}
                                onChange={() => setActiveTab('roles')}
                            />
                            <RadioButton
                                label="Предложения"
                                value="offers"
                                name="possibilities"
                                checked={activeTab === 'offers'}
                                onChange={() => setActiveTab('offers')}
                            />
                            <RadioButton
                                label="Голосования"
                                value="voting"
                                name="possibilities"
                                checked={activeTab === 'voting'}
                                onChange={() => setActiveTab('voting')}
                            />
                        </div>
                        <div className={styles.possibilitiesImg}>
                            <img src={getImageForTab()} alt={`Функция ${activeTab}`}/>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.whyUs}>
                        <h2>Почему именно мы?</h2>
                        <div className={styles.featuresRow1}>
                            <div className={styles.featureCard}>
                                <div className={styles.text}>
                                    <h3>Прозрачность решений</h3>
                                    <p>При помощи голосования можно быстро и открыто решить важный вопрос.</p>
                                </div>
                                <div className={styles.img}>
                                    <img src={img1} alt="img1"/>
                                </div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.text}>
                                    <h3>Свой проект</h3>
                                    <p>Создавай проект на любую тему: от программирования до плана уборки комнаты.</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.featuresRow2}>
                            <div className={styles.featureCard}>
                                <div className={styles.text}>
                                    <h3>Создавай роли</h3>
                                    <p>При необходимости можно сделать свою роль с помощью гибких настроек прав
                                        доступа.</p>
                                </div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.text}>
                                    <h3>Ставь и выполняй задачи</h3>
                                    <p>Планируй свою работу на несколько дней вперед при помощи трекера задач.</p>
                                </div>
                                <div className={styles.img}>
                                    <img src={img2} alt="img2"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.startToday}>
                        <h2>Начни сегодня</h2>
                        <div className={styles.steps}>
                            <div className={styles.step1}>
                                <div className={styles.stepNumber}>1</div>
                                <div className={styles.stepContent1}>
                                    <h3 className={styles.stepTitle}>Пройди регистрацию</h3>
                                    <p className={styles.stepDescription}>Пройди и заверши регистрацию для работы с платформой</p>
                                </div>
                            </div>
                            <div className={styles.step2}>
                                <div className={styles.stepNumber}>2</div>
                                <div className={styles.stepContent2}>
                                    <h3 className={styles.stepTitle}>Создай проект</h3>
                                    <p className={styles.stepDescription}>Создай проект со своими настройками и описанием</p>
                                </div>
                            </div>
                            <div className={styles.step3}>
                                <div className={styles.stepNumber}>3</div>
                                <div className={styles.stepContent3}>
                                    <h3 className={styles.stepTitle}>Собирай команду разработчиков</h3>
                                    <p className={styles.stepDescription}>Добавляй участников в проект, назначай роли, создавай отделы и назначай руководителей</p>
                                </div>
                            </div>
                            <div className={styles.step4}>
                                <div className={styles.stepNumber}>4</div>
                                <div className={styles.stepContent4}>
                                    <h3 className={styles.stepTitle}>Начинай работу</h3>
                                    <p className={styles.stepDescription}>Создавай задачи и ставь дедлайны, работаем!</p>
                                </div>
                            </div>
                        </div>
                        <Button className={styles.registerButton} onClick={() => navigate('/register')}>Зарегистрироваться</Button>
                    </div>
                </section>
            </div>
            <Footer/>
        </div>
    );
};

export default DevSyncPage;