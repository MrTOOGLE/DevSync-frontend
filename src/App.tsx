import React from 'react';
import RegistrationForm from './pages/Auth/Registration.tsx'
import Authorization from "./pages/Auth/Authorization.tsx";

const App: React.FC = () => {
    return (
        <div className="app">
            <RegistrationForm />
            <Authorization />
        </div>
    )
};

export default App;