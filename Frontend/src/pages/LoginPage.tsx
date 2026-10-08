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
    const [showPassword, setShowPassword] = useState(false);

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

    const isLogin = mode === 'login';

    return (
        <main className="auth-page">
            <section className="auth-visual" aria-label="Discover your next home">
                <div className="auth-visual-overlay" />
                <div className="auth-visual-content">
                    <div className="auth-brand">
                        <span className="auth-brand-mark" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                                <path d="M9 21v-6h6v6M7 11h.01M17 11h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span>Havenly</span>
                    </div>
                    <div className="auth-visual-copy">
                        <p className="eyebrow">Find a place to belong</p>
                        <h2>Make space for what matters.</h2>
                        <p>Thoughtfully selected homes for the way you want to live.</p>
                    </div>
                    <div className="auth-visual-footer">
                        <span className="live-dot" aria-hidden="true" />
                        <span>Curated homes, made personal</span>
                        <span className="visual-divider" aria-hidden="true" />
                        <span>12k+ listings</span>
                    </div>
                </div>
            </section>

            <section className="auth-panel">
                <div className="auth-panel-inner">
                    <div className="auth-panel-heading">
                        <div className="mobile-auth-brand">
                            <span className="auth-brand-mark" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                                    <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                            </span>
                            <span>Havenly</span>
                        </div>
                        <p className="eyebrow">{isLogin ? 'Welcome back' : 'Get started'}</p>
                        <h1>{isLogin ? 'Sign in to your space.' : 'Create your space.'}</h1>
                        <p className="auth-subtitle">
                            {isLogin ? 'Pick up where you left off.' : 'Save homes you love and find your next address.'}
                        </p>
                    </div>

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

                        <div className="field-group">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="field-group">
                            <div className="field-label-row">
                                <label htmlFor="password">Password</label>
                                {isLogin ? <button type="button" className="forgot-password" onClick={() => setMessage('Password reset is coming soon.')}>Forgot password?</button> : null}
                            </div>
                            <div className="password-input-wrap">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Minimum 8 characters"
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                    required
                                    minLength={8}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword((current) => !current)}
                                    disabled={loading}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {error ? <p className="error-text" role="alert">{error}</p> : null}
                        {message ? <p className="success-text" role="status">{message}</p> : null}

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
                            {!loading ? <span aria-hidden="true">→</span> : null}
                        </button>

                        <div className="auth-switch">
                            <span>{isLogin ? 'New to Havenly?' : 'Already have an account?'}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode(isLogin ? 'register' : 'login');
                                    setError('');
                                    setMessage('');
                                }}
                                disabled={loading}
                            >
                                {isLogin ? 'Create an account' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                    <p className="auth-legal">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
            </section>
        </main>
    );
}
