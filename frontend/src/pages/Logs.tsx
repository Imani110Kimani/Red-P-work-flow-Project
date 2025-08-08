import React, { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApplicantData } from '../contexts/ApplicantDataContext';


const Logs: React.FC = () => {
  const { applicants, detailedApplicants, fetchAllApplicantDetails, loading } = useApplicantData();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const applicantFilter = params.get('applicant');

  // Fetch all details on mount if not already loaded
  useEffect(() => {
    if (applicants.length > 0) {
      fetchAllApplicantDetails(applicants);
    }
  }, [applicants, fetchAllApplicantDetails]);

  // Helper for status badge color
  const getStatusClass = (action: string) => {
    switch (action.toLowerCase()) {
      case 'approved': return 'dashboard-status approved';
      case 'denied': return 'dashboard-status denied';
      default: return 'dashboard-status';
    }
  };

  // Transform detailed applicant data into logs
  const logs = useMemo(() => {
    const allLogs: Array<{ id: string; applicantName: string; action: string; by: string; time: string }> = [];
    applicants.forEach(app => {
      const key = `${app.partitionKey}|${app.rowKey}`;
      const details = detailedApplicants[key];
      if (!details) return;
      const name = `${details.firstName} ${details.lastName}`.trim();
      // Approvals
      let i = 1;
      while (details[`approval${i}`]) {
        allLogs.push({
          id: `${key}-approval${i}`,
          applicantName: name,
          action: 'Approved',
          by: details[`approval${i}`],
          time: details[`timeOfApproval${i}`] || '',
        });
        i++;
      }
      // Denials
      i = 1;
      while (details[`denial${i}`]) {
        allLogs.push({
          id: `${key}-denial${i}`,
          applicantName: name,
          action: 'Denied',
          by: details[`denial${i}`],
          time: details[`timeOfDenial${i}`] || '',
        });
        i++;
      }
    });
    // Sort logs by time descending (most recent first)
    return allLogs.sort((a, b) => (b.time || '').localeCompare(a.time || ''));
  }, [applicants, detailedApplicants]);

  const filteredLogs = applicantFilter
    ? logs.filter(log => log.applicantName.toLowerCase() === applicantFilter.toLowerCase())
    : logs;

  return (
    <div className="dashboard-recent-table" style={{ maxWidth: 900, margin: '2.5rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px 0 rgba(2,60,105,0.06)', padding: '2.5rem 2rem' }}>
      <h2 style={{ color: '#e53935', fontWeight: 900, marginBottom: '2rem', fontSize: '2rem', letterSpacing: '0.01em' }}>Approval Logs</h2>
      {applicantFilter && (
        <div style={{ marginBottom: 18, color: '#444', fontWeight: 600 }}>
          Showing logs for: <span style={{ color: '#e53935' }}>{applicantFilter}</span>
        </div>
      )}
      <table className="dashboard-table logs-table" style={{ color: 'var(--redp-text)', background: 'var(--redp-card)' }}>
        <thead>
          <tr>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Applicant</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Action</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>By</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
      <tr><td colSpan={4} className="dashboard-table-cell" style={{ textAlign: 'center', color: 'var(--redp-text)', background: 'var(--redp-table-bg)' }}>Loading logs...</td></tr>
          ) : filteredLogs.length === 0 ? (
      <tr><td colSpan={4} className="dashboard-table-cell" style={{ textAlign: 'center', color: 'var(--redp-text)', background: 'var(--redp-table-bg)' }}>No logs found for this applicant.</td></tr>
          ) : (
            filteredLogs.map(log => (
              <tr key={log.id} className="dashboard-table-row">
                <td className="dashboard-table-cell">{log.applicantName}</td>
                <td className={"dashboard-table-cell " + getStatusClass(log.action)}>{log.action}</td>
                <td className="dashboard-table-cell">{log.by}</td>
                <td className="dashboard-table-cell">{log.time}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Logs;
