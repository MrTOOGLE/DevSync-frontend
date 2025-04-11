import React from 'react';
import styles from './RadioButton.module.css';

type RadioButtonProps = {
    label: string,
    value: string,
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const RadioButton: React.FC<RadioButtonProps> = ({label, value, checked, onChange, name, className, ...props}) => {
    return (
        <label className={`${styles.radio_wrapper} ${checked ? styles.checked : ''}`}>
            <input
                type="radio"
                value={value}
                checked={checked}
                onChange={onChange}
                name={name}
                className={`${styles.radio_input} ${className || ''}`}
                {...props}
            />
            <span className={styles.radio_label}>{label}</span>
        </label>
    )
}