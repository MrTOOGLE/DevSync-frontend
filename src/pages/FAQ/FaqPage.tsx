import React, {useState} from 'react';
import '../../styles/styles.css'
import styles from '../../styles/FaqPage.module.css'
import {FaqContent, FaqKey} from "./FaqContent.tsx";
import {RadioButton} from "../../components/common/RadioButton/RadioButton.tsx";
import {Header} from "../../components/common/Header/Header.tsx";
import {Footer} from "../../components/common/Footer/Footer.tsx";

const faqSections = [
    {key: 'start', label: 'Начало работы'},
    {key: 'projects', label: 'Проекты'},
    {key: 'tasks', label: 'Задачи'},
    {key: 'suggestions', label: 'Предложения'},
    {key: 'voting', label: 'Голосование'},
] as const;

const FaqPage: React.FC = () => {
    const [selected, setSelected] = useState<FaqKey>('start');

    return (
        <div className="main-container">
            <Header/>
            <div className="main-content">
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
                                width={215}
                            />
                        ))}
                    </aside>
                    <main className={styles.content}>
                        <div>{FaqContent[selected].content}</div>
                    </main>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default FaqPage;