
import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './AdminProfile.css';
import logo from '../assets/redp-logo.png';
import { useUser } from '../contexts/UserContext';

const AdminProfile: React.FC = () => {
  const { userName, userEmail, userPhoto, setUserPhoto, logout } = useUser();
  // For demo: super admin and last login (replace with real data if available)
  const isSuperAdmin = true; // TODO: get from context or API
  const lastLogin = '2025-08-08 09:00'; // TODO: get from context or API
  const { darkMode, toggleDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAvatarClick = () => {
    setDropdownOpen((open) => !open);
  };
  const handleCopyEmail = () => {
    if (userEmail) {
      navigator.clipboard.writeText(userEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  // Remove local theme state, useTheme handles it

  const handleChangeProfilePic = () => {
    if (fileInputRef.current) fileInputRef.current.click();
    setDropdownOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDropdownOpen(false);
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  return (
  <div className="dashboard-summary-card" style={{ minWidth: 180, maxWidth: 260, height: 130, margin: '0 18px 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '22px 28px', boxShadow: '0 4px 18px 0 rgba(2,60,105,0.10)', borderRadius: 18, background: 'var(--redp-card)', color: 'var(--redp-text)', transition: 'box-shadow 0.2s, background 0.2s' }}>
      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ff9800', marginBottom: 10 }}>
        {userName
          ? `Welcome ${userName}`
          : <span style={{ color: '#bbb' }}>Welcome <span style={{ fontStyle: 'italic' }}>Loading...</span></span>
        }
      </div>
      <div className="profile-header" style={{ position: 'relative' }}>
        <img
          src={userPhoto || logo}
          alt="Admin Avatar"
          className="profile-avatar"
          style={{ cursor: 'pointer', boxShadow: dropdownOpen ? '0 0 0 3px #ffb22455' : undefined, border: dropdownOpen ? '2px solid #ffb224' : undefined, transition: 'box-shadow 0.2s, border 0.2s' }}
          onClick={handleAvatarClick}
          title="Profile menu"
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {dropdownOpen && (
          <div
            ref={dropdownRef}
            role="menu"
            aria-label="Profile menu"
            style={{
              position: 'absolute',
              top: 70,
              right: 0,
              minWidth: 260,
              background: darkMode ? '#222' : '#fff',
              border: '1px solid #eee',
              borderRadius: 12,
              boxShadow: '0 4px 16px 0 rgba(34,34,34,0.13)',
              zIndex: 100,
              padding: '18px 18px 12px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              animation: 'fadeIn 0.18s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: darkMode ? '#ffb224' : '#e53935' }}>{userName}</span>
              {isSuperAdmin && <span style={{ fontSize: 12, color: '#fff', background: '#e53935', borderRadius: 6, padding: '2px 8px', marginLeft: 4 }}>Super Admin</span>}
            </div>
            <div style={{ color: darkMode ? '#eee' : '#444', fontSize: '0.98rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              {userEmail}
              <button
                onClick={handleCopyEmail}
                style={{ background: 'none', border: 'none', color: '#ff9800', cursor: 'pointer', fontSize: 15, padding: 0 }}
                title="Copy email"
                tabIndex={0}
              >📋</button>
              {copied && <span style={{ color: '#4caf50', fontSize: 13 }}>Copied!</span>}
            </div>
            <div style={{ color: darkMode ? '#bbb' : '#888', fontSize: '0.93rem', marginBottom: 2 }}>Last login: {lastLogin}</div>
            <div style={{ borderTop: '1px solid #eee', margin: '8px 0 8px 0' }} />
            <button
              style={{
                background: '#fff',
                color: '#222',
                border: '1px solid #eee',
                borderRadius: 8,
                padding: '6px 18px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                textAlign: 'left'
              }}
              tabIndex={0}
              // onClick={() => {}}
            >
              My Profile
            </button>
            <button
              style={{
                background: '#fff',
                color: '#222',
                border: '1px solid #eee',
                borderRadius: 8,
                padding: '6px 18px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                textAlign: 'left'
              }}
              tabIndex={0}
              // onClick={() => {}}
            >
              Help
            </button>
            <button
              style={{
                background: darkMode ? '#ffb224' : '#eee',
                color: darkMode ? '#fff' : '#222',
                border: 'none',
                borderRadius: 8,
                padding: '6px 18px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                textAlign: 'left'
              }}
              onClick={toggleDarkMode}
              tabIndex={0}
            >
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
            <div style={{ borderTop: '1px solid #eee', margin: '8px 0 8px 0' }} />
            <button
              style={{
                background: '#ffb224',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 18px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                marginBottom: 4
              }}
              onClick={handleChangeProfilePic}
              tabIndex={0}
            >
              Change Profile Picture
            </button>
            <button
              style={{
                background: '#fff',
                color: '#e53935',
                border: '1px solid #e53935',
                borderRadius: 8,
                padding: '6px 18px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                marginTop: 2
              }}
              onClick={logout}
              tabIndex={0}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
