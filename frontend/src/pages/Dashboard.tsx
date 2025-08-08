
import React, { useMemo } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useApplicantData } from '../contexts/ApplicantDataContext';
import './Dashboard.css';
<<<<<<< HEAD
=======
import logo from '../assets/redp-logo.png';
import { FaTachometerAlt, FaUsers, FaUserGraduate, FaBell, FaSignOutAlt, FaBars, FaTimes, FaUserShield } from 'react-icons/fa';
import NewAdmissionForm from './NewAdmissionForm';
>>>>>>> 3d5021cbf3ada6c1272a1ddc84a4f7903aff7c15
import { statusToString } from './utils';

// Sidebar navigation links with SVG icons
const sidebarLinks = [
  { label: 'Dashboard', route: '/dashboard', icon: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z" stroke="#ff9800" strokeWidth="2" strokeLinejoin="round"/></svg>
  ) },
  { label: 'Applicants', route: '/dashboard/applicants', icon: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#ff9800" strokeWidth="2"/><path d="M4 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#ff9800" strokeWidth="2"/></svg>
  ) },
  { label: 'Students', route: '/dashboard/students', icon: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#ff9800" strokeWidth="2"/><path d="M2 20c0-3.314 4.03-6 10-6s10 2.686 10 6" stroke="#ff9800" strokeWidth="2"/></svg>
  ) },
  { label: 'Fee Portal', route: '/dashboard/fee-portal', icon: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" stroke="#ff9800" strokeWidth="2"/><path d="M3 10h18" stroke="#ff9800" strokeWidth="2"/></svg>
  ) },
  { label: 'Admissions', route: '/dashboard/admissions', icon: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#ff9800" strokeWidth="2"/><path d="M8 8h8M8 12h8M8 16h4" stroke="#ff9800" strokeWidth="2"/></svg>
  ) },
  { label: 'Logs', route: '/dashboard/logs', icon: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#ff9800" strokeWidth="2"/><path d="M8 8h8M8 12h6M8 16h4" stroke="#ff9800" strokeWidth="2"/></svg>
  ) },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userEmail, logout } = useUser();
  const { applicants: apiApplicants, loading, error } = useApplicantData();

  // Demo admin name logic
  let adminName = 'Admin';
  if (userEmail) {
    const match = userEmail.match(/^([a-zA-Z]+)([. _-]([a-zA-Z]+))?/);
    if (match) {
      const first = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      const last = match[3] ? match[3].charAt(0).toUpperCase() + match[3].slice(1) : '';
      adminName = last ? `${first} ${last}` : first;
    }
  }

  // Demo fallback data
  type Applicant = { id?: number; name?: string; status: string; firstName?: string; lastName?: string };
  const applicants: Applicant[] = useMemo(() => [
    { id: 1, name: 'Jane Doe', status: 'Pending' },
    { id: 2, name: 'Rajombol Siayho', status: 'Approved' },
    { id: 3, name: 'Amina Njeri', status: 'Pending' },
  ], []);

  // Type guard for API vs demo applicants is now inside useMemo below

  // Recent applicants logic
  const recent: Applicant[] = useMemo(() => {
    function getApplicantName(a: Applicant, index?: number) {
      if (a.firstName || a.lastName) {
        return `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
      }
      if (a.name) return a.name;
      if (typeof index === 'number') return `Applicant ${index + 1}`;
      return 'Applicant';
    }
    if (apiApplicants && apiApplicants.length > 0) {
      return apiApplicants.slice(0, 3).map((a: Applicant, index: number) => ({
        id: a.id ?? index + 1,
        name: getApplicantName(a, index),
        status: statusToString(a.status),
      }));
    } else {
      return applicants;
    }
  }, [apiApplicants, applicants]);

  // Stats
  const stats = useMemo(() => {
    const dataSource: Applicant[] = apiApplicants && apiApplicants.length > 0 ? apiApplicants : applicants;
    const admissionsCount = dataSource.length;
    const approvedCount = dataSource.filter((a) => statusToString(a.status) === 'Approved').length;
    const pendingCount = dataSource.filter((a) => statusToString(a.status) === 'Pending').length;
    return [
      { label: 'Admissions', value: admissionsCount, color: '#ff3d00', route: '/dashboard/admissions', icon: '📋' },
      { label: 'Students', value: approvedCount, color: '#ff9800', route: '/dashboard/students', icon: '🎓' },
      { label: 'Pending', value: pendingCount, color: '#222', route: '/dashboard/applicants', icon: '⏳' },
    ];
  }, [apiApplicants, applicants]);

  const isDashboardHome = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  return (
<<<<<<< HEAD
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f7f7fa' }}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{ width: 240, background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: '2rem 0 1rem 0', boxShadow: '2px 0 12px 0 rgba(34,34,34,0.04)', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ff9800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#fff', fontWeight: 700, marginBottom: 10 }}>
            {adminName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.1em', color: '#222', marginBottom: 2 }}>{adminName}</div>
          <div style={{ fontSize: '0.97em', color: '#ff9800' }}>{userEmail}</div>
        </div>
        <nav style={{ flex: 1 }}>
          {sidebarLinks.map(link => (
            <button
              key={link.route}
              className={location.pathname === link.route ? 'sidebar-link active' : 'sidebar-link'}
              style={{
                display: 'flex', alignItems: 'center', width: '100%', padding: '0.85rem 2rem', background: location.pathname === link.route ? '#fff3e0' : 'none', border: 'none', borderLeft: location.pathname === link.route ? '4px solid #ff9800' : '4px solid transparent', color: '#222', fontWeight: 600, fontSize: '1em', cursor: 'pointer', outline: 'none', transition: 'background 0.2s', marginBottom: 2
              }}
              onClick={() => navigate(link.route)}
              aria-label={link.label}
            >
              <span style={{ fontSize: 20, marginRight: 14, display: 'flex', alignItems: 'center' }}>{link.icon}</span>
              {link.label}
            </button>
          ))}
=======
    <div className="admin-layout" style={{ position: 'relative' }}>
      {/* Hamburger menu for mobile */}
      <button
        className="dashboard-hamburger"
        style={{
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 30,
          background: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: 8,
        }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Open menu"
      >
        {sidebarOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
      </button>
      {/* Dropdown menu for mobile */}
      {sidebarOpen && (
        <nav
          className="sidebar-dropdown"
          style={{
            position: 'fixed',
            top: 60,
            left: 0,
            width: '100vw',
            background: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            zIndex: 31,
            display: isMobile ? 'block' : 'none',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            padding: '1rem 0',
          }}
        >
          <button onClick={() => { navigate('/dashboard'); setSidebarOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '1rem 2rem', border: 'none', background: 'none' }}><FaTachometerAlt /> Dashboard</button>
          <button onClick={() => { navigate('/dashboard/applicants'); setSidebarOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '1rem 2rem', border: 'none', background: 'none' }}><FaUsers /> Applicants</button>
          <button onClick={() => { navigate('/dashboard/admissions'); setSidebarOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '1rem 2rem', border: 'none', background: 'none' }}><FaTachometerAlt /> Admissions</button>
          <button onClick={() => { navigate('/dashboard/student-verification'); setSidebarOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '1rem 2rem', border: 'none', background: 'none' }}><FaUserGraduate /> Students</button>
          <button onClick={() => { navigate('/dashboard/admins'); setSidebarOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '1rem 2rem', border: 'none', background: 'none' }}><FaUserShield /> Admins</button>
          {/* Pending removed from sidebar */}
          <button onClick={() => { navigate('/dashboard/logs'); setSidebarOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '1rem 2rem', border: 'none', background: 'none' }}><FaBell /> Logs</button>
          
          {/* User info in mobile menu */}
          {userEmail && (
            <div style={{ 
              padding: '1rem 2rem', 
              borderTop: '1px solid #eee',
              fontSize: '0.85rem',
              color: '#666'
            }}>
              <strong>Logged in as:</strong><br />
              <span style={{ color: '#ff3d00' }}>{userEmail}</span>
            </div>
          )}
          
          <button className="sidebar-logout" onClick={() => { handleLogout(); setSidebarOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '1rem 2rem', border: 'none', background: 'none' }}><FaSignOutAlt /> Logout</button>
        </nav>
      )}
      {/* Sidebar for desktop only */}
      <aside
        className="admin-sidebar"
        style={{
          display: isMobile ? 'none' : 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: 170,
          background: '#fff',
          borderRight: '1px solid #e5e7eb',
          zIndex: 10,
        }}
      >
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')}>
          <img src={logo} alt="RED(P) Logo" />
          <span>RED(P) Admin</span>
        </div>
        
        {/* User info section */}
        {userEmail && (
          <div style={{ 
            padding: '1rem', 
            borderBottom: '1px solid #eee', 
            margin: '0 1rem',
            fontSize: '0.85rem',
            color: '#666'
          }}>
            <strong>Logged in as:</strong><br />
            <span style={{ color: '#ff3d00' }}>{userEmail}</span>
          </div>
        )}
        
        <nav className="sidebar-nav">
          <button onClick={() => navigate('/dashboard')}><FaTachometerAlt /> Dashboard</button>
          <button onClick={() => navigate('/dashboard/applicants')}><FaUsers /> Applicants</button>
          <button onClick={() => navigate('/dashboard/admissions')}><FaTachometerAlt /> Admissions</button>
          <button onClick={() => navigate('/dashboard/student-verification')}><FaUserGraduate /> Students</button>
          <button onClick={() => navigate('/dashboard/admins')}><FaUserShield /> Admins</button>
          <button onClick={() => navigate('/dashboard/logs')}><FaBell /> Logs</button>
          <button className="sidebar-logout" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
>>>>>>> 3d5021cbf3ada6c1272a1ddc84a4f7903aff7c15
        </nav>
        <button
          className="sidebar-link"
          style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0.85rem 2rem', background: 'none', border: 'none', borderLeft: '4px solid transparent', color: '#d32f2f', fontWeight: 600, fontSize: '1em', cursor: 'pointer', outline: 'none', marginTop: 18 }}
          onClick={logout}
          aria-label="Logout"
        >
          <span style={{ fontSize: 20, marginRight: 14 }}>🚪</span>
          Logout
        </button>
      </aside>
      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <main className="admin-main fade-transition" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'flex-start', alignItems: 'stretch', padding: '0 0 2rem 0' }}>
          {isDashboardHome ? (
            <div className="dashboard-content-flex" style={{display: 'flex', gap: 32, alignItems: 'flex-start'}}>
              <div style={{flex: 2, minWidth: 0}}>
                <section className="dashboard-summary">
                  {stats.map((stat) => (
                    <div
                      className="dashboard-summary-card"
                      key={stat.label}
                      style={{ borderColor: stat.color, cursor: 'pointer', background: stat.label === 'Admissions' ? 'linear-gradient(90deg, #ff3d00 60%, #ff9800 100%)' : stat.label === 'Students' ? 'linear-gradient(90deg, #ff9800 60%, #ff3d00 100%)' : '#fff', boxShadow: '0 2px 12px 0 rgba(34,34,34,0.08)' }}
                      onClick={() => navigate(stat.route)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Go to ${stat.label}`}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(stat.route); }}
                    >
                      <div className="dashboard-summary-icon" style={{ color: stat.label === 'Pending' ? '#222' : '#fff' }}>{stat.icon}</div>
                      <div className="dashboard-summary-value" style={{ color: stat.label === 'Pending' ? '#222' : '#fff', fontWeight: 900 }}>{stat.value}</div>
                      <div className="dashboard-summary-label" style={{ color: stat.label === 'Pending' ? '#222' : '#fff', fontWeight: 600 }}>{stat.label}</div>
                    </div>
                  ))}
                </section>
                <section className="dashboard-actions">
                  <button className="dashboard-action-btn primary" disabled style={{opacity:0.5, cursor:'not-allowed'}}>📝 New Admission</button>
                  <button className="dashboard-action-btn" disabled style={{opacity:0.5, cursor:'not-allowed'}}>📢 Notify</button>
                </section>
                <section className="dashboard-recent-table">
                  <div className="dashboard-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <h2 style={{ margin: 0 }}>Recent Applications</h2>
                    <button className="dashboard-viewall-btn" onClick={() => navigate('/dashboard/applicants')}>View All</button>
                  </div>
                  {error && (
                    <div style={{ padding: '1rem', background: '#ffebee', border: '1px solid #f44336', borderRadius: '4px', marginBottom: '1rem', color: '#d32f2f' }}>
                      <strong>API Error:</strong> {error}. Showing demo data instead.
                    </div>
                  )}
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={2} style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>Loading applicants...</td></tr>
                      ) : recent.length === 0 ? (
                        <tr><td colSpan={2} style={{ textAlign: 'center', color: '#888' }}>No results found.</td></tr>
                      ) : (
                        recent.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>
                              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', color: 'white', background: statusToString(item.status) === 'Approved' ? '#4caf50' : statusToString(item.status) === 'Denied' ? '#f44336' : '#ff9800', minWidth: 90, display: 'inline-block' }}>{statusToString(item.status)}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </section>
              </div>
              <aside className="dashboard-right-panel" style={{flex: 1, minWidth: 280, maxWidth: 370, background: 'linear-gradient(135deg, #fff 60%, #ff9800 100%)', borderRadius: 18, boxShadow: '0 2px 16px 0 rgba(255,61,0,0.10)', padding: '2rem 1.5rem 1.5rem 1.5rem', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 28}}>
                {/* Welcome Card */}
                <div style={{background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(255,61,0,0.07)', padding: '1.2rem 1rem 1rem 1rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16}}>
                  <div style={{width: 48, height: 48, borderRadius: '50%', background: '#ff9800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 700}}>
                    {adminName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight: 700, fontSize: '1.08em', color: '#222'}}>
                      Welcome, <span style={{color:'#ff3d00'}}>{adminName}</span>!
                    </div>
                    <div style={{fontSize: '0.98em', color: '#ff9800'}}>Have a productive day</div>
                  </div>
                </div>
                {/* Analytics Card */}
                <div style={{background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(255,61,0,0.07)', padding: '1.1rem 1rem 1.2rem 1rem', marginBottom: 18}}>
                  <div style={{fontWeight: 700, color: '#ff3d00', marginBottom: 10}}>Admissions Progress</div>
                  {(() => {
                    const dataSource = apiApplicants && apiApplicants.length > 0 ? apiApplicants : applicants;
                    const approvedCount = dataSource.filter((a) => statusToString(a.status) === 'Approved').length;
                    const totalCount = dataSource.length;
                    const pendingCount = dataSource.filter((a) => statusToString(a.status) === 'Pending').length;
                    const deniedCount = dataSource.filter((a) => statusToString(a.status) === 'Denied').length;
                    const percent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
                    return (
                      <>
                        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8}}>
                          <span style={{fontWeight: 700, color: '#ff3d00'}}>{approvedCount}</span>
                          <span style={{color: '#222', fontSize: '0.97em'}}>of {totalCount} admissions approved</span>
                        </div>
                        <div style={{background: '#ff9800', borderRadius: 8, height: 10, width: '100%', marginBottom: 4}}>
                          <div style={{background: 'linear-gradient(90deg, #ff3d00 60%, #ff9800 100%)', width: `${percent}%`, height: '100%', borderRadius: 8}}></div>
                        </div>
                        <div style={{fontSize: '0.93em', color: '#ff9800'}}>
                          {pendingCount > 0 ? `${pendingCount} pending` : deniedCount > 0 ? `${deniedCount} denied` : 'All done!'}
                        </div>
                      </>
                    );
                  })()}
                </div>
              {/* Recent Logs Section (real data) */}
              <section className="dashboard-recent-logs" style={{background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(255,61,0,0.07)', padding: '1.1rem 1rem 1.2rem 1rem', marginBottom: 18}}>
                <div style={{fontWeight: 700, color: '#ff9800', marginBottom: 10}}>Recent Logs</div>
                <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.98em'}}>
                  {(() => {
                    // Get all applicants, sort by most recent (if available)
                    const logs = (apiApplicants || []).slice().reverse().slice(0, 3);
                    if (logs.length === 0) {
                      return <li>No recent logs available.</li>;
                    }
                    return logs.map((log, idx) => {
                      const name = `${log.firstName || ''} ${log.lastName || ''}`.trim() || 'Applicant';
                      const status = statusToString(log.status);
                      let action = 'updated';
                      if (status === 'Approved') action = 'approved';
                      else if (status === 'Denied') action = 'denied';
                      else if (status === 'Pending') action = 'submitted';
                      return (
                        <li key={idx} style={{marginBottom: 8}}>
                          <div style={{fontWeight: 600}}>{name} {action} their application</div>
                          <div>Status: {status}</div>
                        </li>
                      );
                    });
                  })()}
                </ul>
<<<<<<< HEAD
              </section>
              </aside>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
=======
              </div>
            </aside>
          </div>
        ) : location.pathname === '/dashboard/student-verification' ? (
          <StudentsTable applicants={apiApplicants.map((a) => ({
            id: a.rowKey, // Use full rowKey as id
            firstName: a.firstName,
            lastName: a.lastName,
            email: '',
            phone: '',
            dateOfBirth: '',
            gradeLevel: 0,
            schoolName: '',
            location: '',
            status: getStatusDisplay(a.status === undefined ? null : Number(a.status)),
          }))} />
        ) : location.pathname === '/dashboard/pending' ? (
          <PendingDetails applicants={apiApplicants.map((a) => ({
            id: a.rowKey, // Use full rowKey as id
            name: `${a.firstName} ${a.lastName}`,
            school: '',
            status: getStatusDisplay(a.status === undefined ? null : Number(a.status)),
            submittedOn: '',
            reason: '',
            notes: ''
          }))} />
        ) : location.pathname === '/dashboard/applicants' ? (
          <ApplicantList
            onAction={async (partitionKey, rowKey, newStatus, adminEmail) => {
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
                          action: 'approve',
                        }),
                      });

                      if (statusResponse.ok) {
                        // Build approval list message
                        const approvalsList = Object.keys(approvalData.approvals || {})
                          .filter(key => key.startsWith('approval') && !key.includes('time'))
                          .map((key, index) => {
                            const timeKey = key.replace('approval', 'timeOfApproval');
                            return `Approver ${index + 1}: ${approvalData.approvals[key]} (${approvalData.approvals[timeKey] || 'N/A'})`;
                          })
                          .join('\n');
                        
                        alert(`Success: Approval threshold reached (${approvalData.currentApprovalCount}/${approvalData.approvalThreshold})!\n${approvalsList}\nApplication has been approved!`);
                      } else {
                        alert(`Approvals complete but status update failed: ${await statusResponse.text()}`);
                      }
                    } else {
                      // Still need more approvals
                      alert(`Success: ${approvalData.message}\nProgress: ${approvalData.currentApprovalCount}/${approvalData.approvalThreshold} approvals\nAdmin Count: ${approvalData.adminCount}`);
                    }
                  } else {
                    alert(`Approval Error: ${approvalData.error || await approvalResponse.text()}`);
                  }
                } catch (error) {
                  alert('Approval Error: ' + error);
                }
              } else if (newStatus === 'Denied') {
                // Handle denial with dual denial system
                try {
                  const denialResponse = await fetch('https://simbaaddapproval-f8h7g2ffe2cefchh.westus-01.azurewebsites.net/api/addApproval', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: adminEmail || 'admin@company.com',
                      partitionKey,
                      rowKey,
                      action: 'deny',
                    }),
                  });

                  const denialData = await denialResponse.json();
                  
                  if (denialResponse.ok) {
                    // Check if denials are now complete
                    if (denialResponse.status === 201 && denialData.isDenialComplete) {
                      // Denial threshold reached - update the final status to denied
                      console.log('Denial threshold reached, updating status to Denied');
                      
                      const statusResponse = await fetch('https://approval-function-6370.azurewebsites.net/api/changestatusfunction', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          partitionKey,
                          rowKey,
                          action: 'deny',
                        }),
                      });

                      if (statusResponse.ok) {
                        // Build denial list message
                        const denialsList = Object.keys(denialData.denials || {})
                          .filter(key => key.startsWith('denial') && !key.includes('time'))
                          .map((key, index) => {
                            const timeKey = key.replace('denial', 'timeOfDenial');
                            return `Denier ${index + 1}: ${denialData.denials[key]} (${denialData.denials[timeKey] || 'N/A'})`;
                          })
                          .join('\n');
                        
                        alert(`Success: Denial threshold reached (${denialData.currentDenialCount}/${denialData.denialThreshold})!\n${denialsList}\nApplication has been denied!`);
                      } else {
                        alert(`Denials complete but status update failed: ${await statusResponse.text()}`);
                      }
                    } else {
                      // Still need more denials
                      alert(`Success: ${denialData.message}\nProgress: ${denialData.currentDenialCount}/${denialData.denialThreshold} denials\nAdmin Count: ${denialData.adminCount}`);
                    }
                  } else {
                    alert(`Denial Error: ${denialData.error || await denialResponse.text()}`);
                  }
                } catch (error) {
                  alert('Denial Error: ' + error);
                }
              }

              // Notify the cache context that a status change occurred
              onStatusChange(partitionKey, rowKey, newStatus);
            }}
          />
        ) : location.pathname === '/dashboard/admissions' ? (
          <AdmissionsTable applicants={apiApplicants} />
        ) : location.pathname === '/dashboard/admins' ? (
          <Outlet />
        ) : location.pathname === '/dashboard/logs' ? (
          <Outlet />
        ) : null}
      </main>
      {/* ModalApplicant modal and all modal code fully removed */}
      {/* Admission Form Modal */}
      {showAdmissionForm && (
        <div className="modal-overlay" onClick={() => setShowAdmissionForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, margin: '0 auto', borderRadius: 16, boxShadow: '0 8px 32px rgba(2,60,105,0.18)', padding: '2.5rem 2rem 2rem 2rem', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible' }}>
            <button className="modal-close" onClick={() => setShowAdmissionForm(false)} style={{ position: 'absolute', top: 18, right: 24, fontSize: 28, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            <NewAdmissionForm />
          </div>
        </div>
      )}
>>>>>>> 3d5021cbf3ada6c1272a1ddc84a4f7903aff7c15
    </div>
  );
};

export default Dashboard;
