import React from 'react';

const AuthorizationForm: React.FC = () => {
    return (
        <div className="authorizationFormContainer">
            <h1>Войти</h1>
            <form>
                <div className="form_group">
                    <input
                        type="email"
                        placeholder="Электронная почта*"
                        required
                    />
                </div>
                <div className="form_group">
                    <input
                        type="password"
                        placeholder="Пароль*"
                        required
                    />
                </div>
                <p>
                    У вас еще нет аккаунта? <a href="./Registration.tsx">Зарегистрироваться!</a>
                </p>
                <button className="sumbmit">Войти</button>
            </form>
        </div>
    );
};

export default AuthorizationForm;