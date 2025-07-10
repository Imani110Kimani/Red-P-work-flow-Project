import React from 'react';
import './Notifications.css';

const notifications = [
  { id: 1, message: 'New application received from Jane Doe.', date: '2025-07-10' },
  { id: 2, message: 'School verification approved for Maasai Primary School.', date: '2025-07-09' },
  { id: 3, message: 'Student verification completed for Amina Njeri.', date: '2025-07-08' },
];

const Notifications: React.FC = () => {
  return (
    <div className="notifications-container">
      <h2 className="notifications-title">Notifications</h2>
      <div className="notifications-list">
        {notifications.map((n) => (
          <div className="notification-item" key={n.id}>
            <div className="notification-message">{n.message}</div>
            <div className="notification-date">{n.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
