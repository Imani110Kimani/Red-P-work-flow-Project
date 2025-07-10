import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/react.svg'; // Replace with your actual logo path

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add authentication logic here
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-logo-wrap">
        <img src={logo} alt="RED(P) Logo" className="login-logo" />
      </div>
      <h2 className="login-title">Sign in to RED(P)</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Username or Email" className="login-input" />
        <input type="password" placeholder="Password" className="login-input" />
        <button type="submit" className="login-btn">Login</button>
      </form>
      <div className="login-footer">
        <span>Don&apos;t have an account?</span>
        <Link to="/" className="login-link">Back to Home</Link>
      </div>
    </div>
  );
};

export default Login;
