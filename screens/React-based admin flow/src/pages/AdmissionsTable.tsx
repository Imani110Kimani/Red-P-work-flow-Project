// AdmissionsTable.tsx
// Shows all new admissions in a table.
// Backend engineers: Integrate API calls for fetching admissions where noted below.
// For Azure Functions, connect data fetching to your HTTP triggers or function endpoints.
import React from 'react';
import './Dashboard.css';

// Type for API applicant data
type ApplicantBasic = {
  firstName: string;
  lastName: string;
  status: string;
  partitionKey: string;
  rowKey: string;
  [key: string]: any; // Additional fields from API
};

// Helper function to get status display
function getStatusDisplay(status: number | null) {
  if (status === null || status === 1) {
    return 'Pending';
  } else if (status === 2) {
    return 'Approved';
  } else if (status === 3) {
    return 'Denied';
  }
  return 'Pending';
}

interface AdmissionsTableProps {
  applicants: ApplicantBasic[];
}

const AdmissionsTable: React.FC<AdmissionsTableProps> = ({ applicants }) => {
  return (
    <div className="dashboard-recent-table" style={{maxWidth: 1100, width: '100%', minWidth: 0, margin: '2rem auto', padding: '0 1rem', boxSizing: 'border-box'}}>
      <h2>New Admissions</h2>
      <div style={{overflowX: 'auto'}}>
        <table className="dashboard-table" style={{minWidth: 1100, width: '100%'}}>
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
              <th>Essay</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: '#888' }}>No new admissions.</td></tr>
            ) : (
              applicants.map((applicant, idx) => (
                <tr key={applicant.rowKey || idx}>
                  <td>{applicant.firstName}</td>
                  <td>{applicant.lastName}</td>
                  <td>{applicant.email || 'N/A'}</td>
                  <td>{applicant.phone || 'N/A'}</td>
                  <td>{applicant.dateOfBirth || 'N/A'}</td>
                  <td>{applicant.gradeLevel || 'N/A'}</td>
                  <td>{applicant.schoolName || 'N/A'}</td>
                  <td>{applicant.location || 'N/A'}</td>
                  <td>{applicant.essay || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusDisplay(applicant.status === undefined ? null : Number(applicant.status)).toLowerCase().replace(' ', '-')}`}>
                      {getStatusDisplay(applicant.status === undefined ? null : Number(applicant.status))}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdmissionsTable;
