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
  // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [applicantsPerPage, setApplicantsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Dropdown options for applicants per page
  const pageSizeOptions = [10, 25, 50, 100];

  const pending = applicants.filter(a => a.status === 'Pending');
  
  // Filter by search
  const filteredPending = pending.filter(a => {
    const searchLower = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(searchLower) ||
      a.school.toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPending.length / applicantsPerPage);
  const paginatedPending = filteredPending.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );

  // Reset to page 1 if search changes
  useEffect(() => { setCurrentPage(1); }, [search]);

  // Local state for editing reasons/notes
  const [edits, setEdits] = React.useState<{ [id: string]: { reason: string; notes: string } }>({});

  // Handler for editing reason/notes
  const handleEdit = (id: string, field: 'reason' | 'notes', value: string) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Handler for saving to backend (API/Azure Function)
  const handleSave = (id: string, field: 'reason' | 'notes') => {
    // TODO: Backend: Save edits[id][field] to backend for applicant with id
    // Example: await api.updatePendingReasonOrNotes(id, field, edits[id][field])
    // Optionally show a loading indicator or success message
  };

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
              <th>Reason</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPending.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No pending applications.</td></tr>
            ) : (
              paginatedPending.map(applicant => (
                <tr key={applicant.id}>
                  <td>{applicant.name}</td>
                  <td>{applicant.school}</td>
                  <td>{applicant.submittedOn}</td>
                  <td>
                    {/* Editable Reason. Backend: Save onBlur or onChange as needed. */}
                    <textarea
                      value={edits[applicant.id]?.reason ?? applicant.reason}
                      onChange={e => handleEdit(applicant.id, 'reason', e.target.value)}
                      onBlur={() => handleSave(applicant.id, 'reason')}
                      rows={2}
                      style={{ width: '100%', minWidth: 120, borderRadius: 6, border: '1.5px solid #ff9800', padding: 4, fontSize: '1em', resize: 'vertical' }}
                      placeholder="Enter reason..."
                    />
                  </td>
                  <td>
                    {/* Editable Notes. Backend: Save onBlur or onChange as needed. */}
                    <textarea
                      value={edits[applicant.id]?.notes ?? applicant.notes}
                      onChange={e => handleEdit(applicant.id, 'notes', e.target.value)}
                      onBlur={() => handleSave(applicant.id, 'notes')}
                      rows={2}
                      style={{ width: '100%', minWidth: 120, borderRadius: 6, border: '1.5px solid #ff9800', padding: 4, fontSize: '1em', resize: 'vertical' }}
                      placeholder="Enter notes..."
                    />
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

export default PendingDetails;
