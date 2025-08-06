import React, { useState, useEffect } from "react";
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/msalConfig';
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import logo from "../assets/redp-logo.png";
import "./LandingLoginPage.css";

const PRIMARY = "#ff3d00"; // REDP Red
const ACCENT = "#ff9800"; // REDP Orange
const BG = "#fff"; // White background

const LandingLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUserEmail } = useUser();
  const msalInstance = new PublicClientApplication(msalConfig);
  const [msalError, setMsalError] = useState("");
  const [loading, setLoading] = useState(true);

  // Try silent login on mount
  useEffect(() => {
    const checkAccounts = async () => {
      try {
        await msalInstance.initialize();
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          setUserEmail(accounts[0].username);
          navigate("/dashboard");
        }
      } catch (err) {
        // Ignore, just show login
      } finally {
        setLoading(false);
      }
    };
    checkAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // MSAL Microsoft login handler
  const handleMicrosoftLogin = async () => {
    setMsalError("");
    try {
      setLoading(true);
      await msalInstance.initialize();
      // Try silent login first
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        try {
          const silentResponse = await msalInstance.acquireTokenSilent({ scopes: ["User.Read"], account: accounts[0] });
          setUserEmail(silentResponse.account.username);
          navigate("/dashboard");
          return;
        } catch (silentError) {
          // Fallback to popup
        }
      }
      // Popup login
      const loginResponse = await msalInstance.loginPopup({ scopes: ["User.Read"] });
      if (loginResponse && loginResponse.account) {
        setUserEmail(loginResponse.account.username);
        navigate("/dashboard");
      }
    } catch (err) {
      let message = "Microsoft login failed. Please try again.";
      const errorObj = err as any;
      if (errorObj && errorObj.errorMessage) {
        message = errorObj.errorMessage;
      } else if (errorObj && errorObj.message) {
        message = errorObj.message;
      }
      setMsalError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-login-root" style={{ background: BG }}>
      <div className="landing-section">
        <img src={logo} alt="RED(P) Logo" className="landing-logo" />
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          color: '#222',
          fontSize: '2.5rem',
          marginBottom: 8,
          letterSpacing: 1.5
        }}>
          Welcome to <span style={{ color: PRIMARY, fontFamily: 'inherit' }}>RED(P)</span> <span style={{ color: ACCENT, fontFamily: 'inherit' }}>Admin</span>
        </h1>
        <p>
          Admins must sign in with Microsoft Entra ID to access the dashboard.
        </p>
        <ul className="landing-features">
          <li>
            <span className="feature-dot" style={{ background: PRIMARY }} /> <span style={{color: '#222', fontWeight: 600}}>Fast, secure admissions</span>
          </li>
          <li>
            <span className="feature-dot" style={{ background: ACCENT }} /> <span style={{color: '#222', fontWeight: 600}}>Easy student & document verification</span>
          </li>
          <li>
            <span className="feature-dot" style={{ background: '#222' }} /> <span style={{color: ACCENT, fontWeight: 600}}>Real-time notifications</span>
          </li>
        </ul>
      </div>
      <div className="login-section">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {loading && <div className="login-error">Checking login status...</div>}
          {msalError && <div className="login-error">{msalError}</div>}
          {!loading && (
            <button
              type="button"
              className="login-btn"
              style={{
                background: '#0078d4',
                color: '#fff',
                border: '1.5px solid #0078d4',
                borderRadius: 6,
                padding: '0.8rem 0',
                fontWeight: 700,
                fontSize: '1.1rem',
                marginTop: '1.5rem',
                width: '80%',
                transition: 'background 0.2s, border-color 0.2s',
                cursor: 'pointer'
              }}
              onClick={handleMicrosoftLogin}
            >
              Sign in with Microsoft
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingLoginPage;