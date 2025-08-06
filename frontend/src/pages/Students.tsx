import React, { useMemo } from 'react';
import { useApplicantData } from '../contexts/ApplicantDataContext';


const Students: React.FC = () => {
  const { applicants, detailedApplicants, loading, error, fetchAllApplicantDetails, refetchApplicants } = useApplicantData();


  // Only fetch details for approved applicants (status 2)
  React.useEffect(() => {
    const approved = applicants.filter((a: any) => {
      const num = typeof a.status === 'string' ? parseInt(a.status, 10) : a.status;
      return num === 2;
    });
    if (approved.length > 0) fetchAllApplicantDetails(approved);
  }, [applicants, fetchAllApplicantDetails]);

  // Only show approved students with detailed data
  // Status: 1 = Pending, 2 = Approved, 3 = Denied
  const statusToString = (status: string | number) => {
    const num = typeof status === 'string' ? parseInt(status, 10) : status;
    if (num === 2) return 'Approved';
    if (num === 1) return 'Pending';
    if (num === 3) return 'Denied';
    return String(status);
  };

  const approvedDetailed = useMemo(() => {
    return applicants
      .filter((a: any) => {
        const num = typeof a.status === 'string' ? parseInt(a.status, 10) : a.status;
        return num === 2;
      })
      .map((a: any) => {
        const d = detailedApplicants[`${a.partitionKey}|${a.rowKey}`] || {};
        return {
          id: a.rowKey,
          firstName: a.firstName,
          lastName: a.lastName,
          email: d.email || '',
          phone: d.phone || '',
          dateOfBirth: d.dateOfBirth || '',
          gradeLevel: d.gradeLevel || '',
          schoolName: d.schoolName || '',
          location: d.location || '',
          status: statusToString(a.status),
        };
      });
  }, [applicants, detailedApplicants]);

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ margin: 0 }}>Approved Students</h2>
        <button
          onClick={() => refetchApplicants()}
          title="Refresh applicants"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            marginLeft: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M1 20v-6a8 8 0 0 1 14-5.29L23 10" />
          </svg>
        </button>
      </div>
      {/* Debug: Show filtered approved students as JSON for troubleshooting */}
      <details style={{marginBottom: '1rem', background: '#f9f9f9', border: '1px solid #eee', padding: '0.5rem', borderRadius: 4}}>
        <summary style={{cursor: 'pointer', color: '#888'}}>Show debug: approved students data</summary>
        <pre style={{fontSize: 12, color: '#333', whiteSpace: 'pre-wrap'}}>{JSON.stringify(approvedDetailed, null, 2)}</pre>
      </details>
      {loading ? (
        <div style={{ color: '#888', padding: '2rem' }}>Loading students...</div>
      ) : error ? (
        <div style={{ color: '#f44336', padding: '2rem' }}>{error}</div>
      ) : (
        <div style={{overflowX: 'auto'}}>
          <table className="dashboard-table" style={{minWidth: 1100, width: '100%'}}>
            <caption style={{captionSide: 'top', fontWeight: 'bold', padding: '0.5rem'}}>Only students with status <span style={{color:'#388e3c'}}>Approved</span> are shown</caption>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date of Birth</th>
                <th>Grade</th>
                <th>School</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {approvedDetailed.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: '#888' }}>No approved students found.</td></tr>
              ) : (
                approvedDetailed.map((a: any, idx: number) => (
                  <tr key={a.id || idx}>
                    <td>{a.firstName}</td>
                    <td>{a.lastName}</td>
                    <td>{a.email}</td>
                    <td>{a.phone}</td>
                    <td>{a.dateOfBirth}</td>
                    <td>{a.gradeLevel}</td>
                    <td>{a.schoolName}</td>
                    <td>{a.location}</td>
                    <td>{a.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Students;
