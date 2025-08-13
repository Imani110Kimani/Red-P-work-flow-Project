import React from 'react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li><span role="img" aria-label="dashboard">🏠</span> Dashboard</li>
        <li><span role="img" aria-label="applicants">📄</span> Applicants</li>
        <li><span role="img" aria-label="admissions">🎓</span> Admissions</li>
        <li><span role="img" aria-label="students">⏳</span> Students</li>
        <li><span role="img" aria-label="admins">🛡️</span> Admins</li>
        <li className="logs"><span role="img" aria-label="logs">📋</span> Logs</li>
        <li><span role="img" aria-label="fee portal">🧾</span> Fee Portal</li>
      </ul>
      <button className="light-mode-btn">🟡 Light Mode On</button>
    </nav>
  );
};

export default Sidebar;
