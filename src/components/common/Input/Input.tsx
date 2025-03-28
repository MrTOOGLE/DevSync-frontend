import React from 'react';
import styles from './Input.module.css';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = ({className, ...props}: InputProps) => {
    return (
        <input className={`${styles.input} ${className || ''}`}
               {...props}/>
    )
}