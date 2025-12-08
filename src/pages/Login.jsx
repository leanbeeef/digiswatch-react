// src/pages/Login.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { FaGoogle } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const { login, loginWithGoogle, currentUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Failed to login with Google.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <SEO title="Login" description="Log in to DigiSwatch to save your palettes and access premium features." url="/login" />
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <p className="auth-chip">Welcome back</p>
                    <h1>Sign in</h1>
                    <p className="auth-subtitle">Access your saved palettes, favorites, and exports.</p>
                </div>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleEmailLogin} className="auth-form">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control auth-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label className="form-label mt-3">Password</label>
                    <input
                        type="password"
                        className="form-control auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary w-100 mt-4" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <div className="auth-divider">
                    <span></span>
                    <p>or</p>
                    <span></span>
                </div>
                <button className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleGoogleLogin} disabled={loading}>
                    <FaGoogle /> Continue with Google
                </button>
                <div className="auth-footer">
                    <p className="mb-1">Don’t have an account?</p>
                    <Link to="/signup" className="auth-link">Sign up for free</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
