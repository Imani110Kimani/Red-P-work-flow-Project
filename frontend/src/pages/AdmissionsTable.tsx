// AdmissionsTable.tsx
// Shows all new admissions in a table.
// Backend engineers: Integrate API calls for fetching admissions where noted below.
// For Azure Functions, connect data fetching to your HTTP triggers or function endpoints.
import React from 'react';
import './Dashboard.css';
import { statusToString } from './utils';

// Type for API applicant data
type ApplicantBasic = {
  firstName: string;
  lastName: string;
  status: string;
  partitionKey: string;
  rowKey: string;
  [key: string]: any; // Additional fields from API
};

interface AdmissionsTableProps {
  applicants: ApplicantBasic[];
}

const AdmissionsTable: React.FC<AdmissionsTableProps> = ({ applicants }) => {
  return (
  <div className="dashboard-recent-table" style={{maxWidth: 1100, width: '100%', minWidth: 0, margin: '2rem auto', padding: '0 1rem', boxSizing: 'border-box'}}>
      <h2>New Admissions</h2>
      <div style={{overflowX: 'auto'}}>
  <table className="dashboard-table" style={{ color: 'var(--redp-text)', background: 'var(--redp-card)' }}>
          <thead>
            <tr>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>First Name</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Last Name</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Email</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Phone</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Date of Birth</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Grade</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>School</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Location</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Essay</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 ? (
      <tr><td colSpan={10} className="dashboard-table-cell" style={{ textAlign: 'center', color: 'var(--redp-text)', background: 'var(--redp-table-bg)' }}>No new admissions.</td></tr>
            ) : (
              applicants.map((applicant, idx) => (
                <tr key={applicant.rowKey || idx} className="dashboard-table-row">
                  <td className="dashboard-table-cell">{applicant.firstName}</td>
                  <td className="dashboard-table-cell">{applicant.lastName}</td>
                  <td className="dashboard-table-cell">{applicant.email || 'N/A'}</td>
                  <td className="dashboard-table-cell">{applicant.phone || 'N/A'}</td>
                  <td className="dashboard-table-cell">{applicant.dateOfBirth || 'N/A'}</td>
                  <td className="dashboard-table-cell">{applicant.gradeLevel || 'N/A'}</td>
                  <td className="dashboard-table-cell">{applicant.schoolName || 'N/A'}</td>
                  <td className="dashboard-table-cell">{applicant.location || 'N/A'}</td>
                  <td className="dashboard-table-cell">{applicant.essay || 'N/A'}</td>
                  <td className={`dashboard-table-cell dashboard-status ${statusToString(applicant.status).toLowerCase()}`}>{statusToString(applicant.status)}</td>
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
