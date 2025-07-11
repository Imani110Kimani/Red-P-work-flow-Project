// AdmissionsTable.tsx
// Shows all new admissions in a table.
// Backend engineers: Integrate API calls for fetching admissions where noted below.
// For Azure Functions, connect data fetching to your HTTP triggers or function endpoints.
import React from 'react';
import './Dashboard.css';

// TODO: Backend: Replace admissions array with data fetched from API
const admissions = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    dateOfBirth: '2005-06-15',
    gradeLevel: 10,
    schoolName: 'Springfield High School',
    location: '123 Main St, Springfield',
    essay: 'My essay about why I deserve the scholarship.',
    status: 'Approved',
  },
  {
    id: 2,
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@email.com',
    phone: '555-987-6543',
    dateOfBirth: '2006-02-10',
    gradeLevel: 9,
    schoolName: 'Green Valley Public School',
    location: '456 Green Rd, Valley',
    essay: 'I want to make a difference in my community.',
    status: 'Pending',
  },
  {
    id: 3,
    firstName: 'Amina',
    lastName: 'Njeri',
    email: 'amina@email.com',
    phone: '555-222-3333',
    dateOfBirth: '2007-03-20',
    gradeLevel: 8,
    schoolName: 'Nairobi High',
    location: '789 River Rd, Nairobi',
    essay: 'Education is the key to my future success.',
    status: 'Pending',
  },
];

const AdmissionsTable: React.FC = () => {
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
            {admissions.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: '#888' }}>No new admissions.</td></tr>
            ) : (
              admissions.map(adm => (
                <tr key={adm.id}>
                  <td>{adm.firstName}</td>
                  <td>{adm.lastName}</td>
                  <td>{adm.email}</td>
                  <td>{adm.phone}</td>
                  <td>{adm.dateOfBirth}</td>
                  <td>{adm.gradeLevel}</td>
                  <td>{adm.schoolName}</td>
                  <td>{adm.location}</td>
                  <td>{adm.essay}</td>
                  <td><span className={`status-badge ${adm.status.toLowerCase().replace(' ', '-')}`}>{adm.status}</span></td>
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
