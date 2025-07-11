// StudentsTable.tsx
// Shows all approved students in a table.
// Backend engineers: Integrate API calls for fetching approved students where noted below.
// For Azure Functions, connect data fetching to your HTTP triggers or function endpoints.
import React from 'react';
import './ApplicantList.css';


// Applicant type should match backend data model for a student
type Applicant = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gradeLevel: number;
  schoolName: string;
  location: string;
  status: string;
  // Add any additional fields from backend as needed
};

interface StudentsTableProps {
  applicants: Applicant[];
}


const StudentsTable: React.FC<StudentsTableProps> = ({ applicants }) => {
  // TODO: Backend: Filter applicants in parent or fetch only approved students from API
  const students = applicants.filter(a => a.status === 'Approved');
  return (
    <div className="applicant-list-container" style={{maxWidth: 1100, width: '100%', minWidth: 0, margin: '2rem auto', padding: '0 1.5rem'}}>
      <h2 className="applicant-list-title" style={{ color: '#ff3d00', fontWeight: 800, letterSpacing: 1 }}>Approved Students</h2>
      <div style={{overflowX: 'auto'}}>
        <table className="applicant-list-table" style={{minWidth: 900, borderCollapse: 'separate', borderSpacing: 0, boxShadow: '0 2px 16px 0 rgba(34,34,34,0.08)', borderRadius: 12, overflow: 'hidden', background: '#fff', border: '2px solid #ff3d00'}}>
          <thead style={{ background: '#ff3d00' }}>
            <tr>
              <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>First Name</th>
              <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Last Name</th>
              <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Email</th>
              <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Phone</th>
              <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Date of Birth</th>
              <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Grade</th>
              <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>School</th>
              <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Location</th>
              <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: '#ff3d00', fontWeight: 600, padding: '2rem 0' }}>
                  No approved students.
                </td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student.id} style={{ borderBottom: '1.5px solid #ff9800', background: '#fff' }}>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.firstName}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.lastName}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.email}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.phone}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.dateOfBirth}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.gradeLevel}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.schoolName}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.location}</td>
                  <td>
                    <span
                      className={`status-badge ${student.status.toLowerCase().replace(' ', '-')}`}
                      style={{
                        background:
                          student.status === 'Approved'
                            ? 'linear-gradient(90deg, #ff3d00 60%, #ff9800 100%)'
                            : student.status === 'Pending'
                            ? '#ff9800'
                            : '#222',
                        color: '#fff',
                        borderRadius: 6,
                        padding: '2px 10px',
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        fontSize: '0.98em',
                        display: 'inline-block',
                        minWidth: 80,
                        textAlign: 'center',
                        boxShadow: '0 1px 6px 0 rgba(255,61,0,0.08)',
                        border: '1.5px solid #ff9800',
                      }}
                    >
                      {student.status}
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

// Exported for use in Dashboard. Backend: Pass applicants prop from API data.
export default StudentsTable;
