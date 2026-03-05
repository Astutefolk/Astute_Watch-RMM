'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';
import './auth.scss';

export default function RegisterPage() {
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    organizationName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    return hasUpper && hasLower && hasNumber && isLongEnough;
  };

  const passwordsMatch = password === confirmPassword;

  // Only validate if field has content
  const isOrgValid = organizationName ? organizationName.length >= 2 : false;
  const isEmailValid = email ? validateEmail(email) : false;
  const isPasswordValid = password ? validatePassword(password) : false;
  const isConfirmPasswordValid = confirmPassword ? passwordsMatch : false;

  // Button is enabled only if all fields are filled AND valid
  const isFormValid = 
    organizationName && 
    email && 
    password && 
    confirmPassword && 
    isOrgValid && 
    isEmailValid && 
    isPasswordValid && 
    isConfirmPasswordValid;

  const passwordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthLabel = () => {
    const strength = passwordStrength();
    if (strength <= 1) return { label: 'Weak', color: 'weak' };
    if (strength <= 2) return { label: 'Fair', color: 'fair' };
    if (strength <= 3) return { label: 'Good', color: 'good' };
    if (strength <= 4) return { label: 'Strong', color: 'strong' };
    return { label: 'Very Strong', color: 'very-strong' };
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.register(email, password, organizationName);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);

      // Show API key in a modal or secure way
      alert(`Your API Key: ${data.apiKey}\n\nSave this securely! You'll need it for agents.`);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">◆</div>
            </div>
            <h1 className="auth-title">Join DATTO RMM</h1>
            <p className="auth-subtitle">Create Your Command Center</p>
          </div>

          {error && (
            <div className="auth-alert alert-error">
              <span className="alert-icon">⚠</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="organizationName" className="form-label">
                Organization Name
              </label>
              <div className="input-wrapper">
                <input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  onBlur={() =>
                    setTouched({ ...touched, organizationName: true })
                  }
                  className={`form-input ${
                    touched.organizationName && organizationName && !isOrgValid ? 'error' : ''
                  }`}
                  placeholder="Your Company Name"
                  required
                />
                {touched.organizationName && organizationName && !isOrgValid && (
                  <span className="input-error">Minimum 2 characters required</span>
                )}
              </div>
            </div>

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
                  placeholder="you@company.com"
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
                {password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`strength-bar ${
                            i < passwordStrength() ? strengthLabel().color : ''
                          }`}
                        ></div>
                      ))}
                    </div>
                    <span className={`strength-label ${strengthLabel().color}`}>
                      {strengthLabel().label}
                    </span>
                  </div>
                )}
                {touched.password && password && !isPasswordValid && (
                  <span className="input-error">
                    Min 8 chars with uppercase, lowercase, and number
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  className={`form-input ${
                    touched.confirmPassword && confirmPassword && !isConfirmPasswordValid ? 'error' : ''
                  }`}
                  placeholder="••••••••"
                  required
                />
                {touched.confirmPassword && confirmPassword && !isConfirmPasswordValid && (
                  <span className="input-error">Passwords do not match</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`auth-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <span className="button-loader">
                  <span className="spinner"></span>
                  Creating Account...
                </span>
              ) : (
                <>
                  <span className="button-text">Create Account</span>
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <a href="/login" className="auth-link-button">
            <span>Sign In</span>
            <span className="link-arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
