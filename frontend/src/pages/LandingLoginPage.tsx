import React, { useState, useEffect } from "react";
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../config/msalConfig';
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import logo from "../assets/redp-logo.png";
import ConfirmationCode from "./ConfirmationCode";
import "./LandingLoginPage.css";

const PRIMARY = "#ff3d00"; // REDP Red
const ACCENT = "#ff9800"; // REDP Orange
const BG = "#fff"; // White background

const msalInstance = new PublicClientApplication(msalConfig);

const LandingLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUserEmail, setUserName, setUserPhoto } = useUser();
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
  const sendVerificationCode = async (email?: string) => {
    const emailToUse = email || userEmailFromEntra;
    if (!emailToUse) {
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
          email: emailToUse
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
      
      let userEmail: string | null = null;
      
      console.log("=== MSAL Login Debug ===");
      
      // Try silent login first
      const accounts = msalInstance.getAllAccounts();
      console.log("Available accounts:", accounts.length, accounts);
      
      if (accounts.length > 0) {
        // Try to get email from existing account first
        const account = accounts[0];
        console.log("Account object:", account);
        console.log("Account username:", account.username);
        console.log("Account name:", account.name);
        console.log("Account localAccountId:", account.localAccountId);
        
        userEmail = account.username;
        console.log("Email from existing account:", userEmail);
        
        if (!userEmail) {
          try {
            console.log("Username not available, attempting silent token acquisition...");
            const silentResponse = await msalInstance.acquireTokenSilent({ 
              scopes: loginRequest.scopes, 
              account: account 
            });
            console.log("Silent response:", silentResponse);
            console.log("Silent response account:", silentResponse.account);
            userEmail = silentResponse.account?.username;
            console.log("Email from silent response:", userEmail);
          } catch (silentError) {
            console.log("Silent login failed:", silentError);
            console.log("Attempting popup login...");
            
            try {
              const loginResponse = await msalInstance.loginPopup(loginRequest);
              console.log("Popup login response:", loginResponse);
              console.log("Popup login account:", loginResponse.account);
              userEmail = loginResponse.account?.username;
              console.log("Email from popup login:", userEmail);
            } catch (popupError) {
              console.error("Popup login failed:", popupError);
              throw popupError;
            }
          }
        }
      } else {
        console.log("No existing accounts, performing popup login...");
        try {
          const loginResponse = await msalInstance.loginPopup(loginRequest);
          console.log("Fresh popup login response:", loginResponse);
          console.log("Fresh popup login account:", loginResponse.account);
          userEmail = loginResponse.account?.username;
          console.log("Email from fresh popup login:", userEmail);
        } catch (popupError) {
          console.error("Fresh popup login failed:", popupError);
          throw popupError;
        }
      }

      console.log("=== Final Results ===");
      console.log("Final extracted user email:", userEmail);
      
      // Ensure we have a valid email
      if (!userEmail) {
        console.error("No user email extracted from any login method");
        console.log("Attempting Microsoft Graph API call to get user profile...");
        
        try {
          // Get an access token for Microsoft Graph
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            const tokenResponse = await msalInstance.acquireTokenSilent({
              scopes: ["User.Read"],
              account: accounts[0]
            });
            
            // Call Microsoft Graph API to get user profile
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
              headers: {
                'Authorization': `Bearer ${tokenResponse.accessToken}`
              }
            });
            
            if (response.ok) {
              const userProfile = await response.json();
              console.log("Microsoft Graph user profile:", userProfile);
              userEmail = userProfile.mail || userProfile.userPrincipalName;
              console.log("Email from Graph API:", userEmail);
            } else {
              console.error("Graph API call failed:", response.status, response.statusText);
            }
          }
        } catch (graphError) {
          console.error("Microsoft Graph API call failed:", graphError);
        }
        
        // Let's try one more time to get accounts after login
        if (!userEmail) {
          const finalAccounts = msalInstance.getAllAccounts();
          console.log("Final accounts check:", finalAccounts);
          if (finalAccounts.length > 0) {
            userEmail = finalAccounts[0].username;
            console.log("Email from final accounts check:", userEmail);
          }
        }
        
        if (!userEmail) {
          setMsalError("No user email available from Entra ID login. Please check browser console for debug information and try again.");
          setLoading(false);
          return;
        }
      }

      console.log("Successfully extracted email:", userEmail);
      
      // Step 1: Verify the user is an admin
      const isValidAdmin = await verifyAdminCredentials(userEmail);
      
      if (!isValidAdmin) {
        setMsalError("Access denied. This email is not authorized as an admin.");
        setLoading(false);
        return;
      }

      // Step 2: Fetch user profile and photo from Microsoft Graph
  let userName: string | null = null;
      let userPhoto: string | null = null;
      try {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ["User.Read"],
            account: accounts[0]
          });
          // Fetch profile
          const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { 'Authorization': `Bearer ${tokenResponse.accessToken}` }
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            userName = profile.displayName || profile.givenName || profile.surname || null;
          }
          // Fetch photo (returns binary, convert to base64)
          const photoRes = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
            headers: { 'Authorization': `Bearer ${tokenResponse.accessToken}` }
          });
          if (photoRes.ok) {
            const blob = await photoRes.blob();
            userPhoto = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        }
      } catch (e) {
        console.warn('Could not fetch user profile/photo from Microsoft Graph:', e);
      }

      // Step 3: Store email, name, photo and initiate verification code process
      setUserEmailFromEntra(userEmail);
      // Fallback: if userName is null/empty, use the part before '@' from email
      let fallbackName = userName;
      if (!fallbackName && userEmail) {
        fallbackName = userEmail.split('@')[0];
      }
      setUserName(fallbackName);
      setUserPhoto(userPhoto);

      // Step 4: Send verification code (pass email directly to avoid state timing issues)
      const codeSuccess = await sendVerificationCode(userEmail);
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