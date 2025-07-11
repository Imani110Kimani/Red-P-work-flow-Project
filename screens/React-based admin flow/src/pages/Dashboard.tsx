// Dashboard.tsx
// Main admin dashboard page. Handles navigation, summary, and renders all major admin tables.
// Backend engineers: Integrate API calls for fetching applicants, updating status, and admissions where noted below.
// For Azure Functions, connect the action handlers to your HTTP triggers or function endpoints.
import React, { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import StudentsTable from './StudentsTable';
import PendingDetails from './PendingDetails';
import ApplicantList from './ApplicantList';
import AdmissionsTable from './AdmissionsTable';
import './Dashboard.css';
import logo from '../assets/redp-logo (2).png';
import { FaTachometerAlt, FaUsers, FaUserGraduate, FaBell, FaSignOutAlt } from 'react-icons/fa';

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
const initialApplicants = [
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



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State for API data
  const [apiApplicants, setApiApplicants] = React.useState<ApplicantBasic[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // State for detailed modal
  const [modalApplicant, setModalApplicant] = React.useState<ApplicantDetailed | null>(null);
  const [modalLoading, setModalLoading] = React.useState<boolean>(false);
  
  // Legacy state for compatibility (using fallback data)
  const [applicants, setLegacyApplicants] = React.useState(initialApplicants);

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
        status: a.status || 'Pending',
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
    const approvedCount = dataSource.filter(a => (a.status || 'Pending') === 'Approved').length;
    const pendingCount = dataSource.filter(a => (a.status || 'Pending') === 'Pending').length;
    
    return [
      { label: 'Admissions', value: 4, color: '#ff3d00', route: '/dashboard/admissions', icon: <FaTachometerAlt /> },
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
    setApplicants(prev => {
      if (newStatus === 'Denied') {
        return prev.filter(a => a.id !== id);
      }
      return prev.map(a => a.id === id ? { ...a, status: newStatus } : a);
    });
    // If modal is open for this applicant, update modalApplicant to reflect new status
    setModalApplicant(prevModal => {
      if (prevModal && prevModal.id === id) {
        return { ...prevModal, status: newStatus };
      }
      return prevModal;
    });
  };

  return (
    <div className="admin-layout" style={{ position: 'relative' }}>
      {/* Notification bell moved to far top right, outside header */}
      <button
        className="dashboard-icon-btn"
        title="Notifications"
        onClick={() => navigate('/notifications')}
        style={{
          position: 'absolute',
          top: 18,
          right: 32,
          zIndex: 20,
        }}
      >
        <FaBell />
      </button>
      <aside className="admin-sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')}>
          <img src={logo} alt="RED(P) Logo" />
          <span>RED(P) Admin</span>
        </div>
        <nav className="sidebar-nav">
          <button onClick={() => navigate('/dashboard')}><FaTachometerAlt /> Dashboard</button>
          <button onClick={() => navigate('/dashboard/applicants')}><FaUsers /> Applicants</button>
          <button onClick={() => navigate('/dashboard/admissions')}><FaTachometerAlt /> Admissions</button>
          {/* Schools removed */}
          <button onClick={() => navigate('/dashboard/student-verification')}><FaUserGraduate /> Students</button>
          <button onClick={() => navigate('/dashboard/pending')}><FaUsers /> Pending</button>
          <button onClick={() => navigate('/dashboard/notifications')}><FaBell /> Notifications</button>
          {/* Profile button removed */}
          <button className="sidebar-logout" onClick={() => navigate('/') }><FaSignOutAlt /> Logout</button>
        </nav>
      </aside>
      <main className="admin-main">
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
                <button className="dashboard-action-btn primary" onClick={() => navigate('/admissions/1')}>📝 New Admission</button>
                <button className="dashboard-action-btn" onClick={() => navigate('/notifications')}>📢 Notify</button>
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
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>Loading applicants...</td></tr>
                    ) : filteredRecent.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>No results found.</td></tr>
                    ) : (
                      filteredRecent.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: 'white',
                              background: item.status === 'Approved' ? '#4caf50' : 
                                         item.status === 'Pending' ? '#ff9800' : 
                                         item.status === 'Denied' ? '#f44336' : '#666'
                            }}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            {apiApplicants.length > 0 ? (
                              <button 
                                className="dashboard-table-link"
                                onClick={() => {
                                  const applicant = apiApplicants.find(a => `${a.firstName} ${a.lastName}` === item.name);
                                  if (applicant) {
                                    fetchApplicantDetails(applicant.partitionKey, applicant.rowKey);
                                  }
                                }}
                              >
                                View Details
                              </button>
                            ) : (
                              <button 
                                className="dashboard-table-link" 
                                onClick={() => {
                                  const legacyApplicant = applicants.find(a => a.id === item.id);
                                  if (legacyApplicant) {
                                    // Convert legacy applicant to ApplicantDetailed format for modal
                                    setModalApplicant({
                                      firstName: legacyApplicant.firstName,
                                      lastName: legacyApplicant.lastName,
                                      status: legacyApplicant.status,
                                      partitionKey: 'demo',
                                      rowKey: legacyApplicant.id.toString(),
                                      email: legacyApplicant.email,
                                      phone: legacyApplicant.phone,
                                      dateOfBirth: legacyApplicant.dateOfBirth,
                                      gradeLevel: legacyApplicant.gradeLevel,
                                      schoolName: legacyApplicant.schoolName,
                                      location: legacyApplicant.location,
                                      essay: legacyApplicant.essay
                                    });
                                  }
                                }}
                              >
                                View
                              </button>
                            )}
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
                <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8}}>
                  <span style={{fontWeight: 700, color: '#ff3d00'}}>4</span>
                  <span style={{color: '#222', fontSize: '0.97em'}}>of 10 target</span>
                </div>
                <div style={{background: '#ff9800', borderRadius: 8, height: 10, width: '100%', marginBottom: 4}}>
                  <div style={{background: 'linear-gradient(90deg, #ff3d00 60%, #ff9800 100%)', width: '40%', height: '100%', borderRadius: 8}}></div>
                </div>
                <div style={{fontSize: '0.93em', color: '#ff9800'}}>Keep going! </div>
              </div>
              {/* Modern Notifications Feed */}
              <div style={{background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(255,61,0,0.07)', padding: '1.1rem 1rem 1.2rem 1rem'}}>
                <div style={{fontWeight: 700, color: '#ff3d00', marginBottom: 10}}>Recent Notifications</div>
                <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12}}>
                  <li style={{color: '#ff3d00', fontWeight: 700, marginBottom: 2}}>New applicant Jane Doe submitted an application.</li>
                  <li style={{color: '#ff9800', fontWeight: 700, marginBottom: 2}}>Rajombol Siayho was approved.</li>
                  <li style={{color: '#222', fontWeight: 700}}>Amina Njeri application is in progress.</li>
                </ul>
              </div>
            </aside>
          </div>
        ) : location.pathname === '/dashboard/student-verification' ? (
          <StudentsTable applicants={applicants} />
        ) : location.pathname === '/dashboard/pending' ? (
          <PendingDetails
            applicants={applicants.map(a => ({
              ...a,
              name: `${a.firstName} ${a.lastName}`,
              school: a.schoolName,
              submittedOn: a.dateOfBirth, // or use a real submission date if available
              reason: '', // or provide a default/real reason
              notes: '', // or provide a default/real notes
            }))}
          />
        ) : location.pathname === '/dashboard/applicants' ? (
          <ApplicantList />
        ) : location.pathname === '/dashboard/admissions' ? (
          <AdmissionsTable />
        ) : (
          <Outlet />
        )}
      </main>
      {modalApplicant && (
        <div className="modal-overlay" onClick={() => setModalApplicant(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalApplicant(null)}>&times;</button>
            <h3>Applicant Details</h3>
            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading details...</p>
              </div>
            ) : (
              <div>
                {/* Display all fields from the detailed API response */}
                {Object.entries(modalApplicant).map(([key, value]) => {
                  // Skip internal keys (case-insensitive)
                  const lowerKey = key.toLowerCase();
                  if (lowerKey === 'partitionkey' || lowerKey === 'rowkey') {
                    return null;
                  }
                  
                  // Handle null status
                  const displayValue = key === 'status' && (value === null || value === undefined) 
                    ? 'Pending' 
                    : String(value || '');
                  
                  return (
                    <div key={key} style={{ marginBottom: '0.5rem' }}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {displayValue}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;