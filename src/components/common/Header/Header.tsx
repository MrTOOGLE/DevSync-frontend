import React, {ReactNode} from 'react';
import styles from './Header.module.css';

interface HeaderProps {
    children?: ReactNode;
}

export const Header: React.FC<HeaderProps> = ( {children}) => {
    return (
        <header className={styles.headerFixed}>
            <div className={styles.headerContent}>
                {children}
            </div>
        </header>
    )
}