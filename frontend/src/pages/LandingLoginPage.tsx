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

  // Initialize MSAL on mount (without auto-login check)
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
      } catch (err) {
        console.error('MSAL initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    initializeMsal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if the email is a valid admin user using the admin management API
  const verifyAdminCredentials = async (email: string) => {
    try {
      console.log(`Verifying admin credentials for: ${email}`);
      
      // Call the admin management API to check if the email exists in the admin table
      const response = await fetch(`https://simbamanageadmins-egambyhtfxbfhabc.westus-01.azurewebsites.net/api/read-admin?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.admin) {
          console.log(`Admin verification: ${email} -> AUTHORIZED (Role: ${data.admin.role})`);
          return true;
        } else {
          console.log(`Admin verification: ${email} -> DENIED (Not found in admin table)`);
          return false;
        }
      } else if (response.status === 404) {
        // Admin not found
        console.log(`Admin verification: ${email} -> DENIED (404 - Not found)`);
        return false;
      } else {
        // Other error - fallback to deny for security
        console.error(`Admin verification API error for ${email}:`, response.status);
        return false;
      }
    } catch (error) {
      console.error('Admin verification network error:', error);
      // In case of network error, deny access for security
      return false;
    }
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
      let userEmail: string | null = null;
      
      if (accounts.length > 0) {
        try {
          const silentResponse = await msalInstance.acquireTokenSilent({ scopes: ["User.Read"], account: accounts[0] });
          // Get email from the account in the silent response
          userEmail = silentResponse.account?.username || accounts[0].username;
        } catch (silentError) {
          console.log("Silent login failed, trying popup:", silentError);
          // Fallback to popup
          const loginResponse = await msalInstance.loginPopup({ scopes: ["User.Read"] });
          userEmail = loginResponse.account?.username;
        }
      } else {
        // Popup login
        const loginResponse = await msalInstance.loginPopup({ scopes: ["User.Read"] });
        userEmail = loginResponse.account?.username;
      }

      // Ensure we have a valid email
      if (!userEmail) {
        setMsalError("No user email available from Entra ID login. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Extracted user email:", userEmail);
      
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