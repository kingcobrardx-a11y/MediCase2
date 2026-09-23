import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navbar Component
 * Renders the top navigation bar with the MediCase branding and portal links.
 */
export default function Navbar() {
  const location = useLocation();

  const isIntakeActive =
    location.pathname === '/' ||
    location.pathname.startsWith('/intake') ||
    location.pathname === '/case-summary';

  const isDashboardActive =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/review');

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo & Title */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <span>MediCase</span>
        </Link>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <Link
            to="/intake/patient-details"
            className={`nav-link ${isIntakeActive && location.pathname !== '/' ? 'active' : ''}`}
          >
            New Patient Case
          </Link>

          <Link
            to="/dashboard"
            className={`nav-link ${isDashboardActive ? 'active' : ''}`}
          >
            Doctor Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
