// src/pages/SignUp.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { FaGoogle } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';
import './Login.css';

const SignUp = () => {
    const { signUp, loginWithGoogle, currentUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleEmailSignUp = async (e) => {
        e.preventDefault();
        try {
            if (!captchaToken) {
                setError('Please verify you are not a robot.');
                return;
            }
            setLoading(true);
            setError('');
            await signUp(email, password);
            navigate('/');
        } catch (err) {
            console.error('Sign Up Error: ', err);
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('This email is already in use.');
                    break;
                case 'auth/weak-password':
                    setError('Password should be at least 6 characters.');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address.');
                    break;
                default:
                    setError('Failed to sign up. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            setLoading(true);
            setError('');
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            console.error('Google Sign Up Error: ', err);
            setError('Failed to sign up with Google.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <SEO title="Sign Up" description="Create a free DigiSwatch account to save unlimited color palettes and share your creations." url="/signup" />
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <p className="auth-chip">Join DigiSwatch</p>
                    <h1>Create your account</h1>
                    <p className="auth-subtitle">Save palettes, share with the community, and sync across devices.</p>
                </div>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleEmailSignUp} className="auth-form">
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
                    <div className="d-flex justify-content-center my-3">
                        <ReCAPTCHA
                            sitekey="6Lc4SicsAAAAAA43mQ8KgW9QuKVAdqGGMKihBISQ"
                            onChange={(token) => setCaptchaToken(token)}
                            theme="light"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign up'}
                    </button>
                </form>
                <div className="auth-divider">
                    <span></span>
                    <p>or</p>
                    <span></span>
                </div>
                {/* <button className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleGoogleSignUp} disabled={loading}>
                    <FaGoogle /> Continue with Google
                </button> */}
                <div className="auth-footer">
                    <p className="mb-1">Already have an account?</p>
                    <Link to="/login" className="auth-link">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
