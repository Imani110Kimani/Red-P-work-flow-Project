// StudentsTable.tsx
// Shows all approved students in a table.
// Backend engineers: Integrate API calls for fetching approved students where noted below.
// For Azure Functions, connect data fetching to your HTTP triggers or function endpoints.
import React, { useState, useEffect } from 'react';
import './ApplicantList.css';


// Applicant type should match backend data model for a student
type Applicant = {
  id: string; // changed from number to string
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


const StudentsTable: React.FC<{ applicants: Applicant[] }> = ({ applicants }) => {
  // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [applicantsPerPage, setApplicantsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Dropdown options for applicants per page
  const pageSizeOptions = [10, 25, 50, 100];

  // Filter for approved students only
  const approvedStudents = applicants.filter(a => a.status === 'Approved');

  // Filter by search
  const filteredStudents = approvedStudents.filter(a => {
    const searchLower = search.toLowerCase();
    return (
      a.firstName.toLowerCase().includes(searchLower) ||
      a.lastName.toLowerCase().includes(searchLower) ||
      a.schoolName.toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / applicantsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );

  // Reset to page 1 if search changes
  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="students-table-container" style={{maxWidth: 1100, width: '100%', margin: '2rem auto'}}>
      <h2>Approved Students</h2>
      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name or school..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16, width: 240 }}
        />
      </div>
      <div style={{overflowX: 'auto'}}>
        <table className="students-table" style={{minWidth: 700}}>
          <thead>
            <tr>
              <th>Name</th>
              <th>School</th>
              <th>Grade Level</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No approved students found.</td></tr>
            ) : (
              paginatedStudents.map(student => (
                <tr key={student.id} style={{ borderBottom: '1.5px solid #ff9800', background: '#fff' }}>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.firstName}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.lastName}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.schoolName}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.gradeLevel}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.email}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.phone}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.dateOfBirth}</td>
                  <td style={{ color: '#222', fontWeight: 500 }}>{student.location}</td>
                  <td style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    color: 'white',
                    background: '#4caf50'
                  }}>
                    {student.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        {/* Page size dropdown */}
        <div>
          <label htmlFor="pageSize" style={{ marginRight: 8 }}>Rows per page:</label>
          <select
            id="pageSize"
            value={applicantsPerPage}
            onChange={e => {
              setCurrentPage(1);
              setApplicantsPerPage(Number(e.target.value));
            }}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #bbb' }}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        {/* Page navigation dropdown */}
        {totalPages > 1 && (
          <div>
            <label htmlFor="pageNav" style={{ marginRight: 8 }}>Page:</label>
            <select
              id="pageNav"
              value={currentPage}
              onChange={e => setCurrentPage(Number(e.target.value))}
              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #bbb' }}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <option key={page} value={page}>{page}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

// Exported for use in Dashboard. Backend: Pass applicants prop from API data.
export default StudentsTable;
