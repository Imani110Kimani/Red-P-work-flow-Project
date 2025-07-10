import React from 'react';
import './AdminProfile.css';
import logo from '../assets/react.svg'; // Replace with your actual logo path

const AdminProfile: React.FC = () => {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={logo} alt="Admin Avatar" className="profile-avatar" />
        <div>
          <h2 className="profile-name">Admin User</h2>
          <div className="profile-role">System Administrator</div>
        </div>
      </div>
      <div className="profile-details">
        <div><strong>Email:</strong> admin@redp.com</div>
        <div><strong>Phone:</strong> +254 700 000000</div>
        <div><strong>Last Login:</strong> 2025-07-10 09:00</div>
      </div>
    </div>
  );
};

export default AdminProfile;
