import React from 'react';
import styles from './ErrorField.module.css';

interface ErrorFieldProps {
    message: string;
}

export const ErrorField: React.FC<ErrorFieldProps> = ({message}) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.fieldError}>
                <span>{message}</span>
            </div>
        </div>
    )
}