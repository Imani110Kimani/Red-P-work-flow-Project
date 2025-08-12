import React, { useState } from 'react';
import './Sidebar.css';

const navLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'Applicants', path: '/applicants' },
  { label: 'Admins', path: '/admins' },
  { label: 'Notifications', path: '/notifications' },
  { label: 'Profile', path: '/profile' },
];

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="sidebar-hamburger"
        aria-label="Open navigation menu"
        onClick={() => setOpen(!open)}
      >
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>
      <nav className={`sidebar-nav${open ? ' open' : ''}`}>
        <ul>
          {navLinks.map(link => (
            <li key={link.path}>
              <a href={link.path} onClick={() => setOpen(false)}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}
    </>
  );
};

export default Sidebar;
