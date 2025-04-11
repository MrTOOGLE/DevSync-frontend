import React from 'react';
import styles from './Input.module.css';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    hasError?: boolean;
}

export const Input = ({hasError, className = '', ...props}: InputProps) => {
    const inputClassName = [
        styles.input,
        hasError ? styles.inputError : '',
        className,
    ].join(' ').trim();

    return (
        <input
            className={inputClassName}
               {...props}
        />
    )
}