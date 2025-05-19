import React, {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import '../../styles/styles.css'
import styles from '../../styles/Auth.module.css'
import {Input} from '../../components/common/Input/Input.tsx';
import {Button} from '../../components/common/Button/Button.tsx';
import {authService} from '../../hooks/AuthService.tsx';
import {Header} from "../../components/common/Header/Header.tsx";
import {Footer} from "../../components/common/Footer/Footer.tsx"; // Импортируем сервис авторизации и интерфейс ошибки

interface LocationState {
    email?: string;
}

/**
 * Страница для подтверждения почты
 */
const EmailConfirmation: React.FC = () => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [codeSent, setCodeSent] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [canResend, setCanResend] = useState(false);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        // Получаем email из состояния навигации
        const state = location.state as LocationState;

        if (state && state.email) {
            setEmail(state.email);
            // Автоматически отправляем код при загрузке компонента
            sendVerificationCode(state.email);
        } else {
            // Если email не передан, перенаправляем на страницу регистрации
            navigate('/register');
        }
    }, [location, navigate]);

    // Эффект для работы таймера
    useEffect(() => {
        if (!canResend && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);

            return () => clearInterval(interval);
        } else if (timer === 0) {
            setCanResend(true); // Разблокируем кнопку после завершения таймера
        }
    }, [canResend, timer]);

    // Функция для отправки кода подтверждения
    const sendVerificationCode = async (emailToVerify: string) => {
        try {
            setIsLoading(true);
            setErrors(null);
            await authService.sendVerificationCode(emailToVerify);
            setCodeSent(true);
            setMessage('Код подтверждения отправлен на вашу почту');
        } catch (error: any) {
            // Обрабатываем ошибку как объект с данными от сервера
            if (error.data) {
                setErrors(error.data);
            } else {
                setErrors({non_field_errors: [error.message || 'Произошла ошибка при отправке кода']});
            }
            console.error('Ошибка отправки кода:', error);
        } finally {
            setIsLoading(false);
            setCanResend(false); // Блокируем кнопку
            setTimer(60);
        }
    };

    // Функция для повторной отправки кода
    const handleResendCode = () => {
        if (email) {
            sendVerificationCode(email);
        }
    };

    // Функция для проверки кода
    const handleSubmit = async () => {
        if (code.trim() === '') {
            setErrors({code: ['Пожалуйста, введите код подтверждения']});
            return;
        }
        if (!email) {
            setErrors({email: ['Email не найден']});
            return;
        }

        try {
            setIsLoading(true);
            setErrors(null);
            await authService.confirmEmail(email, code);
            setMessage('Почта успешно подтверждена');

            // После успешного подтверждения перенаправляем пользователя на страницу входа
            setTimeout(() => {
                navigate('/login', {state: {emailConfirmed: true}});
            }, 2000);
        } catch (error: any) {
            // Обрабатываем ошибку как объект с данными от сервера
            if (error.data) {
                setErrors(error.data);
            } else {
                setErrors({non_field_errors: [error.message || 'Произошла ошибка при подтверждении почты']});
            }
            console.error('Ошибка подтверждения почты:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Если email не получен, показываем заглушку
    if (!email) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="main-container">
            <Header variant="back"/>
            <div className="main-content">
                <div className={styles.container}>
                    <div className={styles.formContainer}>
                        <h1>Подтверждение почты</h1>
                        <div className={styles.text_email}>
                            <p>
                                На адрес электронной почты <strong>{email}</strong>, указанный при регистрации,
                                {codeSent ? ' был отправлен' : ' будет отправлен'} код, необходимый для завершения
                                регистрации.
                                Введите его в поле ниже:
                            </p>
                        </div>
                        <div>
                            <Input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Код из письма*"
                                className={styles.checkMailInput}
                                disabled={isLoading}
                                hasError={!!errors}
                            />
                        </div>
                        {message && (
                            <div className={styles.successMessage}>
                                <p>{message}</p>
                            </div>
                        )}
                        {errors && (
                            <div className="error-messages">
                                {errors.email?.map((err: string, i: number) => (
                                    <p key={`email-${i}`} className="error-message">{err}</p>
                                ))}
                                {errors.code?.map((err: string, i: number) => (
                                    <p key={`code-${i}`} className="error-message">{err}</p>
                                ))}
                                {errors.non_field_errors?.map((err: string, i: number) => (
                                    <p key={`nfe-${i}`} className="error-message">{err}</p>
                                ))}
                                {errors.detail && (
                                    <p className="error-message">{errors.detail}</p>
                                )}
                            </div>
                        )}
                        <div className={styles.resendCode}>
                            <button
                                onClick={handleResendCode}
                                className={styles.linkButton}
                                disabled={!canResend || isLoading}
                            >
                                {canResend ? 'Отправить код повторно' : `Отправить код повторно (${timer} сек.)`}
                            </button>
                        </div>
                        <div className={styles.buttonContainer}>
                            <Button onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Проверка...' : 'Завершить'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default EmailConfirmation;