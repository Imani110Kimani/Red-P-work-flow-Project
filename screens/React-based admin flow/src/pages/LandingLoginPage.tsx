import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/redp-logo (2).png";
import ConfirmationCode from "./ConfirmationCode";
import "./LandingLoginPage.css";

const PRIMARY = "#ff3d00"; // REDP Red
const ACCENT = "#ff9800"; // REDP Orange
const BG = "#fff"; // White background

const LandingLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [idImage, setIdImage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeTimestamp, setCodeTimestamp] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const sendVerificationCode = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Call Power Automate flow to generate and send code
      const response = await fetch('https://prod-112.westus.logic.azure.com:443/workflows/e103eb24d613469abfd4180e12a25b93/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=e5Kt_H9u3KqBmou7PCtZkOlJVBkaiRwuSNQjerNeICg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: email
        })
      });

      if (response.ok) {
        const responseText = await response.text();
        
        let data;
        let code = '';
        
        try {
          // Clean the response text of control characters before parsing
          const cleanedText = responseText.replace(/[\x00-\x1F\x7F]/g, '');
          data = JSON.parse(cleanedText);
        } catch (parseError) {
          // If JSON parsing fails, try to extract the code directly from the response
          // Try different patterns for 6-character codes
          const patterns = [
            /[A-Z0-9]{6}/g,           // 6 alphanumeric characters
            /[A-Z]{6}/g,              // 6 letters
            /[0-9]{6}/g,              // 6 numbers
            /"([A-Z0-9]{6})"/g,       // 6 characters in quotes
            /:\s*"([A-Z0-9]{6})"/g    // 6 characters after colon and quotes
          ];
          
          for (const pattern of patterns) {
            const matches = responseText.match(pattern);
            if (matches && matches.length > 0) {
              code = matches[0].replace(/[^A-Z0-9]/g, ''); // Clean any extra characters
              break;
            }
          }
          
          if (!code) {
            // If no pattern matches, try to get any 6-character string
            const trimmed = responseText.trim();
            if (trimmed.length === 6 && /^[A-Z0-9]+$/.test(trimmed)) {
              code = trimmed;
            }
          }
        }
        
        // Handle different possible response formats if JSON parsing succeeded
        if (data && !code) {
          if (typeof data === 'string') {
            code = data.trim();
          } else if (data.confirmationCode && typeof data.confirmationCode === 'string') {
            code = data.confirmationCode.trim();
          } else if (data.code && typeof data.code === 'string') {
            code = data.code.trim();
          } else if (data.value && typeof data.value === 'string') {
            code = data.value.trim();
          }
        }
        
        if (code && code.length >= 4) { // Accept codes that are at least 4 characters
          setGeneratedCode(code);
          setCodeTimestamp(Date.now());
          return true;
        } else {
          setError("Failed to extract verification code from response.");
          return false;
        }
      } else {
        setError("Authentication service unavailable. Please try again later.");
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Network error. Please check your connection and try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password || !idImage) {
      setError("Please provide valid credentials and upload or capture your ID.");
      return;
    }

    // Validate accepted credentials
    if ((email !== "justinlee@red-p.org" && email !== "admin@redp.com") || password !== "admin123") {
      setError("Invalid email or password. Please try again.");
      return;
    }

    const success = await sendVerificationCode();
    if (success) {
      setShowConfirmation(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setIdImage(ev.target?.result as string);
      reader.readAsDataURL(file);
      setError("");
    } else {
      setError("Please upload a valid image file.");
    }
  };

  const handleConfirmationSuccess = () => {
    navigate("/dashboard");
  };

  if (showConfirmation) {
    return (
      <div className="landing-login-root" style={{ background: BG }}>
        <div className="login-section" style={{ flex: 1, width: "100vw", justifyContent: "center", alignItems: "center", display: "flex" }}>
          <ConfirmationCode 
            onSuccess={handleConfirmationSuccess} 
            email={email} 
            expectedCode={generatedCode}
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
          Streamline student admissions, verification, and notifications with a modern, secure workflow.
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
        <form className="login-form" onSubmit={handleLogin}>
          <h2 style={{ color: PRIMARY, fontFamily: "'Playfair Display', serif", fontWeight: 800 }}>Admin Login</h2>
          {error && <div className="login-error">{error}</div>}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="justinlee@red-p.org"
              style={{ borderColor: ACCENT }}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{ borderColor: ACCENT }}
            />
          </label>
          <label>
            Upload or Capture ID
            <div className="id-upload-row">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                ref={cameraInputRef}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="id-upload-btn"
                style={{
                  background: PRIMARY,
                  color: "#fff",
                  border: `1.5px solid ${PRIMARY}`,
                  borderRadius: 6,
                  padding: "0.5rem 1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s, border-color 0.2s"
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload ID
              </button>
              <button
                type="button"
                className="id-upload-btn"
                style={{
                  background: ACCENT,
                  color: "#fff",
                  border: `1.5px solid ${ACCENT}`,
                  borderRadius: 6,
                  padding: "0.5rem 1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s, border-color 0.2s"
                }}
                onClick={() => cameraInputRef.current?.click()}
              >
                Open Camera
              </button>
              {idImage && (
                <img
                  src={idImage}
                  alt="ID Preview"
                  className="id-preview"
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: "cover",
                    borderRadius: 6,
                    marginLeft: 12,
                    border: `2px solid ${ACCENT}`,
                    background: BG
                  }}
                />
              )}
            </div>
          </label>
          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
            style={{
              background: isLoading ? "#ccc" : PRIMARY,
              color: "#fff",
              border: `1.5px solid ${isLoading ? "#ccc" : PRIMARY}`,
              borderRadius: 6,
              padding: "0.8rem 0",
              fontWeight: 700,
              fontSize: "1.1rem",
              marginTop: "0.5rem",
              transition: "background 0.2s, border-color 0.2s",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Sending code..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingLoginPage;