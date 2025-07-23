// Dashboard.tsx
// Main admin dashboard page. Handles navigation, summary, and renders all major admin tables.
// Backend engineers: Integrate API calls for fetching applicants, updating status, and admissions where noted below.
// For Azure Functions, connect the action handlers to your HTTP triggers or function endpoints.
import React, { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import StudentsTable from './StudentsTable';
import PendingDetails from './PendingDetails';
import ApplicantList from './ApplicantList';
import AdmissionsTable from './AdmissionsTable';
import './Dashboard.css';
import logo from '../assets/redp-logo.png';
import { FaTachometerAlt, FaUsers, FaUserGraduate, FaBell, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import NewAdmissionForm from './NewAdmissionForm';
import { statusToString, joinName, notificationMessage, paginate } from './utils';

// API Configuration
const API_BASE_URL = 'https://simbagetapplicants-hcf5cffbcccmgsbn.westus-01.azurewebsites.net/api/httptablefunction';

// API Response Types
type ApplicantBasic = {
  firstName: string;
  lastName: string;
  status: string;
  partitionKey: string;
  rowKey: string;
};

// Detailed applicant type from the API (GET with partitionKey and rowKey)
type ApplicantDetailed = {
  firstName: string;
  lastName: string;
  status: string;
  partitionKey: string;
  rowKey: string;
  [key: string]: any; // Additional fields that come from the detailed API
};

// Legacy initial data for fallback
export const initialApplicants = [
  {
    id: 1,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@email.com',
    phone: '+254 700 123456',
    dateOfBirth: '2005-06-01',
    gradeLevel: 9,
    schoolName: 'Kimana Girls School',
    location: '123 Main St, Nairobi',
    essay: 'My essay about why I deserve the scholarship.',
    status: 'Pending',
  },
  {
    id: 2,
    firstName: 'Rajombol',
    lastName: 'Siayho',
    email: 'rajombol@email.com',
    phone: '+254 701 222333',
    dateOfBirth: '2004-05-12',
    gradeLevel: 10,
    schoolName: 'Maasai Primary School',
    location: '456 Maasai Rd, Kajiado',
    essay: 'I am passionate about learning and want to help my community.',
    status: 'Approved',
  },
  {
    id: 3,
    firstName: 'Amina',
    lastName: 'Njeri',
    email: 'amina@email.com',
    phone: '+254 702 555444',
    dateOfBirth: '2006-01-20',
    gradeLevel: 8,
    schoolName: 'Nairobi High',
    location: '789 River Rd, Nairobi',
    essay: 'Education is the key to my future success.',
    status: 'Pending',
  },
];

// Add status code helpers from the prompt
export function getStatusDisplay(status: number | null) {
    if (status === null || status === 1) {
        return 'Pending';
    } else if (status === 2) {
        return 'Approved';
    } else if (status === 3) {
        return 'Denied';
    }
    // Any unknown status is treated as Pending
    return 'Pending';
}
export function shouldShowButtons(status: number | null) {
    // Allow approve/deny for any unknown status
    return status === null || status === 1 || status !== 2 && status !== 3;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userEmail, logout } = useUser();
  
  // State for API data
  const [apiApplicants, setApiApplicants] = React.useState<ApplicantBasic[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // State for detailed modal
  const [modalApplicant, setModalApplicant] = React.useState<ApplicantDetailed | null>(null);
  const [modalLoading, setModalLoading] = React.useState<boolean>(false);
  
  // Legacy state for compatibility (using fallback data)
  const [applicants, setLegacyApplicants] = React.useState(initialApplicants);

  // Hamburger menu state
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showAdmissionForm, setShowAdmissionForm] = React.useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch applicants from API
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch applicants: ${response.status} ${response.statusText}`);
        }
        
        const data: ApplicantBasic[] = await response.json();
        // Debug: Log the status values to see what the API returns
        console.log('API Response - Status values:', data.map(a => ({ 
          name: `${a.firstName} ${a.lastName}`, 
          status: a.status, 
          statusType: typeof a.status,
          processedStatus: getStatusDisplay(a.status === undefined ? null : Number(a.status))
        })));
        setApiApplicants(data);
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch applicants');
        // Continue using fallback data on error
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  // Create recent applicants from API data (first 3) or fallback to legacy data
  const recent = React.useMemo(() => {
    if (apiApplicants.length > 0) {
      // Use API data - take first 3 and format for display
      return apiApplicants.slice(0, 3).map((a, index) => ({
        id: index + 1, // Generate a simple ID for key
        name: `${a.firstName} ${a.lastName}`,
        school: 'School info not available', // API doesn't include school info in basic response
        status: statusToString(a.status),
        date: 'Date not available', // API doesn't include date in basic response
        details: `${a.partitionKey} - ${a.rowKey}`, // Show keys as temporary details
        partitionKey: a.partitionKey,
        rowKey: a.rowKey
      }));
    } else {
      // Fallback to legacy data
      return applicants.map(a => ({
        id: a.id,
        name: a.firstName + ' ' + a.lastName,
        school: a.schoolName,
        status: a.status,
        date: a.dateOfBirth,
        details: a.email + ' / ' + a.phone
      }));
    }
  }, [apiApplicants, applicants]);

  // Stats based on API data if available, otherwise use legacy data
  const stats = React.useMemo(() => {
    const dataSource = apiApplicants.length > 0 ? apiApplicants : applicants;
    const admissionsCount = dataSource.length;
    const approvedCount = dataSource.filter(a => statusToString(a.status) === 'Approved').length;
    const pendingCount = dataSource.filter(a => statusToString(a.status) === 'Pending').length;
    return [
      { label: 'Admissions', value: admissionsCount, color: '#ff3d00', route: '/dashboard/admissions', icon: <FaTachometerAlt /> },
      { label: 'Students', value: approvedCount, color: '#ff9800', route: '/dashboard/student-verification', icon: <FaUserGraduate /> },
      { label: 'Pending', value: pendingCount, color: '#222', route: '/dashboard/pending', icon: <FaUsers /> },
    ];
  }, [apiApplicants, applicants]);

  type Applicant = typeof initialApplicants[0];
  const [statusFilter, setStatusFilter] = React.useState('');
  const statusOptions = Array.from(new Set(recent.map(item => item.status)));
  const filteredRecent = statusFilter
    ? recent.filter(item => item.status === statusFilter)
    : recent;

  // Fetch detailed applicant data for modal
  const fetchApplicantDetails = async (partitionKey: string, rowKey: string) => {
    try {
      setModalLoading(true);
      
      const url = `${API_BASE_URL}?partitionKey=${encodeURIComponent(partitionKey)}&rowKey=${encodeURIComponent(rowKey)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applicant details: ${response.status} ${response.statusText}`);
      }
      
      const data: ApplicantDetailed = await response.json();
      setModalApplicant(data);
    } catch (err) {
      console.error('Error fetching applicant details:', err);
      // Could show an error message here
    } finally {
      setModalLoading(false);
    }
  };

  const location = useLocation();
  const isDashboardHome = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  // Centralized status update handler for workflow actions
  // TODO: Backend: Call API/Azure Function to update status or delete applicant here
  const handleApplicantStatus = (id: number, newStatus: 'Approved' | 'Pending' | 'Denied') => {
    setLegacyApplicants((prev: Applicant[]) => {
      if (newStatus === 'Denied') {
        return prev.filter((a: Applicant) => a.id !== id);
      }
      return prev.map((a: Applicant) => a.id === id ? { ...a, status: newStatus } : a);
    });
    // If modal is open for this applicant, update modalApplicant to reflect new status
    setModalApplicant(prevModal => {
      if (prevModal && (prevModal as any).id === id) {
        return { ...prevModal, status: newStatus };
      }
      return prevModal;
    });
  };

  // Helper: is mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 900;

  return (
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
          <button onClick={() => { navigate('/dashboard/pending'); setSidebarOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '1rem 2rem', border: 'none', background: 'none' }}><FaUsers /> Pending</button>
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
          <button onClick={() => navigate('/dashboard/pending')}><FaUsers /> Pending</button>
          <button onClick={() => navigate('/dashboard/logs')}><FaBell /> Logs</button>
          <button className="sidebar-logout" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
        </nav>
      </aside>
      {/* Main content */}
      <main className="admin-main fade-transition" style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        padding: '0 0 2rem 0',
      }}>
        <header className="admin-topbar">
          {/* Search bar and notification bell removed from header */}
        </header>
        {isDashboardHome ? (
          <div className="dashboard-content-flex" style={{display: 'flex', gap: 32, alignItems: 'flex-start'}}>
            <div style={{flex: 2, minWidth: 0}}>
              <section className="dashboard-summary">
                {stats.map((stat) => (
                  <div
                    className="dashboard-summary-card"
                    key={stat.label}
                    style={{
                      borderColor: stat.color,
                      cursor: 'pointer',
                      background: stat.label === 'Admissions'
                        ? 'linear-gradient(90deg, #ff3d00 60%, #ff9800 100%)'
                        : stat.label === 'Students'
                        ? 'linear-gradient(90deg, #ff9800 60%, #ff3d00 100%)'
                        : '#fff',
                      boxShadow: '0 2px 12px 0 rgba(34,34,34,0.08)',
                    }}
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
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: '1rem', minWidth: 140 }}
                  >
                    <option value="">All Statuses</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
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
                    ) : filteredRecent.length === 0 ? (
                      <tr><td colSpan={2} style={{ textAlign: 'center', color: '#888' }}>No results found.</td></tr>
                    ) : (
                      filteredRecent.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              textAlign: 'center',
                              color: 'white',
                              background: statusToString(item.status) === 'Approved' ? '#4caf50' : statusToString(item.status) === 'Denied' ? '#f44336' : '#ff9800',
                              minWidth: 90,
                              display: 'inline-block',
                            }}>
                              {statusToString(item.status)}
                            </span>
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
                <div style={{width: 48, height: 48, borderRadius: '50%', background: '#ff9800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 700}}>A</div>
                <div>
                  <div style={{fontWeight: 700, fontSize: '1.08em', color: '#222'}}>Welcome, <span style={{color:'#ff3d00'}}>Admin</span>!</div>
                  <div style={{fontSize: '0.98em', color: '#ff9800'}}>Have a productive day</div>
                </div>
              </div>
              {/* Analytics Card */}
              <div style={{background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(255,61,0,0.07)', padding: '1.1rem 1rem 1.2rem 1rem', marginBottom: 18}}>
                <div style={{fontWeight: 700, color: '#ff3d00', marginBottom: 10}}>Admissions Progress</div>
                {(() => {
                  const dataSource = apiApplicants.length > 0 ? apiApplicants : applicants;
                  const approvedCount = dataSource.filter(a => statusToString(a.status) === 'Approved').length;
                  const totalCount = dataSource.length;
                  const pendingCount = dataSource.filter(a => statusToString(a.status) === 'Pending').length;
                  const deniedCount = dataSource.filter(a => statusToString(a.status) === 'Denied').length;
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
              {/* Modern Notifications Feed */}
              <div style={{background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(255,61,0,0.07)', padding: '1.1rem 1rem 1.2rem 1rem'}}>
                <div style={{fontWeight: 700, color: '#ff3d00', marginBottom: 10}}>Recent Notifications</div>
                <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12}}>
                  {(() => {
                    // Always use a consistent array type for notifications
                    let dataSource: any[] = [];
                    if (apiApplicants.length > 0) {
                      dataSource = apiApplicants;
                    } else {
                      dataSource = applicants;
                    }
                    // Type guards
                    const hasDateOfBirth = (a: any): a is { dateOfBirth: string } => typeof a.dateOfBirth === 'string';
                    const hasDate = (a: any): a is { date: string } => typeof a.date === 'string';
                    const hasName = (a: any): a is { name: string } => typeof a.name === 'string';
                    // Sort by date if available, else fallback to order
                    let sorted = dataSource;
                    if (dataSource.length > 0 && (hasDateOfBirth(dataSource[0]) || hasDate(dataSource[0]))) {
                      sorted = [...dataSource].sort((a, b) => {
                        const da = hasDateOfBirth(a) ? new Date(a.dateOfBirth) : hasDate(a) ? new Date(a.date) : new Date(0);
                        const db = hasDateOfBirth(b) ? new Date(b.dateOfBirth) : hasDate(b) ? new Date(b.date) : new Date(0);
                        return db.getTime() - da.getTime();
                      });
                    }
                    // Show up to 5 most recent
                    return sorted.slice(0, 5).map((a, idx) => {
                      let msg = '';
                      const status = statusToString(a.status).toLowerCase();
                      const firstName = (a as any).firstName || (hasName(a) ? a.name.split(' ')[0] : '');
                      const lastName = (a as any).lastName || (hasName(a) ? a.name.split(' ').slice(1).join(' ') : '');
                      if (status === 'approved') {
                        msg = `${firstName} ${lastName} was approved.`;
                      } else if (status === 'pending') {
                        msg = `New application received from ${firstName} ${lastName}.`;
                      } else if (status === 'denied') {
                        msg = `${firstName} ${lastName} was denied.`;
                      } else {
                        msg = `${firstName} ${lastName} application is in progress.`;
                      }
                      // Date string
                      let dateStr = hasDateOfBirth(a) ? a.dateOfBirth : hasDate(a) ? a.date : '';
                      return (
                        <li key={idx} style={{color: status === 'approved' ? '#ff9800' : status === 'denied' ? '#f44336' : '#ff3d00', fontWeight: 700, marginBottom: 2}}>
                          {msg} {dateStr && <span style={{color:'#5a6a85', fontWeight:400, marginLeft:8, fontSize:'0.97em'}}>({dateStr})</span>}
                        </li>
                      );
                    });
                  })()}
                </ul>
              </div>
            </aside>
          </div>
        ) : location.pathname === '/dashboard/student-verification' ? (
          <StudentsTable applicants={apiApplicants.map((a, idx) => ({
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
          <PendingDetails applicants={apiApplicants.map((a, idx) => ({
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
                      email: adminEmail || 'admin@company.com', // Use provided admin email or default
                      partitionKey,
                      rowKey,
                      action: 'approve', // Specify approval action
                    }),
                  });

                  const approvalData = await approvalResponse.json();
                  
                  if (approvalResponse.ok) {
                    // Check if both approvals are now complete
                    if (approvalResponse.status === 201 && approvalData.isComplete) {
                      // Both approvals received - update the final status to approved
                      console.log('Both approvals received, updating status to Approved');
                      
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
                        alert(`Success: Both approvals received!\nApprover 1: ${approvalData.approval1} (${approvalData.timeOfApproval1})\nApprover 2: ${approvalData.approval2} (${approvalData.timeOfApproval2})\nApplication has been approved!`);
                      } else {
                        alert(`Approvals complete but status update failed: ${await statusResponse.text()}`);
                      }
                    } else {
                      // First approval received, waiting for second
                      alert(`Success: ${approvalData.message}\nApprover: ${approvalData.approval1}\nTime: ${approvalData.timeOfApproval1}\nWaiting for second approval...`);
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
                      email: adminEmail || 'admin@company.com', // Use provided admin email or default
                      partitionKey,
                      rowKey,
                      action: 'deny', // Specify denial action
                    }),
                  });

                  const denialData = await denialResponse.json();
                  
                  if (denialResponse.ok) {
                    // Check if both denials are now complete
                    if (denialResponse.status === 201 && denialData.isDenialComplete) {
                      // Both denials received - update the final status to denied
                      console.log('Both denials received, updating status to Denied');
                      
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
                        alert(`Success: Both denials received!\nDenier 1: ${denialData.denial1} (${denialData.timeOfDenial1})\nDenier 2: ${denialData.denial2} (${denialData.timeOfDenial2})\nApplication has been denied!`);
                      } else {
                        alert(`Denials complete but status update failed: ${await statusResponse.text()}`);
                      }
                    } else {
                      // First denial received, waiting for second
                      alert(`Success: ${denialData.message}\nDenier: ${denialData.denial1}\nTime: ${denialData.timeOfDenial1}\nWaiting for second denial...`);
                    }
                  } else {
                    alert(`Denial Error: ${denialData.error || await denialResponse.text()}`);
                  }
                } catch (error) {
                  alert('Denial Error: ' + error);
                }
              }

              // Refetch API data to show updated statuses
              try {
                const refetchResponse = await fetch(API_BASE_URL);
                if (refetchResponse.ok) {
                  const refreshedData = await refetchResponse.json() as ApplicantBasic[];
                  console.log('After action - Updated data:', refreshedData.map(a => ({ 
                    name: `${a.firstName} ${a.lastName}`, 
                    status: a.status, 
                    statusType: typeof a.status,
                    processedStatus: getStatusDisplay(a.status === undefined ? null : Number(a.status))
                  })));
                  setApiApplicants(refreshedData);
                }
              } catch (error) {
                console.error('Error refetching data:', error);
              }
            }}
          />
        ) : location.pathname === '/dashboard/admissions' ? (
          <AdmissionsTable applicants={apiApplicants} />
        ) : (
          <Outlet />
        )}
      </main>
      {modalApplicant && (
        <div className="modal-overlay" onClick={() => setModalApplicant(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, margin: '0 auto', borderRadius: 16, boxShadow: '0 8px 32px rgba(2,60,105,0.18)', padding: '2.5rem 2rem 2rem 2rem', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible' }}>
            <button className="modal-close" onClick={() => setModalApplicant(null)} style={{ position: 'absolute', top: 18, right: 24, fontSize: 28, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            {/* Applicant image/avatar placeholder */}
            <div style={{ marginBottom: 18 }}>
              {modalApplicant.profileImage ? (
                <img
                  src={modalApplicant.profileImage}
                  alt={modalApplicant.firstName + ' ' + modalApplicant.lastName}
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', background: '#eee', display: 'block' }}
                />
              ) : modalApplicant.firstName && modalApplicant.lastName ? (
                <span style={{ width: 72, height: 72, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#888', fontSize: 32 }}>
                  {modalApplicant.firstName[0]}{modalApplicant.lastName[0]}
                </span>
              ) : (
                <span style={{ width: 72, height: 72, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 32 }}>?</span>
              )}
            </div>
            <h3 style={{ margin: '0 0 1.2rem 0', color: '#023c69', fontSize: '1.3rem', fontWeight: 700, textAlign: 'center' }}>Applicant Details</h3>
            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading details...</p>
              </div>
            ) : (
              <ModalDetailsContent modalApplicant={modalApplicant} />
            )}
          </div>
        </div>
      )}
      {/* Admission Form Modal */}
      {showAdmissionForm && (
        <div className="modal-overlay" onClick={() => setShowAdmissionForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, margin: '0 auto', borderRadius: 16, boxShadow: '0 8px 32px rgba(2,60,105,0.18)', padding: '2.5rem 2rem 2rem 2rem', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible' }}>
            <button className="modal-close" onClick={() => setShowAdmissionForm(false)} style={{ position: 'absolute', top: 18, right: 24, fontSize: 28, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            <NewAdmissionForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

const ModalDetailsContent: React.FC<{ modalApplicant: any }> = ({ modalApplicant }) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewType, setPreviewType] = React.useState<'image' | 'pdf' | 'txt' | 'doc' | 'other' | null>(null);
  const [txtContent, setTxtContent] = React.useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = React.useState<string>(modalApplicant.status || 'Pending');
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState<boolean>(false);

  // Helper to detect URLs
  const isUrl = (value: string) => /^https?:\/\//i.test(value);
  // Helper to detect image
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  // Helper to detect PDF
  const isPdf = (url: string) => /\.pdf$/i.test(url);
  // Helper to detect TXT
  const isTxt = (url: string) => /\.txt$/i.test(url);
  // Helper to detect DOC/DOCX
  const isDoc = (url: string) => /\.(doc|docx)$/i.test(url);

  React.useEffect(() => {
    if (previewType === 'txt' && previewUrl) {
      fetch(previewUrl)
        .then(res => res.text())
        .then(setTxtContent)
        .catch(() => setTxtContent('Could not load text file.'));
    } else {
      setTxtContent(null);
    }
  }, [previewType, previewUrl]);

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      // No backend/API call, just update local state
      setCurrentStatus(newStatus);
      // No alert or message box
      modalApplicant.status = newStatus;
    } catch (error) {
      // No error handling needed for local update
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'denied':
        return '#f44336';
      default:
        return '#666';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Status Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)', 
        borderRadius: 12, 
        padding: '1.2rem', 
        marginBottom: '1.5rem', 
        border: '2px solid #ff9800',
        boxShadow: '0 2px 8px rgba(255,152,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <h4 style={{ margin: 0, color: '#ff3d00', fontWeight: 700, fontSize: '1.1rem' }}>Application Status</h4>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#fff',
            background: `linear-gradient(90deg, ${getStatusColor(currentStatus)} 60%, ${getStatusColor(currentStatus)}dd 100%)`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {currentStatus}
          </span>
        </div>
        
        {/* Status Update Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleStatusUpdate('Pending')}
            disabled={isUpdatingStatus || currentStatus === 'Pending'}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #ff9800',
              background: currentStatus === 'Pending' ? '#ff9800' : '#fff',
              color: currentStatus === 'Pending' ? '#fff' : '#ff9800',
              fontWeight: 600,
              cursor: currentStatus === 'Pending' ? 'default' : 'pointer',
              fontSize: '0.85rem',
              opacity: isUpdatingStatus ? 0.6 : 1
            }}
            title="Set application to pending review (automatic for new applications)"
          >
            ⏳ Set Pending
          </button>
          <button
            onClick={() => handleStatusUpdate('Approved')}
            disabled={isUpdatingStatus || currentStatus === 'Approved'}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #4caf50',
              background: currentStatus === 'Approved' ? '#4caf50' : '#fff',
              color: currentStatus === 'Approved' ? '#fff' : '#4caf50',
              fontWeight: 600,
              cursor: currentStatus === 'Approved' ? 'default' : 'pointer',
              fontSize: '0.85rem',
              opacity: isUpdatingStatus ? 0.6 : 1
            }}
            title="Approve student and send approval email"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => handleStatusUpdate('Denied')}
            disabled={isUpdatingStatus || currentStatus === 'Denied'}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #f44336',
              background: currentStatus === 'Denied' ? '#f44336' : '#fff',
              color: currentStatus === 'Denied' ? '#fff' : '#f44336',
              fontWeight: 600,
              cursor: currentStatus === 'Denied' ? 'default' : 'pointer',
              fontSize: '0.85rem',
              opacity: isUpdatingStatus ? 0.6 : 1
            }}
            title="Deny application (feature coming soon)"
          >
            ❌ Deny (Coming Soon)
          </button>
        </div>
        
        {isUpdatingStatus && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '0.85rem', 
            color: '#ff9800', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid #ff9800',
              borderTop: '2px solid transparent',
              animation: 'spin 1s linear infinite'
            }}></div>
            Updating status...
          </div>
        )}
      </div>
      {Object.entries(modalApplicant).map(([key, value]) => {
        // Skip internal keys (case-insensitive)
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'partitionkey' || lowerKey === 'rowkey' || lowerKey === 'profileimage') {
          return null;
        }
        // Handle null status
        const displayValue = key === 'status' && (value === null || value === undefined) 
          ? 'Pending' 
          : String(value || '');
        // If value is a URL, show preview button
        if (isUrl(displayValue)) {
          return (
            <div key={key} style={{ marginBottom: '0.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f3f3', padding: '0.3rem 0' }}>
              <strong style={{ color: '#555', fontWeight: 600, fontSize: 15 }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  style={{ padding: '4px 12px', borderRadius: 5, border: '1px solid #ff9800', background: '#fff', color: '#ff9800', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => {
                    if (isImage(displayValue)) {
                      setPreviewType('image');
                    } else if (isPdf(displayValue)) {
                      setPreviewType('pdf');
                    } else if (isTxt(displayValue)) {
                      setPreviewType('txt');
                    } else if (isDoc(displayValue)) {
                      setPreviewType('doc');
                    } else {
                      setPreviewType('other');
                    }
                    setPreviewUrl(displayValue);
                  }}
                >
                  Preview
                </button>
                <span
                  className="modal-detail-value"
                  title={displayValue}
                  style={{
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    cursor: 'pointer',
                    color: '#333',
                    fontSize: 15,
                    position: 'relative',
                    background: copiedKey === key ? '#e0ffe0' : 'transparent',
                    borderRadius: copiedKey === key ? 4 : undefined,
                    transition: 'background 0.2s',
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(displayValue);
                    setCopiedKey(key);
                    setTimeout(() => setCopiedKey(null), 1200);
                  }}
                >
                  {displayValue}
                  {copiedKey === key && (
                    <span style={{
                      position: 'absolute',
                      left: '50%',
                      top: '1.8em',
                      transform: 'translateX(-50%)',
                      background: '#222',
                      color: '#fff',
                      borderRadius: 4,
                      padding: '2px 10px',
                      fontSize: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 10,
                    }}>Copied!</span>
                  )}
                </span>
              </span>
            </div>
          );
        }
        // Not a URL: normal copy-to-clipboard
        return (
          <div key={key} style={{ marginBottom: '0.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f3f3', padding: '0.3rem 0' }}>
            <strong style={{ color: '#555', fontWeight: 600, fontSize: 15 }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
            <span
              className="modal-detail-value"
              title={displayValue}
              style={{
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                verticalAlign: 'middle',
                cursor: 'pointer',
                color: '#333',
                fontSize: 15,
                position: 'relative',
                background: copiedKey === key ? '#e0ffe0' : 'transparent',
                borderRadius: copiedKey === key ? 4 : undefined,
                transition: 'background 0.2s',
              }}
              onClick={() => {
                navigator.clipboard.writeText(displayValue);
                setCopiedKey(key);
                setTimeout(() => setCopiedKey(null), 1200);
              }}
            >
              {displayValue}
              {copiedKey === key && (
                <span style={{
                  position: 'absolute',
                  left: '50%',
                  top: '1.8em',
                  transform: 'translateX(-50%)',
                  background: '#222',
                  color: '#fff',
                  borderRadius: 4,
                  padding: '2px 10px',
                  fontSize: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 10,
                }}>Copied!</span>
              )}
            </span>
          </div>
        );
      })}
      {/* Preview Modal */}
      {previewUrl && (
        <div className="modal-overlay" onClick={() => { setPreviewUrl(null); setTxtContent(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <button className="modal-close" onClick={() => { setPreviewUrl(null); setTxtContent(null); }} style={{ position: 'absolute', top: 18, right: 24, fontSize: 28, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            {previewType === 'image' ? (
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
            ) : previewType === 'pdf' ? (
              <iframe src={previewUrl} title="PDF Preview" style={{ width: 520, height: 400, border: 'none', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
            ) : previewType === 'txt' ? (
              <div style={{ width: '100%', maxHeight: 400, overflowY: 'auto', background: '#f7fafd', borderRadius: 8, padding: 16, fontFamily: 'monospace', fontSize: 15, color: '#222', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>{txtContent || 'Loading...'}</div>
            ) : previewType === 'doc' ? (
              <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`} title="Doc Preview" style={{ width: 520, height: 400, border: 'none', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p>Preview not supported. <a href={previewUrl} target="_blank" rel="noopener noreferrer">Open in new tab</a></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};