import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/styles.css'
import {Input} from "../../components/common/Input/Input.tsx";
import {Button} from "../../components/common/Button/Button.tsx";

interface LocationState {
    email?: string;
}

const EmailConfirmation: React.FC = () => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Получаем email из состояния навигации
        const state = location.state as LocationState;

        if (state && state.email) {
            setEmail(state.email);
        } else {
            // Если email не передан, перенаправляем на страницу регистрации
            navigate('/register');
        }
    }, [location, navigate]);

    // TODO: переделать после апишки, как появится
    // const verifyCode = async () => {
    //     if (!email) return;
    //
    //     try {
    //         const response = await fetch('/api/verify-email', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 email,
    //                 code
    //             })
    //         });
    //
    //         if (response.ok) {
    //             setMessage('Код подтвержден успешно!');
    //             // После успешного подтверждения перенаправляем на страницу входа
    //             setTimeout(() => {
    //                 navigate('/login');
    //             }, 2000);
    //         } else {
    //             const data = await response.json();
    //             setMessage(data.message || 'Неверный код подтверждения');
    //         }
    //     } catch (error) {
    //         setMessage('Произошла ошибка при проверке кода');
    //         console.error(error);
    //     }
    // };

    const handleSubmit = () => {
        if (code.trim() === '') {
            setMessage('Пожалуйста, введите код подтверждения');
        } else {
            setMessage('Вы подтвердили почту');
            // TODO: verifyCode();
        }
    };

    // Если email не получен, показываем заглушку или возвращаем null
    if (!email) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="form-container">
            <h1>Подтверждение почты</h1>
            <div className="text_email">
                <p>На адрес электронной почты, указанный при регистрации,
                    пришел код, необходимый для завершения регистрации.
                    Введите его в поле ниже:</p>
            </div>
            <div>
                <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Код из письма*"
                    id="checkMailInput"
                />
            </div>
            {message && (
                <div>
                    <p>{message}</p>
                </div>
            )}
            <div className="button-container">
                <Button onClick={handleSubmit}>
                    Завершить
                </Button>
            </div>
        </div>
    );
};

export default EmailConfirmation;