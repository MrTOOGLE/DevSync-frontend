import React, {FormEvent, useState} from 'react';
import './styles.css'

const AuthorizationForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Авторизация с почтой:', email, 'и паролем:', password);
    };

    return (
        <div className="authorizationFormContainer">
            <div className="authorizationForm">
                <div className="heading">
                    <h1>Войти</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form_group">
                        <input
                            type="text"
                            id="email"
                            name="email"
                            placeholder="Электронная почта*"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form_group">
                        <input
                            type="text"
                            id="password"
                            name="password"
                            placeholder="Пароль*"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <p>
                        У вас еще нет аккаунта? <a href="#">Зарегистрироваться!</a>
                    </p>
                    <button type="submit">Войти</button>
                </form>
            </div>
        </div>
    );
};

export default AuthorizationForm;