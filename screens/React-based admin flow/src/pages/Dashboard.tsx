import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import logo from '../assets/react.svg';
import { FaTachometerAlt, FaUsers, FaSchool, FaUserGraduate, FaBell, FaSignOutAlt, FaSearch } from 'react-icons/fa';
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = [
    { label: 'Admissions', value: 4, color: '#ff7a00', route: '/admissions/1', icon: <FaTachometerAlt /> },
    { label: 'Schools', value: 2, color: '#2979ff', route: '/school-verification/1', icon: <FaSchool /> },
    { label: 'Students', value: 1, color: '#00c853', route: '/student-verification/1', icon: <FaUserGraduate /> },
    { label: 'Pending', value: 1, color: '#ffb300', route: '/pending/1', icon: <FaUsers /> },
  ];
  const recent = [
    { id: 1, name: 'Jane Doe', school: 'Kimana Girls School', status: 'Pending', date: '2025-07-01', details: 'Application for Form 1, 2025.' },
    { id: 2, name: 'Rajombol Siayho', school: 'Maasai Primary School', status: 'Approved', date: '2025-07-02', details: 'Application for Form 2, 2025.' },
    { id: 3, name: 'Amina Njeri', school: 'Nairobi High', status: 'In Progress', date: '2025-07-03', details: 'Application for Form 1, 2025.' },
  ];

  const [modalApplicant, setModalApplicant] = React.useState(null as null | typeof recent[0]);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')}>
          <img src={logo} alt="RED(P) Logo" />
          <span>RED(P) Admin</span>
        </div>
        <nav className="sidebar-nav">
          <button onClick={() => navigate('/dashboard')}><FaTachometerAlt /> Dashboard</button>
          <button onClick={() => navigate('/applicants')}><FaUsers /> Applicants</button>
          <button onClick={() => navigate('/admissions/1')}><FaTachometerAlt /> Admissions</button>
          <button onClick={() => navigate('/school-verification/1')}><FaSchool /> Schools</button>
          <button onClick={() => navigate('/student-verification/1')}><FaUserGraduate /> Students</button>
          <button onClick={() => navigate('/pending/1')}><FaUsers /> Pending</button>
          <button onClick={() => navigate('/notifications')}><FaBell /> Notifications</button>
          <button onClick={() => navigate('/profile')}><FaUsers /> Profile</button>
          <button className="sidebar-logout"><FaSignOutAlt /> Logout</button>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-search">
            <FaSearch />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="admin-topbar-actions">
            <button className="dashboard-icon-btn" title="Notifications" onClick={() => navigate('/notifications')}><FaBell /></button>
            <button className="dashboard-avatar-btn" title="Profile" onClick={() => navigate('/profile')}>
              <span className="dashboard-avatar">AD</span>
            </button>
          </div>
        </header>
        <section className="dashboard-summary">
          {stats.map((stat) => (
            <div
              className="dashboard-summary-card"
              key={stat.label}
              style={{ borderColor: stat.color, cursor: 'pointer' }}
              onClick={() => navigate(stat.route)}
              tabIndex={0}
              role="button"
              aria-label={`Go to ${stat.label}`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(stat.route); }}
            >
              <div className="dashboard-summary-icon" style={{ color: stat.color }}>{stat.icon}</div>
              <div className="dashboard-summary-value" style={{ color: stat.color }}>{stat.value}</div>
              <div className="dashboard-summary-label">{stat.label}</div>
            </div>
          ))}
        </section>
        <section className="dashboard-actions">
          <button className="dashboard-action-btn primary" onClick={() => navigate('/admissions/1')}>📝 New Admission</button>
          <button className="dashboard-action-btn" onClick={() => navigate('/school-verification/1')}>📋 Verify School</button>
          <button className="dashboard-action-btn" onClick={() => navigate('/notifications')}>📢 Notify</button>
        </section>
        <section className="dashboard-recent-table">
          <div className="dashboard-table-header">
            <h2>Recent Applications</h2>
            <button className="dashboard-viewall-btn" onClick={() => navigate('/applicants')}>View All</button>
          </div>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>School</th>
                <th>Status</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.school}</td>
                  <td><span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                  <td>{item.date}</td>
                  <td><button className="dashboard-table-link" onClick={() => setModalApplicant(item)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      {modalApplicant && (
        <div className="modal-overlay" onClick={() => setModalApplicant(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalApplicant(null)}>&times;</button>
            <h3>Applicant Details</h3>
            <div><strong>Name:</strong> {modalApplicant.name}</div>
            <div><strong>School:</strong> {modalApplicant.school}</div>
            <div><strong>Status:</strong> <span className={`status-badge ${modalApplicant.status.toLowerCase().replace(' ', '-')}`}>{modalApplicant.status}</span></div>
            <div><strong>Date:</strong> {modalApplicant.date}</div>
            <div><strong>Details:</strong> {modalApplicant.details}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
