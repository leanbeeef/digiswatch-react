// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async"; // npm i react-helmet-async
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const errorRef = useRef(null);

  // Optional: honor redirect target (e.g., protected route sends you here)
  const redirectTo = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      // If your auth supports persistence, pass "remember"
      await login(email.trim(), password, { remember });
      navigate(redirectTo, { replace: true });
    } catch (_) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError("");
    try {
      await loginWithGoogle({ remember });
      navigate(redirectTo, { replace: true });
    } catch (_) {
      setError("Could not sign in with Google. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const goToForgotPassword = () => {
    // Adjust route if you have a dedicated reset page
    navigate("/reset-password", { state: { email } });
  };

  return (
    <section className="container my-5" style={{ maxWidth: 520 }}>
      {/* Route-level head: auth pages should not be indexed */}
      <Helmet>
        <title>Login | DigiSwatch</title>
        <meta
          name="description"
          content="Log in to your DigiSwatch account to save and manage color palettes."
        />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="https://digiswatch.io/login" />
        {/* Optional OG/Twitter (not critical for auth) */}
        <meta property="og:title" content="Login | DigiSwatch" />
        <meta property="og:description" content="Access your saved color palettes." />
        <meta property="og:type" content="website" />
      </Helmet>

      <h1 className="fw-bold mb-3">Login</h1>
      <p className="text-muted mb-4">
        Access your saved palettes and settings. Don’t have an account?{" "}
        <a href="/signup">Sign up</a>.
      </p>

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
          tabIndex={-1}
          ref={errorRef}
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} noValidate>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            required
            disabled={submitting}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label d-flex justify-content-between">
            <span>Password</span>
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </label>
          <input
            id="password"
            type={showPw ? "text" : "password"}
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={submitting}
          />
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input
              id="remember"
              type="checkbox"
              className="form-check-input"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={submitting}
            />
            <label htmlFor="remember" className="form-check-label">
              Remember me
            </label>
          </div>
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={goToForgotPassword}
            disabled={submitting}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={submitting || !email || !password}
          aria-busy={submitting ? "true" : "false"}
        >
          {submitting ? "Logging in…" : "Login"}
        </button>
      </form>

      <div className="my-3 d-flex align-items-center">
        <hr className="flex-grow-1" />
        <span className="mx-2 text-muted">or</span>
        <hr className="flex-grow-1" />
      </div>

      <button
        className="btn btn-outline-primary w-100"
        onClick={handleGoogleLogin}
        disabled={submitting}
        aria-busy={submitting ? "true" : "false"}
      >
        {submitting ? "Please wait…" : "Continue with Google"}
      </button>

      {/* Optional: small privacy note */}
      <p className="text-muted mt-3" style={{ fontSize: 12 }}>
        This site is protected by reCAPTCHA and the Google{" "}
        <a href="https://policies.google.com/privacy">Privacy Policy</a> and{" "}
        <a href="https://policies.google.com/terms">Terms of Service</a> apply.
      </p>
    </section>
  );
};

export default Login;
