// StudentsTable.tsx
// Shows all approved students in a table.
// Backend engineers: Integrate API calls for fetching approved students where noted below.
// For Azure Functions, connect data fetching to your HTTP triggers or function endpoints.
import React, { useState, useEffect } from 'react';
import './ApplicantList.css';
// ...existing code...


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

// ...existing code...


const StudentsTable: React.FC<{ applicants: Applicant[] }> = ({ applicants }) => {
  // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [applicantsPerPage, setApplicantsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Dropdown options for applicants per page
  const pageSizeOptions = [10, 25, 50, 100];

  // Filter for approved students only (status 2 or '2' or 'Approved')
  const approvedStudents = applicants.filter(a => String(a.status) === '2' || a.status === 'Approved');

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
  // ...existing code...
  return (
  <div className="students-table-container" style={{maxWidth: 600, width: '100%', margin: '2rem auto'}}>
      <h2>Approved Students</h2>
      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by first or last name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16, width: 240 }}
        />
      </div>
      <div style={{overflowX: 'auto'}}>
        <table className="dashboard-table" style={{ color: 'var(--redp-text)', background: 'var(--redp-card)' }}>
          <thead>
            <tr>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>First Name</th>
      <th className="dashboard-table-header-cell" style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Last Name</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr><td colSpan={2} className="dashboard-table-cell" style={{ textAlign: 'center', color: 'var(--redp-text)', background: 'var(--redp-table-bg)' }}>No approved students found.</td></tr>
            ) : (
              paginatedStudents.map(student => (
                <tr key={student.id} className="dashboard-table-row">
                  <td className="dashboard-table-cell" style={{ color: 'var(--redp-text)', background: 'var(--redp-table-bg)' }}>{student.firstName}</td>
                  <td className="dashboard-table-cell" style={{ color: 'var(--redp-text)', background: 'var(--redp-table-bg)' }}>{student.lastName}</td>
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
