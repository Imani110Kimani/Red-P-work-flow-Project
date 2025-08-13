import React from 'react';
import './Notifications.css';
// Import legacy applicants and API applicants logic from Dashboard
import { initialApplicants } from './initialApplicants';
import { statusToString, joinName, notificationMessage } from './utils';

const getRecentNotifications = (apiApplicants: any[], applicants: any[]) => {
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
  // Show only the 7 most recent applicants
  return sorted.slice(0, 7).map((a, idx) => {
    const status = statusToString(a.status).toLowerCase();
    const firstName = (a as any).firstName || (hasName(a) ? a.name.split(' ')[0] : '');
    const lastName = (a as any).lastName || (hasName(a) ? a.name.split(' ').slice(1).join(' ') : '');
    let action = '';
    if (status === 'approved') {
      action = 'Approved';
    } else if (status === 'pending') {
      action = 'Applied';
    } else if (status === 'denied') {
      action = 'Denied';
    } else {
      action = 'In Progress';
    }
    // Admin and reason fields (empty for now, will fill if present)
    const admin = a.approval1 || a.denial1 || '';
    const reason = a.reason || '';
    // Date string
    const dateStr = hasDateOfBirth(a) ? a.dateOfBirth : hasDate(a) ? a.date : '';
    return {
      id: idx + 1,
      action,
      applicant: `${firstName} ${lastName}`.trim(),
      status,
      admin,
      reason,
      date: dateStr,
    };
  });
};


const API_BASE_URL = 'https://simbagetapplicants-hcf5cffbcccmgsbn.westus-01.azurewebsites.net/api/httptablefunction';

const Notifications: React.FC = () => {
  const [apiApplicants, setApiApplicants] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string|null>(null);

  React.useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch applicants');
        const data = await response.json();
        setApiApplicants(data);
      } catch (err) {
        setError('Could not load logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, []);

  const notifications = getRecentNotifications(apiApplicants, initialApplicants);
  return (
    <div className="logs-container">
      <h2 className="logs-title">Recent Notifications</h2>
      <div className="logs-list" style={{padding:0}}>
        {loading ? (
          <div style={{textAlign:'center', color:'#888', padding:'2rem'}}>Loading notifications...</div>
        ) : error ? (
          <div style={{textAlign:'center', color:'#f44336', padding:'2rem'}}>{error}</div>
        ) : notifications.length === 0 ? (
          <div style={{textAlign:'center', color:'#888', padding:'2rem'}}>No notifications available.</div>
        ) : notifications.map((n) => (
          <div className="log-item" key={n.id} style={{
            background:'#fff8e1',
            borderRadius:8,
            marginBottom:10,
            padding:'10px 14px',
            boxShadow:'0 1px 4px 0 rgba(255,152,0,0.07)',
            display:'flex',
            flexDirection:'column',
            borderLeft:`4px solid ${n.status === 'approved' ? '#ff9800' : n.status === 'denied' ? '#f44336' : '#ff3d00'}`
          }}>
            <div style={{fontWeight:700, color: n.status === 'approved' ? '#ff9800' : n.status === 'denied' ? '#f44336' : '#ff3d00'}}>
              {n.action}: {n.applicant}
            </div>
            <div style={{fontSize:'0.97em', color:'#444', marginTop:2}}>
              {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
              {n.admin && (
                <span style={{marginLeft:8, color:'#888'}}>by {n.admin}</span>
              )}
              {n.reason && (
                <span style={{marginLeft:8, color:'#888'}}>({n.reason})</span>
              )}
            </div>
            {n.date && <div style={{fontSize:'0.93em', color:'#888', marginTop:2}}>{n.date}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
