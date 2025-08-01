import React from 'react';
import { useApplicantData } from '../contexts/ApplicantDataContext';


const Admissions: React.FC = () => {
  const { applicants, loading, error } = useApplicantData();

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>All Admissions</h2>
      {loading ? (
        <div style={{ color: '#888', padding: '2rem' }}>Loading admissions...</div>
      ) : error ? (
        <div style={{ color: '#f44336', padding: '2rem' }}>{error}</div>
      ) : (
        <div style={{overflowX: 'auto'}}>
          <table className="dashboard-table" style={{minWidth: 1100, width: '100%'}}>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Status</th>
                <th>Partition Key</th>
                <th>Row Key</th>
              </tr>
            </thead>
            <tbody>
              {applicants.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No admissions found.</td></tr>
              ) : (
                applicants.map((a, idx) => (
                  <tr key={a.rowKey || idx}>
                    <td>{a.firstName}</td>
                    <td>{a.lastName}</td>
                    <td>{a.status}</td>
                    <td>{a.partitionKey}</td>
                    <td>{a.rowKey}</td>
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

export default Admissions;
