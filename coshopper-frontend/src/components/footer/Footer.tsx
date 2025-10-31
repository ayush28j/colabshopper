import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="url(#gradient-footer)"/>
                <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient-footer" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#667eea"/>
                    <stop offset="100%" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="footer-brand">CoShopper</span>
            </div>
            <p className="footer-description">
              Making collaborative shopping lists simple and fun. 
              Shop together, save together.
            </p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Connect</h3>
            <div className="social-links">
              <a href="#twitter" aria-label="Twitter" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="#facebook" aria-label="Facebook" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="#instagram" aria-label="Instagram" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="white"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} CoShopper. All rights reserved.</p>
          <p className="footer-tagline">Built with ❤️ for collaborative shopping</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

