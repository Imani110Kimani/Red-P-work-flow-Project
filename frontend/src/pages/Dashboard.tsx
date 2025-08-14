import AdminProfile from './AdminProfile';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import redpLogo from '../assets/redp-logo.png';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';

import StudentsTable from './StudentsTable';
import AdmissionsTable from './AdmissionsTable';
import Notifications from './Notifications';
import ApplicantList from './ApplicantList';
import { useApplicantData } from '../contexts/ApplicantDataContext';
import { useAdmins } from '../hooks/useAdmins';


const Dashboard: React.FC = () => {
  // Helper function for stat card colors (Red-P branding)

  // Sidebar button style - must be defined before JSX
  // Sidebar button style is now handled by CSS classes
  // State for sidebar hover
  // (hoveredBtn state removed, now handled by CSS)
  const location = useLocation();
  // Determine active sidebar button based on location
  const getActiveBtn = () => {
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname.includes('/dashboard/applicants')) return 'applicants';
    if (location.pathname.includes('/dashboard/admissions')) return 'admissions';
    if (location.pathname.includes('/dashboard/students')) return 'students';
    if (location.pathname.includes('/dashboard/admins')) return 'admins';
    if (location.pathname.includes('/dashboard/logs')) return 'logs';
    if (location.pathname.includes('/dashboard/fee-portal')) return 'fee-portal';
    return null;
  };
  const activeBtn = getActiveBtn();
  const navigate = useNavigate();
  // (already declared above)
  const { applicants, detailedApplicants } = useApplicantData();
  const { admins, loading: adminsLoading } = useAdmins();


  // Get current admin name from context
  // (userName removed, not used)

  // Filter approved students (status 2 or 'Approved')
  const approvedBasics = applicants.filter(a => String(a.status) === '2' || a.status === 'Approved');

  // Build array of detailed approved students (with all required fields)
  const approvedDetailed = approvedBasics
    .map(a => detailedApplicants[`${a.partitionKey}|${a.rowKey}`])
    .filter(Boolean);

  // Debug logs to help diagnose why approved students may not show
  React.useEffect(() => {
    console.log('Approved basics:', approvedBasics);
    console.log('Approved detailed:', approvedDetailed);
  }, [approvedBasics, approvedDetailed]);

  const isTableRoute =
    location.pathname.includes('/dashboard/applicants') ||
    location.pathname.includes('/dashboard/admissions') ||
    location.pathname.includes('/dashboard/students') ||
    location.pathname.includes('/dashboard/admins') ||
    location.pathname.includes('/dashboard/logs');

  // Always use Outlet for fee-portal route
  const isFeePortalRoute = location.pathname.includes('/dashboard/fee-portal');

  // Calculate real stats from applicants data
  const applicantsCount = applicants.length;
  const admissionsCount = applicants.filter(a => String(a.status) === '1' || a.status === 'Pending').length;
  const studentsCount = applicants.filter(a => String(a.status) === '2' || a.status === 'Approved').length;
  // const adminsCount = admins.length; // Removed duplicate, already declared above
  const adminsCount = admins.length;
  // Extend type for recent applications table
  type ApplicantWithExtras = typeof applicants[number] & { email?: string; schoolName?: string };
  const summaryStats = [
    { label: 'Applicants', value: applicantsCount, icon: '📝', color: '#e53935', route: '/dashboard/applicants', textColor: '#fff' },
    { label: 'Admissions', value: admissionsCount, icon: '🎓', color: '#fff', route: '/dashboard/admissions', textColor: '#222' },
    { label: 'Students', value: studentsCount, icon: '👩‍🎓', color: '#ffb224', route: '/dashboard/students', textColor: '#fff' },
    { label: 'Admins', value: adminsLoading ? '...' : adminsCount, icon: '🛡️', color: '#fff', route: '/dashboard/admins', textColor: '#222' }
  ];

  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <div>
      {/* Slim orange banner filling the top */}
      <div style={{
        width: '100%',
        height: '100px',
        background: darkMode ? '#e53935' : '#ffb224',
        color: darkMode ? '#fff' : '#222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontWeight: 700,
        fontSize: '1.7rem',
        letterSpacing: '0.04em',
        paddingLeft: '25%',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottom: '1px solid #ff7043',
        zIndex: 10,
        boxShadow: '0 2px 8px 0 rgba(229,57,53,0.04)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <img src={redpLogo} alt="REDP logo" style={{ height: 140, width: 140, objectFit: 'contain', background: 'transparent', marginRight: 28, fontWeight: 900, filter: 'drop-shadow(0 2px 8px #e5393555)' }} />
          <span style={{ fontWeight: 900, fontSize: '2.8rem', letterSpacing: '0.04em', color: '#e53935', fontFamily: 'inherit', textShadow: '0 2px 8px #fff, 0 1px 0 #e53935' }}></span>
        </span>
      </div>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{
          width: 220,
          background: darkMode ? 'linear-gradient(180deg, #232526 80%, var(--redp-accent) 100%)' : 'linear-gradient(180deg, #fff 80%, var(--redp-accent) 100%)',
          borderRight: '1px solid #eee',
          padding: '2.5rem 1.2rem 2rem 1.2rem',
          minHeight: '100vh',
          boxShadow: '2px 0 8px 0 rgba(229,57,53,0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 0
        }}>
          <nav className="sidebar-nav">
            {/* ...existing code for sidebar buttons... */}
            <button className={`sidebar-btn${activeBtn === 'dashboard' ? ' active' : ''}`} onClick={() => navigate('/dashboard')}><span role="img" aria-label="dashboard">🏠</span> Dashboard</button>
            <button className={`sidebar-btn${activeBtn === 'applicants' ? ' active' : ''}`} onClick={() => navigate('/dashboard/applicants')}><span role="img" aria-label="applicants">📝</span> Applicants</button>
            <button className={`sidebar-btn${activeBtn === 'admissions' ? ' active' : ''}`} onClick={() => navigate('/dashboard/admissions')}><span role="img" aria-label="admissions">🎓</span> Admissions</button>
            <button className={`sidebar-btn${activeBtn === 'students' ? ' active' : ''}`} onClick={() => navigate('/dashboard/students')}><span role="img" aria-label="students">👩‍🎓</span> Students</button>
            <button className={`sidebar-btn${activeBtn === 'admins' ? ' active' : ''}`} onClick={() => navigate('/dashboard/admins')}><span role="img" aria-label="admins">🛡️</span> Admins</button>
            <button className={`sidebar-btn${activeBtn === 'logs' ? ' active' : ''}`} onClick={() => navigate('/dashboard/logs')}><span role="img" aria-label="logs">📋</span> Logs</button>
            <button className={`sidebar-btn${activeBtn === 'fee-portal' ? ' active' : ''}`} onClick={() => navigate('/dashboard/fee-portal')}><span role="img" aria-label="fee portal">💳</span> Fee Portal</button>
          </nav>
          <button
            style={{
              marginTop: 32,
              background: darkMode ? '#232526' : '#fff',
              color: darkMode ? '#ffb224' : '#e53935',
              border: '1px solid #ffb224',
              borderRadius: 8,
              padding: '10px 0',
              fontWeight: 700,
              fontSize: '1.08em',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
              width: '100%'
            }}
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '🌙 Dark Mode On' : '☀️ Light Mode On'}
          </button>
        </aside>
        {/* Main content */}
        <main style={{ flex: 1, background: 'var(--redp-bg)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: 24, color: 'var(--redp-text)' }}>
          {isFeePortalRoute ? (
            <section style={{ marginBottom: 0, flex: '0 0 auto' }}>
              <div style={{
                background: 'var(--redp-card)',
                borderRadius: 14,
                boxShadow: '0 1px 8px 0 rgba(34,34,34,0.08)',
                padding: '1.5rem 1rem',
                maxHeight: 1200,
                overflowY: 'auto',
                minHeight: 320
              }}>
                <Outlet />
              </div>
            </section>
          ) : isTableRoute ? (
            <section style={{ marginBottom: 0, flex: '0 0 auto' }}>
              <div className="max-w-3xl mx-auto" style={{
                background: 'var(--redp-card)',
                borderRadius: 14,
                boxShadow: '0 1px 8px 0 rgba(34,34,34,0.08)',
                padding: '1.5rem 1rem',
                maxHeight: 480,
                overflowY: 'auto',
                minHeight: 320
              }}>
                {location.pathname.includes('/dashboard/students') ? (
                  <StudentsTable applicants={approvedBasics.map(basic => ({
                    id: basic.partitionKey + '-' + basic.rowKey,
                    firstName: basic.firstName,
                    lastName: basic.lastName,
                    email: '',
                    phone: '',
                    dateOfBirth: '',
                    gradeLevel: 0,
                    schoolName: '',
                    location: '',
                    status: basic.status
                  }))} />
                ) : location.pathname.includes('/dashboard/admissions') ? (
                  <AdmissionsTable applicants={applicants} />
                ) : location.pathname.includes('/dashboard/applicants') ? (
                  <ApplicantList
                    onAction={async (
                      partitionKey: string,
                      rowKey: string,
                      newStatus: 'Approved' | 'Pending' | 'Denied',
                      adminEmail?: string,
                      reason?: string
                    ) => {
                      // ...existing code for onAction...
                    }}
                  />
                ) : (
                  <Outlet />
                )}
              </div>
            </section>
          ) : (
            <React.Fragment>
              {/* Stats row at the top, profile/progress/notifications in right column */}
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: '2.2rem', width: '100%', maxWidth: 1400, margin: '0 auto' }}>
                <div className="dashboard-summary dashboard-summary-row" style={{ flex: 3, minWidth: 0, marginRight: 32 }}>
                  {summaryStats.map(stat => (
                    <div
                      key={stat.label}
                      className="dashboard-summary-card"
                      style={{ background: stat.color, color: stat.textColor, cursor: 'pointer', borderRadius: 18, minWidth: 180, maxWidth: 260, height: 130, margin: '0 18px 0 0', boxShadow: '0 4px 18px 0 rgba(2,60,105,0.10)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '22px 28px' }}
                      onClick={() => navigate(stat.route)}
                    >
                      <div className="dashboard-summary-icon" style={{ fontSize: '2.1rem', marginBottom: 6 }}>{stat.icon}</div>
                      <div className="dashboard-summary-value" style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 2 }}>{stat.value}</div>
                      <div className="dashboard-summary-label" style={{ fontSize: '1.13rem', fontWeight: 600 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 260, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 300, alignItems: 'flex-end', position: 'relative', right: 0 }}>
                    <div style={{ width: 260, background: '#fff', borderRadius: 18, boxShadow: '0 4px 18px 0 rgba(2,60,105,0.10)', padding: '18px 16px', marginBottom: 16 }}>
                      <AdminProfile />
                    </div>
                    <div style={{ width: 260, background: '#fff', borderRadius: 18, boxShadow: '0 4px 18px 0 rgba(2,60,105,0.10)', padding: '18px 16px', marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, color: '#ff3d00', marginBottom: 8, fontSize: 16 }}>Admissions Progress</div>
                      <div style={{ width: '100%', background: '#ffe0b2', borderRadius: 8, height: 14, marginBottom: 8 }}>
                        <div style={{
                          width: `${applicantsCount === 0 ? 0 : (studentsCount / applicantsCount) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #ff9800 60%, #ff3d00 100%)',
                          borderRadius: 8,
                          transition: 'width 0.4s'
                        }} />
                      </div>
                      <div style={{ fontWeight: 600, color: '#ff9800', fontSize: 13, textAlign: 'right' }}>{studentsCount} of {applicantsCount} Approved</div>
                    </div>
                    <div className="dashboard-widget-card" style={{ width: 260, marginBottom: 0 }}>
                      <div style={{ fontWeight: 700, color: '#ff3d00', marginBottom: 8, fontSize: 16 }}>Recent Notifications</div>
                      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        <Notifications />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Main grid: Recent Applications Table and Notifications side by side */}
              <div style={{ display: 'flex', flexDirection: 'row', gap: 0, alignItems: 'flex-start', marginTop: '-25rem', justifyContent: 'flex-start' }}>
                <section aria-labelledby="recent-apps-title" className="rounded-2xl bg-card text-card-foreground border border-border shadow-md" style={{ width: 600, minWidth: 320, flex: '0 0 600px', marginLeft: 0 }}>
                  <div className="flex items-center justify-between px-6 pt-5">
                    <h2 id="recent-apps-title" className="text-lg font-bold text-primary">Recent Applications</h2>
                    <button
                      style={{
                        background: '#ff3d00',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 18,
                        padding: '6px 22px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        boxShadow: '0 2px 8px #e5393533',
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s, border 0.2s',
                        outline: 'none',
                      }}
                      onClick={() => navigate('/dashboard/applicants')}
                      aria-label="View all applicants"
                    >
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto px-2 pb-4">
                    <table className="w-full min-w-[320px] text-left">
                      <thead>
                        <tr>
                          <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Avatar</th>
                          <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Name</th>
                          <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)', width: 120, textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(applicants.slice(0, 4) as ApplicantWithExtras[]).map((a) => {
                          const status = typeof a.status === 'number'
                            ? (a.status === 1 ? 'Pending' : a.status === 2 ? 'Approved' : a.status === 3 ? 'Denied' : a.status)
                            : a.status;
                          return (
                            <tr key={a.partitionKey + '-' + a.rowKey} className="dashboard-table-row">
                              <td className="dashboard-table-cell" style={{ color: 'var(--redp-text)', background: 'var(--redp-table-bg)' }}>
                                <span className="avatar-initials dashboard-recent-avatar" style={{ width: 44, height: 44, fontSize: '1.25em' }}>
                                  {a.firstName && a.lastName ? `${a.firstName[0]}${a.lastName[0]}`.toUpperCase() : '?'}
                                </span>
                              </td>
                              <td className="dashboard-table-cell" style={{ color: 'var(--redp-text)', background: 'var(--redp-table-bg)' }}>{a.firstName} {a.lastName}</td>
                              <td className={`dashboard-table-cell dashboard-status ${status && status.toLowerCase()}`}
                                  style={{
                                    color: status === 'Approved' ? 'var(--redp-status-approved)' : status === 'Denied' ? 'var(--redp-status-denied)' : status === 'Pending' ? 'var(--redp-status-pending)' : 'var(--redp-text)',
                                    background: 'var(--redp-table-bg)',
                                    width: 120,
                                    minWidth: 120,
                                    maxWidth: 120,
                                    textAlign: 'center',
                                    borderRadius: 8,
                                    padding: '6px 0',
                                    fontWeight: 600
                                  }}>{status}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </React.Fragment>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;