import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import LoginModal from '../../modals/login/LoginModal';
import { getCurrentUser, isLoggedIn, clearTokens } from '../../utils/api';
import logo from '../../logo.svg';

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
                <img src={logo} alt="ColabShopper Logo" width="40" height="40" />
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

