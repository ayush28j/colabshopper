import React, { useState } from 'react';
import './LoginModal.css';
import { login as apiLogin, register as apiRegister } from '../../utils/api';

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await apiRegister(name, email, password, country || '');
      } else {
        await apiLogin(email, password);
      }
      window.dispatchEvent(new CustomEvent('auth:changed'));
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="modal-header">
          <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p>{isSignUp ? 'Sign up to start shopping together' : 'Sign in to your account'}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter your country"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {!isSignUp && (
            <div className="forgot-password">
              <a href="#forgot">Forgot password?</a>
            </div>
          )}

          {error && (
            <div className="error-text" role="alert">{error}</div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              className="toggle-mode-btn"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

