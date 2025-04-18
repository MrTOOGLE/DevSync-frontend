import React from 'react';
import styles from './Header.module.css';
import arrowBack from "../../../photos/pngwing.com.png";
import {useNavigate} from "react-router-dom";
import logo from "../../../photos/logo.png";
import bell from "../../../photos/bell.png";

interface HeaderProps {
    variant?: 'default' | 'back';
}

export const Header: React.FC<HeaderProps> = ({variant = 'default'}) => {
    const navigate = useNavigate();

    return (
        <header className={styles.headerFixed}>
            <div className={styles.headerContent}>
                {variant === 'back' ? (
                        <button onClick={() => navigate(-1)} className={styles.backButton}>
                            <img src={arrowBack} alt="Back" className={styles.backIcon} />
                            <span>Назад</span>
                        </button>
                    ) :
                    (
                        <>
                            <div className={styles.leftGroup}>
                                <img onClick={() => navigate('/')} src={logo} alt="DEV SYNC" className={styles.logo}/>
                                <nav className={styles.nav}>
                                    <button onClick={() => navigate('/login')} className={styles.link}>Создать проект</button>
                                    <button onClick={() => navigate('/faq')} className={styles.link}>FAQ</button>
                                </nav>
                            </div>
                            <div className={styles.right}>
                                <button className={styles.bell}>
                                    <img src={bell} alt="bell"/>
                                </button>
                                <button onClick={() => navigate('/login')} className={styles.profile}>Личный кабинет</button>
                            </div>
                        </>
                    )}
            </div>
        </header>
    )
}