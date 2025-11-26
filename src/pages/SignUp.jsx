// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const SignUp = () => {
    const { signUp, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleEmailSignUp = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await signUp(email, password); // Call the AuthContext method
            navigate('/'); // Navigate to the home page after successful signup
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
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            setError('');
            await loginWithGoogle(); // Call the AuthContext method
            navigate('/');
        } catch (err) {
            console.error('Google Sign Up Error: ', err);
            switch (err.code) {
                case 'auth/popup-closed-by-user':
                    setError('Sign-in was canceled. Please try again.');
                    break;
                case 'auth/network-request-failed':
                    setError('Network error. Please try again.');
                    break;
                default:
                    setError('Failed to sign up with Google.');
            }
        }
    };


    return (
        <div className="container mt-5">
            <SEO title="Sign Up" description="Create a free DigiSwatch account to save unlimited color palettes and share your creations." url="/signup" />
            <h1>Sign Up</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleEmailSignUp}>
                <div className="mb-3">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">Sign Up</button>
            </form>
            <div className="mt-3">
                <button className="btn btn-outline-primary w-100" onClick={handleGoogleSignUp}>
                    Sign Up with Google
                </button>
            </div>
        </div>
    );
};

export default SignUp;
