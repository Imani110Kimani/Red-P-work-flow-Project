import React, { useState, useEffect } from "react";
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/msalConfig';
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import logo from "../assets/redp-logo.png";
import ConfirmationCode from "./ConfirmationCode";
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userEmailFromEntra, setUserEmailFromEntra] = useState<string | null>(null);
  const [codeTimestamp, setCodeTimestamp] = useState<number | null>(null);

  // Try silent login on mount
  useEffect(() => {
    const checkAccounts = async () => {
      try {
        await msalInstance.initialize();
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const userEmail = accounts[0].username;
          
          // Check if this user is still a valid admin
          const isValidAdmin = await verifyAdminCredentials(userEmail);
          
          if (isValidAdmin) {
            // Store email and send verification code
            setUserEmailFromEntra(userEmail);
            const codeSuccess = await sendVerificationCode();
            if (codeSuccess) {
              setShowConfirmation(true);
            }
          } else {
            // Invalid admin, clear accounts and show login
            msalInstance.logoutPopup({ postLogoutRedirectUri: window.location.origin });
          }
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

  // Check if the email is a valid admin user
  const verifyAdminCredentials = async (email: string) => {
    // Allowlist of admin emails - replace with your actual admin emails
    const adminEmails = [
      'simbaabdalla@gmail.com',
      'JustinLee@red-p.org',
      'justin@example.com',
      'imani@example.com',
      'admin@redp.org',
      // Add more admin emails as needed
    ];
    
    // Convert to lowercase for case-insensitive comparison
    const emailLower = email.toLowerCase();
    const isAdmin = adminEmails.some(adminEmail => adminEmail.toLowerCase() === emailLower);
    
    console.log(`Admin verification: ${email} -> ${isAdmin ? 'AUTHORIZED' : 'DENIED'}`);
    return isAdmin;
  };

  // Send verification code to the admin's email
  const sendVerificationCode = async () => {
    if (!userEmailFromEntra) {
      setMsalError("No user email available from Entra ID login.");
      return false;
    }

    setLoading(true);
    setMsalError("");

    try {
      const response = await fetch('https://simbaemailverificationapi-g4g4f9cfgtgtfsbu.westus-01.azurewebsites.net/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmailFromEntra
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.code && data.email_sent) {
          setCodeTimestamp(Date.now());
          return true;
        } else {
          setMsalError("Failed to generate verification code. Please try again.");
          return false;
        }
      } else {
        const errorData = await response.json().catch(() => null);
        setMsalError(errorData?.message || "Email verification service unavailable. Please try again later.");
        return false;
      }
    } catch (error) {
      console.error('Verification code generation error:', error);
      setMsalError("Network error. Please check your connection and try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle successful email verification
  const handleConfirmationSuccess = () => {
    if (userEmailFromEntra) {
      setUserEmail(userEmailFromEntra);
      navigate("/dashboard");
    }
  };

  // MSAL Microsoft login handler
  const handleMicrosoftLogin = async () => {
    setMsalError("");
    try {
      setLoading(true);
      await msalInstance.initialize();
      
      // Try silent login first
      const accounts = msalInstance.getAllAccounts();
      let loginResponse;
      
      if (accounts.length > 0) {
        try {
          const silentResponse = await msalInstance.acquireTokenSilent({ scopes: ["User.Read"], account: accounts[0] });
          loginResponse = { account: silentResponse.account };
        } catch (silentError) {
          // Fallback to popup
          loginResponse = await msalInstance.loginPopup({ scopes: ["User.Read"] });
        }
      } else {
        // Popup login
        loginResponse = await msalInstance.loginPopup({ scopes: ["User.Read"] });
      }

      if (loginResponse && loginResponse.account) {
        const userEmail = loginResponse.account.username;
        
        // Step 1: Verify the user is an admin
        const isValidAdmin = await verifyAdminCredentials(userEmail);
        
        if (!isValidAdmin) {
          setMsalError("Access denied. This email is not authorized as an admin.");
          setLoading(false);
          return;
        }

        // Step 2: Store email and initiate verification code process
        setUserEmailFromEntra(userEmail);
        
        // Step 3: Send verification code
        const codeSuccess = await sendVerificationCode();
        if (codeSuccess) {
          setShowConfirmation(true);
        }
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

  // Show confirmation code if we're in that step
  if (showConfirmation && userEmailFromEntra) {
    return (
      <div className="landing-login-root" style={{ background: BG }}>
        <div className="login-section" style={{ flex: 1, width: "100vw", justifyContent: "center", alignItems: "center", display: "flex" }}>
          <ConfirmationCode 
            onSuccess={handleConfirmationSuccess} 
            email={userEmailFromEntra} 
            codeTimestamp={codeTimestamp}
            onResend={sendVerificationCode}
          />
        </div>
      </div>
    );
  }

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
          Admins must sign in with Microsoft Entra ID and complete email verification to access the dashboard.
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
          {loading && <div className="login-error">Checking login status and admin permissions...</div>}
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