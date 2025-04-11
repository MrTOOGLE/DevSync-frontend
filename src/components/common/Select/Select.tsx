import React from 'react';
import styles from './Select.module.css';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    hasError?: boolean;
};

export const Select = ({hasError, className = '', ...props}: SelectProps) => {
    const selectClassName = [
        styles.select,
        hasError ? styles.selectError : '',
        className,
    ].join(' ').trim();

    return (
        <select
            className={selectClassName}
            {...props}
        >
            {props.children}
        </select>
    );
};