import React from 'react';
import './Notifications.css';
// Import legacy applicants and API applicants logic from Dashboard
import { initialApplicants } from './Dashboard';
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
  // Show up to 10 most recent
  return sorted.slice(0, 10).map((a, idx) => {
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
    const dateStr = hasDateOfBirth(a) ? a.dateOfBirth : hasDate(a) ? a.date : '';
    return {
      id: idx + 1,
      message: msg,
      date: dateStr,
      status,
    };
  });
};

const Notifications: React.FC = () => {
  // Use the same applicants state as Dashboard for consistent notifications
  // Try to access the applicants from Dashboard if possible
  const [apiApplicants, setApiApplicants] = React.useState<any[]>([]);
  const [applicants, setApplicants] = React.useState<any[]>(initialApplicants);

  React.useEffect(() => {
    // Try to fetch the same API applicants as Dashboard
    fetch('https://simbagetapplicants-hcf5cffbcccmgsbn.westus-01.azurewebsites.net/api/httptablefunction')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setApiApplicants(data))
      .catch(() => setApiApplicants([]));
  }, []);

  const notifications = getRecentNotifications(apiApplicants, applicants);
  return (
    <div className="logs-container">
      <h2 className="logs-title">Logs</h2>
      <div className="logs-list">
        {notifications.length === 0 ? (
          <div style={{textAlign:'center', color:'#888', padding:'2rem'}}>No logs available.</div>
        ) : notifications.map((n) => (
          <div className="log-item" key={n.id}>
            <div className="log-message" style={{color: n.status === 'approved' ? '#ff9800' : n.status === 'denied' ? '#f44336' : '#ff3d00', fontWeight: 700}}>
              {n.message}
              {n.status === 'approved' && (
                <span style={{color:'#222', fontWeight:400, marginLeft:8, fontSize:'0.97em'}}>
                  — Approved by Admin
                </span>
              )}
            </div>
            {n.date && <div className="log-date">{n.date}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
