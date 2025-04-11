import React, {useState} from 'react';
import styles from '../../styles/FaqPage.module.css'
import {FaqContent, FaqKey} from "./FaqContent.tsx";
import {RadioButton} from "../../components/common/RadioButton/RadioButton.tsx";
import arrowBack from "../../photos/pngwing.com.png";
import {Header} from "../../components/common/Header/Header.tsx";
import {useNavigate} from "react-router-dom";
import {Footer} from "../../components/common/Footer/Footer.tsx";

const faqSections = [
    {key: 'start', label: 'Начало'},
    {key: 'projects', label: 'Проекты'},
    {key: 'tasks', label: 'Задачи'},
    {key: 'suggestions', label: 'Предложения'},
    {key: 'voting', label: 'Голосование'},
] as const;

const FaqPage: React.FC = () => {
    const [selected, setSelected] = useState<FaqKey>('start');
    const navigate = useNavigate();

    return (
        <div className={styles.mainContainer}>
            <Header>
                <button onClick={() => navigate(-1)} className="back-button">
                    <img src={arrowBack} alt="Back" className='back-icon'/>
                    <span>Назад</span>
                </button>
            </Header>
            <div className={styles.mainContent}>
                <div className={styles.heading}>
                    <h1>FAQ</h1>
                    <p>Раздел, который поможет Вам в освоении новой системы управления проектами</p>
                </div>
                <div className={styles.container}>
                    <aside className={styles.sidebar}>
                        {faqSections.map((section) => (
                            <RadioButton
                                key={section.key}
                                label={section.label}
                                value={section.key}
                                name="faq"
                                checked={selected === section.key}
                                onChange={(e) => setSelected(e.target.value as typeof selected)}
                            />
                        ))}
                    </aside>
                    <main className={styles.content}>
                        <h2>{FaqContent[selected].title}</h2>
                        <div>{FaqContent[selected].content}</div>
                    </main>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default FaqPage;