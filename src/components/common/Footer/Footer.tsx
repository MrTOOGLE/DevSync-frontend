import React from 'react';
import styles from './Footer.module.css';
import logo from '../../../photos/logo.png'

export const Footer: React.FC = ( ) => {
    return (
        <footer className={styles.footer}>
            <div className="content">
                <img src={logo} alt="logo"/>
            </div>
        </footer>
    )
}