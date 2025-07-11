
// ApplicantList.tsx
// This component displays all scholarship applications in a table with action controls for admin workflow.
// Backend engineers: Integrate API calls for fetching applicants, updating status, and deleting applicants where noted below.
// For Azure Functions, connect the action handlers to your HTTP triggers or function endpoints.

import React, { useState, useEffect } from 'react';
import './ApplicantList.css';

// Basic applicant type from the API (GET with no params)
type ApplicantBasic = {
  firstName: string;
  lastName: string;
  status: string;
  partitionKey: string;
  rowKey: string;
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
      <div className="applicant-list-table" style={{overflowX: 'auto'}}>
        {/* Table header: simplified to show available fields from API */}
        <div className="applicant-list-header" style={{display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 2fr', gap: 16, fontWeight: 600, padding: '1rem'}}>
          <span>First Name</span>
          <span>Last Name</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {/* Table rows: map over applicants array */}
        {applicants.map((applicant, idx) => {
          const applicantKey = `${applicant.partitionKey}-${applicant.rowKey}`;
          const status = applicant.status || 'Pending'; // Default to 'Pending' if status is null or undefined
          return (
            <div className="applicant-list-row" key={applicantKey} style={{display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 2fr', gap: 16, alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee'}}>
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
                {/* Status dropdown */}
                <select
                  value={statusSelect[applicantKey] || status}
                  onChange={e => setStatusSelect(s => ({ ...s, [applicantKey]: e.target.value as 'Approved' | 'Pending' | 'Denied' }))}
                  style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid #bbb', fontWeight: 500 }}
                >
                  <option value="Approved">Approve</option>
                  <option value="Pending">Pending</option>
                  <option value="Denied">Deny</option>
                </select>
                {/* Action button */}
                <button
                  style={{
                    background: '#ff3d00', // REDP Red
                    color: '#fff',
                    border: 'none',
                    borderRadius: 5,
                    padding: '4px 12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#ff9800')} // REDP Orange on hover
                  onMouseOut={e => (e.currentTarget.style.background = '#ff3d00')}
                  onClick={() => handleActionClick(applicant.partitionKey, applicant.rowKey)}
                >
                  <span role="img" aria-label="action"></span> Take Action
                </button>
                {/* View button */}
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
      
      {/* Modal for applicant details */}
      {modalApplicant && (
        <div className="modal-overlay" onClick={() => setModalApplicant(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalApplicant(null)}>&times;</button>
            <h3>Applicant Details</h3>
            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading details...</p>
              </div>
            ) : (
              <div>
                {/* Display all fields from the detailed API response */}
                {Object.entries(modalApplicant).map(([key, value]) => {
                  // Skip internal keys (case-insensitive)
                  const lowerKey = key.toLowerCase();
                  if (lowerKey === 'partitionkey' || lowerKey === 'rowkey') {
                    return null;
                  }
                  
                  // Handle null status
                  const displayValue = key === 'status' && (value === null || value === undefined) 
                    ? 'Pending' 
                    : String(value || '');
                  
                  return (
                    <div key={key} style={{ marginBottom: '0.5rem' }}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {displayValue}
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
