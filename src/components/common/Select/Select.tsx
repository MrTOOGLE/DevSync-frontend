import React from 'react';
import styles from './Select.module.css';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({className, ...props}: SelectProps) => {
    return (
        <select className={`${styles.select} ${className || ''}`} {...props}>
            {props.children}
        </select>
    );
};