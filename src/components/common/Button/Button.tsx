import React from 'react';
import styles from './Button.module.css';

type ButtonProps = {
    children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({children, ...props}: ButtonProps) => {
    return (
        <button
            className={styles.button}
            {...props}
        >
            {children}
        </button>
    )
}