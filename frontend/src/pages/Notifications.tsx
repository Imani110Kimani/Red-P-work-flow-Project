
import React from 'react';
import './Notifications.css';
import { useApplicantData } from '../contexts/ApplicantDataContext';

const statusToString = (status: string | number | undefined) => {
  if (typeof status === 'number') {
    if (status === 2) return 'Approved';
    if (status === 3) return 'Denied';
    if (status === 1) return 'Pending';
  }
  if (typeof status === 'string') {
    if (status === '2') return 'Approved';
    if (status === '3') return 'Denied';
    if (status === '1') return 'Pending';
    if (status.toLowerCase() === 'approved' || status.toLowerCase() === 'denied' || status.toLowerCase() === 'pending') return status;
  }
  return 'Unknown';
};

const Notifications: React.FC = () => {
  const { applicants, detailedApplicants, loading, error, fetchAllApplicantDetails, invalidateCache } = useApplicantData();

  // Show all applicants
  const allApplicants = applicants;

  // Fetch detailed data for all applicants on mount or when applicants change
  React.useEffect(() => {
    if (allApplicants.length > 0) {
      fetchAllApplicantDetails(allApplicants);
    }
  }, [allApplicants, fetchAllApplicantDetails]);

  // Debug: log detailedApplicants to see if data is being populated
  console.debug('Notifications detailedApplicants:', detailedApplicants);

  return (
    <div className="logs-container">
      <h2 className="logs-title">Applicant Actions Log</h2>
      <div className="logs-list" style={{background:'#fff', borderRadius:14, boxShadow:'0 1px 8px 0 rgba(255,61,0,0.07)', padding:'1.1rem 1rem 1.2rem 1rem', margin:'2rem auto', maxWidth: '100%', overflowX: 'auto', overflowY: 'auto', maxHeight: 420}}>
        {loading ? (
          <div style={{textAlign:'center', color:'#888', padding:'2rem'}}>Loading logs...</div>
        ) : error ? (
          <div style={{textAlign:'center', color:'#f44336', padding:'2rem'}}>{error}</div>
        ) : allApplicants.length === 0 ? (
          <div style={{textAlign:'center', color:'#888', padding:'2rem'}}>No logs available.</div>
        ) : (
          <div style={{minWidth:'600px', width:'100%'}}>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.98em', minWidth: '600px'}}>
              <thead>
                <tr style={{background:'#ffe0d1', color:'#222', fontWeight:700}}>
                  <th style={{padding:'8px'}}>Student</th>
                  <th style={{padding:'8px'}}>Status</th>
                  <th style={{padding:'8px'}}>Approved By</th>
                  <th style={{padding:'8px'}}>Denied By</th>
                </tr>
              </thead>
              <tbody>
                {allApplicants.map(app => {
                  const key = `${app.partitionKey}|${app.rowKey}`;
                  const details = detailedApplicants[key];
                  const applicantName = `${app.firstName || ''} ${app.lastName || ''}`.trim();
                  // Copying logic from ApplicantList
                  let approvedBy = '-';
                  let deniedBy = '-';
                  if (details) {
                    const approvals = [];
                    if (details.approval1) approvals.push(details.approval1);
                    if (details.approval2) approvals.push(details.approval2);
                    approvedBy = approvals.length > 0 ? approvals.join(', ') : '-';
                    const denials = [];
                    if (details.denial1) denials.push(details.denial1);
                    if (details.denial2) denials.push(details.denial2);
                    deniedBy = denials.length > 0 ? denials.join(', ') : '-';
                  } else {
                    approvedBy = deniedBy = 'Loading...';
                  }
                  return (
                    <tr key={key} style={{borderBottom:'1px solid #f5f5f5'}}>
                      <td style={{padding:'8px', fontWeight:600}}>{applicantName}</td>
                      <td style={{padding:'8px'}}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.95em',
                          fontWeight: 600,
                          color: '#fff',
                          background: statusToString(app.status) === 'Approved' ? '#4caf50' : statusToString(app.status) === 'Denied' ? '#f44336' : '#ff9800',
                          minWidth: 90,
                          display: 'inline-block',
                        }}>{statusToString(app.status)}</span>
                      </td>
                      <td style={{padding:'8px', color: !details ? '#888' : undefined}}>{approvedBy}</td>
                      <td style={{padding:'8px', color: !details ? '#888' : undefined}}>{deniedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;