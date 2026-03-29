import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/authServices';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login: loginToContext, isAuthenticated } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    async function handleSubmit() {
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response =
                mode === 'login'
                    ? await login({ email, password })
                    : await register({ name, email, password });

            if (!response.success) {
                setError(response.message || 'Login failed');
                return;
            }

            loginToContext(response.data);
            setMessage(mode === 'login' ? 'Login successful.' : 'Registration successful.');
            navigate('/dashboard', { replace: true });
        } catch (error: any) {
            setError(error?.response?.data?.message || 'Unable to continue. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Real Estate Portal</h1>
                <p>{mode === 'login' ? 'Sign in to continue.' : 'Create your account.'}</p>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSubmit();
                    }}
                    className="auth-form"
                >
                    {mode === 'register' ? (
                        <>
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Jane Doe"
                                required
                                disabled={loading}
                            />
                        </>
                    ) : null}

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        minLength={8}
                        disabled={loading}
                    />

                    {error ? <p className="error-text">{error}</p> : null}
                    {message ? <p className="success-text">{message}</p> : null}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Sign up'}
                    </button>

                    <button
                        type="button"
                        className="button-secondary"
                        onClick={() => {
                            setMode(mode === 'login' ? 'register' : 'login');
                            setError('');
                            setMessage('');
                        }}
                        disabled={loading}
                    >
                        {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
