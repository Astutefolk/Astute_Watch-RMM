'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';
import './auth.scss';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // Only validate if field has content
  const isEmailValid = email ? validateEmail(email) : false;
  const isPasswordValid = password ? validatePassword(password) : false;
  
  // Button is enabled only if both fields are filled AND valid
  const isFormValid = email && password && isEmailValid && isPasswordValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.login(email, password);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="background-orb orb-1"></div>
        <div className="background-orb orb-2"></div>
        <div className="background-orb orb-3"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">◆</div>
            </div>
            <h1 className="auth-title">DATTO RMM</h1>
            <p className="auth-subtitle">Access Your Command Center</p>
          </div>

          {error && (
            <div className="auth-alert alert-error">
              <span className="alert-icon">⚠</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`form-input ${touched.email && email && !isEmailValid ? 'error' : ''}`}
                  placeholder="you@example.com"
                  required
                />
                {touched.email && email && !isEmailValid && (
                  <span className="input-error">Please enter a valid email</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className={`form-input ${touched.password && password && !isPasswordValid ? 'error' : ''}`}
                  placeholder="••••••••"
                  required
                />
                {touched.password && password && !isPasswordValid && (
                  <span className="input-error">Minimum 8 characters required</span>
                )}
              </div>
            </div>

            <a href="#" className="forgot-password">
              Forgot password?
            </a>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`auth-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <span className="button-loader">
                  <span className="spinner"></span>
                  Signing in...
                </span>
              ) : (
                <>
                  <span className="button-text">Sign In</span>
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to DATTO?</span>
          </div>

          <a href="/register" className="auth-link-button">
            <span>Create Account</span>
            <span className="link-arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
