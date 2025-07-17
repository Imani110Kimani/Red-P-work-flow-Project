import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/redp-logo.png";
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@redp.com" && password === "admin123" && idImage) {
      setShowConfirmation(true);
      setError("");
    } else {
      setError("Please provide valid credentials and upload or capture your ID.");
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
          <ConfirmationCode onSuccess={handleConfirmationSuccess} email={email} />
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
              placeholder="admin@redp.com"
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
            style={{
              background: PRIMARY,
              color: "#fff",
              border: `1.5px solid ${PRIMARY}`,
              borderRadius: 6,
              padding: "0.8rem 0",
              fontWeight: 700,
              fontSize: "1.1rem",
              marginTop: "0.5rem",
              transition: "background 0.2s, border-color 0.2s"
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingLoginPage;