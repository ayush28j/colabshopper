import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import LoginModal from '../../modals/login/LoginModal';
import { getCurrentUser, isLoggedIn, clearTokens } from '../../utils/api';

const Header: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (!isLoggedIn()) {
        setUserName(null);
        return;
      }
      try {
        const user = await getCurrentUser();
        setUserName(user.name);
      } catch {
        setUserName(null);
      }
    };
    loadUser();
    const onAuthChanged = () => loadUser();
    window.addEventListener('auth:changed', onAuthChanged as EventListener);
    return () => window.removeEventListener('auth:changed', onAuthChanged as EventListener);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearTokens();
    setUserName(null);
    setShowDropdown(false);
    navigate('/');
    window.dispatchEvent(new CustomEvent('auth:changed'));
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="logo-section">
            <Link to="/" className="logo-link">
              <div className="logo">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
                  <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                      <stop offset="0%" stopColor="#667eea"/>
                      <stop offset="100%" stopColor="#764ba2"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="brand-name">ColabShopper</span>
            </Link>
          </div>

          <nav className="nav-links">
            <Link to="/faq" className="nav-link">FAQ</Link>
            <Link to="/privacy-policy" className="nav-link">Privacy Policy</Link>
            {userName ? (
              <div className="user-dropdown-container" ref={dropdownRef}>
                <button 
                  className="user-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  Hi, {userName.split(' ')[0]} ▼
                </button>
                {showDropdown && (
                  <div className="user-dropdown">
                    <Link 
                      to="/my-lists" 
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      📋 My Lists
                    </Link>
                    <Link 
                      to="/my-profile" 
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      👤 My Profile
                    </Link>
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="login-btn"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      <LoginModal 
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Header;

