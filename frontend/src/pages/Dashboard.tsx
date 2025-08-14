import AdminProfile from './AdminProfile';
import ResizableTable from '../components/ResizableTable';
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
  // State for approval message
  const [showApprovalMsg, setShowApprovalMsg] = React.useState(false);
  // State for sidebar toggle (hamburger menu)
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
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

  const { darkMode } = useTheme();
  return (
    <div className={`dashboard-root${darkMode ? ' dark' : ''}`}>
      {/* Hamburger for mobile/tablet */}
      <button
        className="dashboard-hamburger"
        aria-label="Toggle sidebar"
        onClick={() => setSidebarOpen(open => !open)}
      >
        <span className="dashboard-hamburger-icon">&#9776;</span>
      </button>
      {/* Slim orange banner filling the top */}
      <div className="dashboard-banner">
        <span className="dashboard-banner-content">
          <img src={redpLogo} alt="REDP logo" className="dashboard-logo" />
          <span className="dashboard-title"></span>
        </span>
      </div>
      <div className={`dashboard-main-flex${sidebarOpen ? '' : ' sidebar-hidden'}`}> 
        {sidebarOpen && (
          <aside className="dashboard-sidebar">
            <nav className="sidebar-nav">
              {/* ...existing code for sidebar buttons... */}
              <button className={`sidebar-btn${activeBtn === 'dashboard' ? ' active' : ''}`} onClick={() => navigate('/dashboard')}><span role="img" aria-label="dashboard">🏠</span> Dashboard</button>
              <button className={`sidebar-btn${activeBtn === 'applicants' ? ' active' : ''}`} onClick={() => navigate('/dashboard/applicants')}><span role="img" aria-label="applicants">📝</span> Applicants</button>
              <button className={`sidebar-btn${activeBtn === 'students' ? ' active' : ''}`} onClick={() => navigate('/dashboard/students')}><span role="img" aria-label="students">👩‍🎓</span> Students</button>
              <button className={`sidebar-btn${activeBtn === 'admins' ? ' active' : ''}`} onClick={() => navigate('/dashboard/admins')}><span role="img" aria-label="admins">🛡️</span> Admins</button>
              <button className={`sidebar-btn${activeBtn === 'logs' ? ' active' : ''}`} onClick={() => navigate('/dashboard/logs')}><span role="img" aria-label="logs">📋</span> Logs</button>
              <button className={`sidebar-btn${activeBtn === 'fee-portal' ? ' active' : ''}`} onClick={() => navigate('/dashboard/fee-portal')}><span role="img" aria-label="fee portal">💳</span> Fee Portal</button>
            </nav>
          </aside>
        )}
        {/* Main content */}
        <main style={{ flex: 1, background: 'var(--redp-bg)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: 24, color: 'var(--redp-text)' }}>
          {showApprovalMsg && (
            <div className="dashboard-approval-msg" style={{ marginBottom: 16 }}>
              ✅ Applicant approved successfully!
            </div>
          )}
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
                    onAction={async (partitionKey, rowKey, newStatus, adminEmail, reason) => {
                      // Handle approval and denial workflows with dual tracking system
                      if (newStatus === 'Approved') {
                        // Call the dual approval Azure Function
                        try {
                          const approvalResponse = await fetch('https://simbaaddapproval-f8h7g2ffe2cefchh.westus-01.azurewebsites.net/api/addApproval', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              email: adminEmail || 'admin@company.com',
                              partitionKey,
                              rowKey,
                              action: 'approve',
                              reason: reason || ''
                            }),
                          });

                          const approvalData = await approvalResponse.json();

                          if (approvalResponse.ok) {
                            // Check if approvals are now complete
                            if (approvalResponse.status === 201 && approvalData.isComplete) {
                              // Approval threshold reached - update the final status to approved
                              console.log('Approval threshold reached, updating status to Approved');

                              const statusResponse = await fetch('https://approval-function-6370.azurewebsites.net/api/changestatusfunction', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partitionKey,
          rowKey,
          newStatus: 'Approved',
        }),
      });
      if (statusResponse.ok) {
        setShowApprovalMsg(true);
        setTimeout(() => setShowApprovalMsg(false), 2500);
      } else {
        console.error('Failed to update status to Approved');
      }
                            }
                          } else {
                            console.error('Approval API call failed');
                          }
                        } catch (err) {
                          console.error('Error during approval:', err);
                        }
                      } else if (newStatus === 'Denied') {
                        // Call the dual denial Azure Function
                        try {
                          const denialResponse = await fetch('https://simbaaddapproval-f8h7g2ffe2cefchh.westus-01.azurewebsites.net/api/addApproval', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              email: adminEmail || 'admin@company.com',
                              partitionKey,
                              rowKey,
                              action: 'deny',
                              reason: reason || ''
                            }),
                          });

                          const denialData = await denialResponse.json();

                          if (denialResponse.ok) {
                            // Check if denials are now complete
                            if (denialResponse.status === 201 && denialData.isComplete) {
                              // Denial threshold reached - update the final status to denied
                              console.log('Denial threshold reached, updating status to Denied');

                              const statusResponse = await fetch('https://approval-function-6370.azurewebsites.net/api/changestatusfunction', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  partitionKey,
                                  rowKey,
                                  newStatus: 'Denied',
                                }),
                              });
                              if (statusResponse.ok) {
                                console.log('Status updated to Denied');
                              } else {
                                console.error('Failed to update status to Denied');
                              }
                            }
                          } else {
                            console.error('Denial API call failed');
                          }
                        } catch (err) {
                          console.error('Error during denial:', err);
                        }
                      }
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
                      className="text-sm font-semibold text-brand hover:text-brand-strong transition-colors underline"
                      onClick={() => navigate('/dashboard/applicants')}
                      aria-label="View all applicants"
                    >
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto px-2 pb-4">
                    {/* ResizableTable for Recent Applicants */}
                    {(() => {
                      const columns = [
                        { key: 'avatar', label: 'Avatar', minWidth: 80, maxWidth: 160 },
                        { key: 'name', label: 'Name', minWidth: 120, maxWidth: 300 },
                        { key: 'status', label: 'Status', minWidth: 100, maxWidth: 180 },
                      ];
                      const data = (applicants.slice(0, 4) as ApplicantWithExtras[]).map(a => {
                        const status = typeof a.status === 'number'
                          ? (a.status === 1 ? 'Pending' : a.status === 2 ? 'Approved' : a.status === 3 ? 'Denied' : a.status)
                          : a.status;
                        return {
                          avatar: <span className="avatar-initials dashboard-recent-avatar" style={{ width: 44, height: 44, fontSize: '1.25em' }}>{a.firstName && a.lastName ? `${a.firstName[0]}${a.lastName[0]}`.toUpperCase() : '?'}</span>,
                          name: `${a.firstName} ${a.lastName}`,
                          status: <span className={`dashboard-table-cell dashboard-status ${status && status.toLowerCase()}`}
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
                            }}>{status}</span>
                        };
                      });
                      return <ResizableTable columns={columns} data={data} />;
                    })()}
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