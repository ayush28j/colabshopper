import React, { useEffect, useState } from 'react';
import './home.css';
import CreateListModal from '../../modals/create-list/CreateListModal';
import LoginModal from '../../modals/login/LoginModal';
import { isLoggedIn } from '../../utils/api';

const Home: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [shouldShowCreateAfterLogin, setShouldShowCreateAfterLogin] = useState(false);

  const handleLoginRequired = () => {
    setShouldShowCreateAfterLogin(true);
    setShowLoginModal(true);
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    if (shouldShowCreateAfterLogin && isLoggedIn()) {
      setShowCreateModal(true);
    }
    setShouldShowCreateAfterLogin(false);
  };

  useEffect(() => {
    const onAuthChanged = () => {
      // If auth changes while modal open, close login and possibly open create
      if (showLoginModal) {
        handleLoginClose();
      }
    };
    window.addEventListener('auth:changed', onAuthChanged as EventListener);
    return () => window.removeEventListener('auth:changed', onAuthChanged as EventListener);
  }, [showLoginModal, shouldShowCreateAfterLogin]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Shop Together,
              <span className="gradient-text"> Save Together</span>
            </h1>
            <p className="hero-subtitle">
              Create collaborative shopping lists with friends and family. 
              Share, organize, and shop smarter together.
            </p>
            <button 
              className="cta-button"
              onClick={() => setShowCreateModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Create Shopping List
            </button>
          </div>
          
          <div className="hero-illustration">
            <div className="floating-card card-1">
              <div className="card-icon">🛒</div>
              <div className="card-text">Groceries</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">🎉</div>
              <div className="card-text">Party Supplies</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">🏠</div>
              <div className="card-text">Home Items</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Why Choose CoShopper?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Collaborate in Real-Time</h3>
              <p>Shop with friends and family. Everyone sees updates instantly.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Easy Organization</h3>
              <p>Create multiple lists, categorize items, and track what's needed.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Secure & Private</h3>
              <p>Your lists are private and only shared with people you invite.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create a List</h3>
              <p>Start by creating a new shopping list for any occasion.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Invite Others</h3>
              <p>Share your list with friends or family members.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Shop Together</h3>
              <p>Add items, check them off, and collaborate in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Start Shopping Smarter?</h2>
          <p>Create your first collaborative shopping list today!</p>
          <button 
            className="cta-button secondary"
            onClick={() => setShowCreateModal(true)}
          >
            Get Started Now
          </button>
        </div>
      </section>

      <CreateListModal 
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLoginRequired={handleLoginRequired}
      />

      <LoginModal 
        show={showLoginModal}
        onClose={handleLoginClose}
      />
    </div>
  );
};

export default Home;

