
// ApplicantList.tsx
// This component displays all scholarship applications in a table with action controls for admin workflow.
// Backend engineers: Integrate API calls for fetching applicants, updating status, and deleting applicants where noted below.
// For Azure Functions, connect the action handlers to your HTTP triggers or function endpoints.

import React, { useState, useEffect } from 'react';
import './ApplicantList.css';
import { FaUserCircle } from 'react-icons/fa';

// Basic applicant type from the API (GET with no params)
type ApplicantBasic = {
  firstName: string;
  lastName: string;
  status: string;
  partitionKey: string;
  rowKey: string;
  profileImage?: string; // Optional profile image URL
};

// Detailed applicant type from the API (GET with partitionKey and rowKey)
type ApplicantDetailed = {
  firstName: string;
  lastName: string;
  status: string;
  partitionKey: string;
  rowKey: string;
  [key: string]: any; // Additional fields that come from the detailed API
};

// Legacy type for compatibility with existing props
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

// Props:
// - onAction: Handler for status change (should call backend API/Azure Function to update status or delete)
interface ApplicantListProps {
  onAction?: (partitionKey: string, rowKey: string, newStatus: 'Approved' | 'Pending' | 'Denied') => void;
}

// API base URL
const API_BASE_URL = 'https://simbagetapplicants-hcf5cffbcccmgsbn.westus-01.azurewebsites.net/api/httptablefunction';

const ApplicantList: React.FC<ApplicantListProps> = ({ onAction }) => {
  // State for storing the basic applicants list
  const [applicants, setApplicants] = useState<ApplicantBasic[]>([]);
  // State for storing detailed applicant data for modal
  const [modalApplicant, setModalApplicant] = useState<ApplicantDetailed | null>(null);
  // State for loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  // statusSelect: stores the selected status for each applicant row (for dropdown)
  const [statusSelect, setStatusSelect] = useState<{ [key: string]: 'Approved' | 'Pending' | 'Denied' }>({});
  // State for selected applicants (for bulk actions)
  const [selected, setSelected] = React.useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  // Add state for search and pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const applicantsPerPage = 10;

  // Fetch all applicants on component mount
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch applicants: ${response.status} ${response.statusText}`);
        }
        
        const data: ApplicantBasic[] = await response.json();
        setApplicants(data);
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch applicants');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  // Fetch detailed applicant data for modal
  const fetchApplicantDetails = async (partitionKey: string, rowKey: string) => {
    try {
      setModalLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}?partitionKey=${encodeURIComponent(partitionKey)}&rowKey=${encodeURIComponent(rowKey)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applicant details: ${response.status} ${response.statusText}`);
      }
      
      const data: ApplicantDetailed = await response.json();
      setModalApplicant(data);
    } catch (err) {
      console.error('Error fetching applicant details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applicant details');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle view button click
  const handleViewApplicant = (partitionKey: string, rowKey: string) => {
    fetchApplicantDetails(partitionKey, rowKey);
  };

  // Handle action button click
  const handleActionClick = (partitionKey: string, rowKey: string) => {
    const status = statusSelect[`${partitionKey}-${rowKey}`] || 'Approved';
    if (onAction) {
      onAction(partitionKey, rowKey, status);
    }
  };

  // Bulk action handler
  const handleBulkAction = (action: 'Approved' | 'Pending' | 'Denied') => {
    const selectedKeys = Object.keys(selected).filter(k => selected[k]);
    // Call onAction for each selected applicant
    selectedKeys.forEach(key => {
      const [partitionKey, rowKey] = key.split('-');
      if (onAction) onAction(partitionKey, rowKey, action);
    });
    // Optionally clear selection after action
    setSelected({});
  };

  // Helper: select all visible applicants
  const allSelected = applicants.length > 0 && applicants.every(a => selected[`${a.partitionKey}-${a.rowKey}`]);
  const someSelected = applicants.some(a => selected[`${a.partitionKey}-${a.rowKey}`]);
  const toggleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      const newSel: { [key: string]: boolean } = {};
      setSelected(newSel);
    } else {
      // Select all
      const newSel: { [key: string]: boolean } = {};
      applicants.forEach(a => { newSel[`${a.partitionKey}-${a.rowKey}`] = true; });
      setSelected(newSel);
    }
  };
  const toggleSelect = (key: string) => {
    setSelected(sel => ({ ...sel, [key]: !sel[key] }));
  };

  // Filter applicants by search
  const filteredApplicants = applicants.filter(a => {
    const searchLower = search.toLowerCase();
    return (
      a.firstName.toLowerCase().includes(searchLower) ||
      a.lastName.toLowerCase().includes(searchLower) ||
      (a.status && a.status.toLowerCase().includes(searchLower))
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );

  // Reset to page 1 if search changes
  useEffect(() => { setCurrentPage(1); }, [search]);

  if (loading) {
    return (
      <div className="applicant-list-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applicant-list-container">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ff3d00' }}>
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              background: '#ff3d00', 
              color: 'white', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="applicant-list-container">
      <h2 className="applicant-list-title">All Applications</h2>
      {/* Search/filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16, width: 240 }}
        />
        {/* Bulk action buttons */}
        <button
          onClick={() => handleBulkAction('Approved')}
          disabled={!someSelected}
          style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 600, cursor: someSelected ? 'pointer' : 'not-allowed', opacity: someSelected ? 1 : 0.5 }}
        >
          Approve Selected
        </button>
        <button
          onClick={() => handleBulkAction('Denied')}
          disabled={!someSelected}
          style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 600, cursor: someSelected ? 'pointer' : 'not-allowed', opacity: someSelected ? 1 : 0.5 }}
        >
          Deny Selected
        </button>
        <button
          onClick={() => handleBulkAction('Pending')}
          disabled={!someSelected}
          style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 600, cursor: someSelected ? 'pointer' : 'not-allowed', opacity: someSelected ? 1 : 0.5 }}
        >
          Pend Selected
        </button>
        {someSelected && <span style={{ color: '#888', fontSize: 14 }}>{Object.keys(selected).filter(k => selected[k]).length} selected</span>}
      </div>
      <div className="applicant-list-table" style={{overflowX: 'auto'}}>
        {/* Table header */}
        <div className="applicant-list-header" style={{display: 'grid', gridTemplateColumns: '0.5fr 0.7fr 1.5fr 1.5fr 1fr 2fr', gap: 16, fontWeight: 600, padding: '1rem'}}>
          <span>
            <input
              type="checkbox"
              checked={allSelected}
              ref={el => { if (el) el.indeterminate = !allSelected && someSelected; }}
              onChange={toggleSelectAll}
              aria-label="Select all applicants"
            />
          </span>
          <span>Image</span>
          <span>First Name</span>
          <span>Last Name</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {/* Table rows: map over paginatedApplicants array */}
        {paginatedApplicants.map((applicant, idx) => {
          const applicantKey = `${applicant.partitionKey}-${applicant.rowKey}`;
          const status = applicant.status || 'Pending';
          return (
            <div className="applicant-list-row" key={applicantKey} style={{display: 'grid', gridTemplateColumns: '0.5fr 0.7fr 1.5fr 1.5fr 1fr 2fr', gap: 16, alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee'}}>
              {/* Checkbox */}
              <span>
                <input
                  type="checkbox"
                  checked={!!selected[applicantKey]}
                  onChange={() => toggleSelect(applicantKey)}
                  aria-label={`Select applicant ${applicant.firstName} ${applicant.lastName}`}
                />
              </span>
              {/* Image placeholder */}
              <span style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                {applicant.profileImage ? (
                  <img
                    src={applicant.profileImage}
                    alt={applicant.firstName + ' ' + applicant.lastName}
                    className="applicant-img-placeholder"
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#eee' }}
                  />
                ) : applicant.firstName && applicant.lastName ? (
                  <span className="applicant-img-placeholder" style={{
                    width: 40, height: 40, borderRadius: '50%', background: '#eee',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#888', fontSize: 18
                  }}>
                    {applicant.firstName[0]}{applicant.lastName[0]}
                  </span>
                ) : (
                  <FaUserCircle className="applicant-img-placeholder" style={{ width: 40, height: 40, color: '#bbb' }} />
                )}
              </span>
              <span>{applicant.firstName}</span>
              <span>{applicant.lastName}</span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textAlign: 'center',
                color: 'white',
                background: status === 'Approved' ? '#4caf50' : 
                           status === 'Pending' ? '#ff9800' : 
                           status === 'Denied' ? '#f44336' : '#666'
              }}>
                {status}
              </span>
              <span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                {/* View button only */}
                <button
                  className="details-link"
                  style={{
                    marginLeft: 8,
                    background: 'transparent',
                    color: '#ff3d00',
                    border: '1.5px solid #ff3d00',
                    borderRadius: 5,
                    padding: '4px 12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#ff9800';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = '#ff9800';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#ff3d00';
                    e.currentTarget.style.borderColor = '#ff3d00';
                  }}
                  onClick={() => handleViewApplicant(applicant.partitionKey, applicant.rowKey)}
                >
                  View
                </button>
              </span>
            </div>
          );
        })}
      </div>
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 18 }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ padding: '6px 14px', borderRadius: 5, border: '1px solid #ccc', background: currentPage === 1 ? '#eee' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Prev
          </button>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ padding: '6px 14px', borderRadius: 5, border: '1px solid #ccc', background: currentPage === totalPages ? '#eee' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Modal for applicant details */}
      {modalApplicant && (
        <div className="modal-overlay" onClick={() => setModalApplicant(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, margin: '0 auto', borderRadius: 16, boxShadow: '0 8px 32px rgba(2,60,105,0.18)', padding: '2.5rem 2rem 2rem 2rem', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible' }}>
            <button className="modal-close" onClick={() => setModalApplicant(null)} style={{ position: 'absolute', top: 18, right: 24, fontSize: 28, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            {/* Applicant image/avatar placeholder */}
            <div style={{ marginBottom: 18 }}>
              {modalApplicant.profileImage ? (
                <img
                  src={modalApplicant.profileImage}
                  alt={modalApplicant.firstName + ' ' + modalApplicant.lastName}
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', background: '#eee', display: 'block' }}
                />
              ) : modalApplicant.firstName && modalApplicant.lastName ? (
                <span style={{ width: 72, height: 72, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#888', fontSize: 32 }}>
                  {modalApplicant.firstName[0]}{modalApplicant.lastName[0]}
                </span>
              ) : (
                <FaUserCircle style={{ width: 72, height: 72, color: '#bbb' }} />
              )}
            </div>
            <h3 style={{ margin: '0 0 1.2rem 0', color: '#023c69', fontSize: '1.3rem', fontWeight: 700, textAlign: 'center' }}>Applicant Details</h3>
            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading details...</p>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                {/* Display all fields from the detailed API response */}
                {Object.entries(modalApplicant).map(([key, value]) => {
                  // Skip internal keys (case-insensitive)
                  const lowerKey = key.toLowerCase();
                  if (lowerKey === 'partitionkey' || lowerKey === 'rowkey' || lowerKey === 'profileimage') {
                    return null;
                  }
                  // Handle null status
                  const displayValue = key === 'status' && (value === null || value === undefined) 
                    ? 'Pending' 
                    : String(value || '');
                  // Remove isLong check, always allow copy
                  return (
                    <div key={key} style={{ marginBottom: '0.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f3f3', padding: '0.3rem 0' }}>
                      <strong style={{ color: '#555', fontWeight: 600, fontSize: 15 }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                      <span
                        className="modal-detail-value"
                        title={displayValue}
                        style={{
                          maxWidth: 180,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                          verticalAlign: 'middle',
                          cursor: 'pointer',
                          color: '#333',
                          fontSize: 15,
                          position: 'relative',
                          background: copiedKey === key ? '#e0ffe0' : 'transparent',
                          borderRadius: copiedKey === key ? 4 : undefined,
                          transition: 'background 0.2s',
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(displayValue);
                          setCopiedKey(key);
                          setTimeout(() => setCopiedKey(null), 1200);
                        }}
                      >
                        {displayValue}
                        {copiedKey === key && (
                          <span style={{
                            position: 'absolute',
                            left: '50%',
                            top: '1.8em',
                            transform: 'translateX(-50%)',
                            background: '#222',
                            color: '#fff',
                            borderRadius: 4,
                            padding: '2px 10px',
                            fontSize: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 10,
                          }}>Copied!</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantList;
