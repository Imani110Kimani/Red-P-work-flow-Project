import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/redp-logo.png';
import './HeaderBar.css';

const HeaderBar: React.FC = () => (
  <header className="header-bar">
    <div className="header-logo">
      <img src={logo} alt="RED(P) Logo" />
    </div>
    <nav className="header-nav">
      <Link to="/" className="header-link">About</Link>
      <Link to="/team" className="header-link">Team</Link>
      <Link to="/service" className="header-link">Service</Link>
      <Link to="/gallery" className="header-link">Gallery</Link>
      <Link to="/causes" className="header-link">Causes</Link>
      <Link to="/news" className="header-link">News</Link>
      <Link to="/events" className="header-link">Events</Link>
      <Link to="/contact" className="header-link">Contact</Link>
    </nav>
    <a href="#donate" className="header-donate-btn">DONATE NOW</a>
  </header>
);

export default HeaderBar;
