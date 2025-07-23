import React, { useState, useEffect } from "react";
import "./PendingDetails.css";
import { statusToString, joinName, paginate } from './utils';

// Accepts applicants as prop and filters for status === 'Pending'

interface Applicant {
  id: string; // changed from number to string
  name: string;
  school: string;
  status: string;
  submittedOn: string;
  reason: string;
  notes: string;
}

const PendingDetails: React.FC<{ applicants: Applicant[] }> = ({ applicants }) => {
  // Restore state and logic for search, pagination, and page size
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [applicantsPerPage, setApplicantsPerPage] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];
  // Filter and paginate applicants
  const filtered = applicants.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.school.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / applicantsPerPage);
  const paginatedPending = filtered.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );
  // Reset to page 1 if search changes
  useEffect(() => { setCurrentPage(1); }, [search]);
  return (
    <div className="pending-details-container" style={{maxWidth: 1100, width: '100%', margin: '2rem auto'}}>
      <h2>Pending Applications</h2>
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
        <table className="pending-table" style={{minWidth: 700}}>
          <thead>
            <tr>
              <th>Name</th>
              <th>School</th>
              <th>Submitted On</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPending.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>No pending applications.</td></tr>
            ) : (
              paginatedPending.map(applicant => (
                <tr key={applicant.id}>
                  <td>{applicant.name}</td>
                  <td>{applicant.school}</td>
                  <td>{applicant.submittedOn}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <div>
          <label htmlFor="pending-page-size">Rows per page: </label>
          <select
            id="pending-page-size"
            value={applicantsPerPage}
            onChange={e => setApplicantsPerPage(Number(e.target.value))}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #bbb' }}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        {totalPages > 1 && (
          <div>
            <label htmlFor="pending-page-select">Page: </label>
            <select
              id="pending-page-select"
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
  // ...existing code...
};

export default PendingDetails;
