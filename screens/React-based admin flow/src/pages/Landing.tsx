import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';
import logo from '../assets/react.svg'; // Replace with your actual logo path

const Landing: React.FC = () => {
  return (
    <div className="landing-container">
      <div className="landing-logo-wrap">
        <img src={logo} alt="RED(P) Logo" className="landing-logo" />
      </div>
      <h1 className="landing-title">Welcome to RED(P) Admin Portal</h1>
      <p className="landing-subtitle">A modern, secure, and efficient workflow for admissions and school management.</p>
      <Link to="/login" className="landing-btn">Login</Link>
    </div>
  );
};

export default Landing;
