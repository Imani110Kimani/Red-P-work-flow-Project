import { statusToString } from './utils';
import React, { useState, useEffect } from 'react';
import './ApplicantList.css';
import { FaUserCircle } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';

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

interface ApplicantListProps {
  onAction?: (partitionKey: string, rowKey: string, newStatus: 'Approved' | 'Pending' | 'Denied', adminEmail?: string) => void;
}

// API base URL
const API_BASE_URL = 'https://simbagetapplicants-hcf5cffbcccmgsbn.westus-01.azurewebsites.net/api/httptablefunction';

// Import helpers from Dashboard

import { useNotification } from '../contexts/NotificationContext';

const ApplicantList: React.FC<ApplicantListProps> = ({ onAction }) => {
  const { userEmail } = useUser();
  const { addNotification } = useNotification();
  
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
  // (Removed unused statusSelect state)
  // State for selected applicants (for bulk actions)
  const [selected, setSelected] = React.useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [applicantsPerPage, setApplicantsPerPage] = useState(10);

  // Add modal state
  // (Removed unused modalOpen state)
  // Bulk comment modal state
  const [bulkActionType, setBulkActionType] = useState<null | 'Approved' | 'Denied'>(null);
  const [bulkComment, setBulkComment] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  // Modal and reason modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  // Reason modal state
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonValue, setReasonValue] = useState('');
  const [pendingAction, setPendingAction] = useState<null | { action: 'Approved' | 'Denied', keys: string[] }>(null);
  // Remove modalAction state
  // const [modalAction, setModalAction] = useState<null | (() => void)>(null);

  // Add state for admin email - use logged-in user's email as default
  const [adminEmail, setAdminEmail] = useState<string>(userEmail || 'admin@company.com');
  
  // Update admin email when user context changes
  useEffect(() => {
    if (userEmail) {
      setAdminEmail(userEmail);
    }
  }, [userEmail]);
  
  // Add state for storing actual approval and denial data from the API
  const [approvalData, setApprovalData] = useState<{ [key: string]: { 
    approval1?: string, 
    approval2?: string,
    denial1?: string,
    denial2?: string
  } }>({});

  // Refetch function to update data after status changes
  const refetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applicants: ${response.status} ${response.statusText}`);
      }
      
      const data: ApplicantBasic[] = await response.json();
      setApplicants(data);
      
      // Fetch approval data for all applicants
      await fetchApprovalDataForApplicants(data);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch approval data for multiple applicants
  const fetchApprovalDataForApplicants = async (applicantsList: ApplicantBasic[]) => {
    const approvalPromises = applicantsList.map(async (applicant) => {
      try {
        const url = `${API_BASE_URL}?partitionKey=${encodeURIComponent(applicant.partitionKey)}&rowKey=${encodeURIComponent(applicant.rowKey)}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const detailedData: ApplicantDetailed = await response.json();
          const key = `${applicant.partitionKey}|${applicant.rowKey}`;
          return {
            key,
            approval1: detailedData.approval1 || '',
            approval2: detailedData.approval2 || '',
            denial1: detailedData.denial1 || '',
            denial2: detailedData.denial2 || ''
          };
        }
      } catch (error) {
        console.error(`Error fetching approval data for ${applicant.partitionKey}|${applicant.rowKey}:`, error);
      }
      return null;
    });

    try {
      const results = await Promise.all(approvalPromises);
      const newApprovalData: { [key: string]: { 
        approval1?: string, 
        approval2?: string,
        denial1?: string,
        denial2?: string
      } } = {};
      
      results.forEach(result => {
        if (result) {
          newApprovalData[result.key] = {
            approval1: result.approval1,
            approval2: result.approval2,
            denial1: result.denial1,
            denial2: result.denial2
          };
        }
      });
      
      setApprovalData(newApprovalData);
    } catch (error) {
      console.error('Error processing approval data:', error);
    }
  };

  // Fetch all applicants on component mount
  useEffect(() => {
    const fetchAllDetails = async () => {
      if (applicants.length === 0) return;

      console.log('ApplicantList: Triggering batch fetch for all applicants');
      await fetchAllApplicantDetails(applicants);
    };

    // Fetch detailed data for all applicants using the efficient batch method
    fetchAllDetails();
  }, [applicants, fetchAllApplicantDetails]);

  // Fetch detailed applicant data for modal
  const fetchApplicantDetails = async (partitionKey: string, rowKey: string) => {
    try {
      setModalLoading(true);
      
      const data = await fetchApplicantDetails(partitionKey, rowKey);
      
      if (data) {
        setModalApplicant(data);
      } else {
        console.error('Failed to fetch applicant details');
      }
    } catch (err) {
      console.error('Error fetching applicant details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewApplicant = (partitionKey: string, rowKey: string) => {
    openApplicantModal(partitionKey, rowKey);
  };

  // Handle action button click
  // (Removed unused handleActionClick function)

  // Bulk action handler (now opens reason modal)
  const handleBulkAction = (action: 'Approved' | 'Denied') => {
    const selectedKeys = Object.keys(selected).filter(k => selected[k]);
    if (selectedKeys.length === 0) return;
    setPendingAction({ action, keys: selectedKeys });
    setReasonValue('');
    setReasonModalOpen(true);
  };

  // Confirm bulk/single action with reason
  const confirmActionWithReason = () => {
    if (!pendingAction) return;
    for (const key of pendingAction.keys) {
      const [partitionKey, rowKey] = key.split('|');
      if (onAction) onAction(partitionKey, rowKey, pendingAction.action, adminEmail /*, reasonValue */);
    }
    addNotification(
      `${pendingAction.keys.length} applicant${pendingAction.keys.length > 1 ? 's' : ''} ${pendingAction.action === 'Approved' ? 'approved' : 'denied'} by ${adminEmail}${reasonValue ? ` (Reason: ${reasonValue})` : ''}`,
      pendingAction.action === 'Approved' ? 'success' : 'error'
    );
    setSelected({});
    setReasonModalOpen(false);
    setPendingAction(null);
    setTimeout(() => refetchApplicants(), 1000);
  };

  const toggleSelectAll = () => {
    if (applicants.every(a => selected[`${a.partitionKey}|${a.rowKey}`])) {
      setSelected({});
    } else {
      const newSel: { [key: string]: boolean } = {};
      applicants.forEach(a => { newSel[`${a.partitionKey}|${a.rowKey}`] = true; });
      setSelected(newSel);
    }
  };

  const toggleSelect = (key: string) => {
    setSelected(sel => ({ ...sel, [key]: !sel[key] }));
  };

  const filteredApplicants = applicants.filter(a => {
    const searchLower = search.toLowerCase();
    return (
      a.firstName.toLowerCase().includes(searchLower) ||
      a.lastName.toLowerCase().includes(searchLower) ||
      (a.status && a.status.toLowerCase().includes(searchLower))
    );
  });

  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );

  const pageSizeOptions = [10, 25, 50, 100];

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
    <div className="applicant-list-container" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '70vh',
      maxWidth: 1200,
      margin: '0 auto',
      padding: '2rem 1rem',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 16px 0 rgba(34,34,34,0.08)',
      flexGrow: 1
    }}>
      <h2 className="applicant-list-title">All Applications</h2>
      
      <div style={{ marginBottom: 16, padding: '12px', background: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6' }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#495057' }}>
          Logged in as (for approvals):
        </label>
        <input
          type="email"
          placeholder="No user logged in"
          value={adminEmail}
          onChange={e => setAdminEmail(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 6, 
            border: userEmail ? '1px solid #28a745' : '1px solid #ced4da', 
            fontSize: 14, 
            width: '300px',
            background: userEmail ? '#f8fff9' : '#fff',
            color: userEmail ? '#155724' : '#495057'
          }}
        />
        <small style={{ display: 'block', marginTop: 4, color: userEmail ? '#155724' : '#6c757d' }}>
          {userEmail ? '✓ Using your logged-in email for approvals' : 'Please log in to use your email for approvals'}
        </small>
      </div>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16, width: 240 }}
        />
        <button
          onClick={() => handleBulkAction('Approved')}
          disabled={!Object.values(selected).some(v => v)}
          style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}
        >
          Approve Selected
        </button>
        <button
          onClick={() => handleBulkAction('Denied')}
          disabled={!Object.values(selected).some(v => v)}
          style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}
        >
          Deny Selected
        </button>
        {Object.values(selected).some(v => v) && (
          <span style={{ color: '#888', fontSize: 14 }}>
            {Object.values(selected).filter(v => v).length} selected
          </span>
        )}
      </div>

      <div className="applicant-list-table" style={{
        overflowX: 'auto',
        border: '1px solid #eee',
        borderRadius: 8,
        marginTop: 12,
        flexGrow: 1,
        minHeight: '40vh',
        background: '#fafbfc'
      }}>
        <div className="applicant-list-header" style={{
          display: 'grid', 
          gridTemplateColumns: '0.5fr 0.7fr 1.5fr 1.5fr 1fr 2fr 2fr 1.5fr', 
          gap: 16, 
          fontWeight: 600, 
          padding: '1rem', 
          background: '#fafafa', 
          borderBottom: '1px solid #eee'
        }}>
          <span>
            <input
              type="checkbox"
              checked={applicants.length > 0 && applicants.every(a => selected[`${a.partitionKey}|${a.rowKey}`])}
              ref={el => { 
                if (el) el.indeterminate = 
                  !(applicants.length > 0 && applicants.every(a => selected[`${a.partitionKey}|${a.rowKey}`])) && 
                  applicants.some(a => selected[`${a.partitionKey}|${a.rowKey}`]); 
              }}
              onChange={toggleSelectAll}
              aria-label="Select all applicants"
            />
          </span>
          <span>Avatar</span>
          <span>First Name</span>
          <span>Last Name</span>
          <span>Status</span>
          <span>Approved By</span>
          <span>Denied By</span>
          <span>Actions</span>
        </div>

        {paginatedApplicants.map((applicant, idx) => {
          const applicantKey = `${applicant.partitionKey}|${applicant.rowKey}`;
          // Get actual approval and denial data from API
          const actualApprovalData = approvalData[applicantKey];
          const approvedByEmails: string[] = [];
          const deniedByEmails: string[] = [];
          if (actualApprovalData) {
            if (actualApprovalData.approval1) approvedByEmails.push(actualApprovalData.approval1);
            if (actualApprovalData.approval2) approvedByEmails.push(actualApprovalData.approval2);
            if (actualApprovalData.denial1) deniedByEmails.push(actualApprovalData.denial1);
            if (actualApprovalData.denial2) deniedByEmails.push(actualApprovalData.denial2);
          }
          
          const status = statusToString(applicant.status === undefined ? null : Number(applicant.status));
          
          return (
            <div className="applicant-list-row" key={applicantKey} style={{
              display: 'grid', 
              gridTemplateColumns: '0.5fr 0.7fr 1.5fr 1.5fr 1fr 2fr 2fr 1.5fr', 
              gap: 16, 
              alignItems: 'center', 
              padding: '1rem', 
              borderBottom: '1px solid #eee', 
              background: idx % 2 === 0 ? '#fff' : '#f7f7f7'
            }}>
              <span>
                <input
                  type="checkbox"
                  checked={!!selected[applicantKey]}
                  onChange={() => toggleSelect(applicantKey)}
                  aria-label={`Select applicant ${applicant.firstName} ${applicant.lastName}`}
                  disabled={status === 'Approved'}
                />
              </span>
              {/* Approve/Deny buttons for single action (show only if not approved) */}
              {/*
              <span>
                <button onClick={() => {
                  setPendingAction({ action: 'Approved', keys: [applicantKey] });
                  setReasonValue('');
                  setReasonModalOpen(true);
                }} disabled={status === 'Approved'}>Approve</button>
                <button onClick={() => {
                  setPendingAction({ action: 'Denied', keys: [applicantKey] });
                  setReasonValue('');
                  setReasonModalOpen(true);
                }} disabled={status === 'Approved'}>Deny</button>
              </span>
              */}
      {/* Reason Modal for approve/deny actions */}
      {reasonModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 32px 0 rgba(34,34,34,0.18)',
            padding: '2.5rem 2.5rem 2rem 2.5rem',
            minWidth: 320,
            maxWidth: '90vw',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ff3d00', marginBottom: 12 }}>
              {pendingAction?.action === 'Approved' ? 'Approve' : 'Deny'} {pendingAction?.keys.length > 1 ? `${pendingAction.keys.length} applicants` : 'applicant'}
            </div>
            <textarea
              value={reasonValue}
              onChange={e => setReasonValue(e.target.value)}
              rows={4}
              style={{ width: 320, borderRadius: 8, border: '1.5px solid #ff9800', padding: 10, fontSize: 16, resize: 'vertical' }}
              placeholder="Enter reason or comment (required)"
            />
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                style={{ background: '#ff3d00', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                onClick={confirmActionWithReason}
                disabled={!reasonValue.trim()}
              >
                {pendingAction?.action === 'Approved' ? 'Approve' : 'Deny'}
              </button>
              <button
                style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                onClick={() => { setReasonModalOpen(false); setPendingAction(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
              {/* Avatar/Initials */}
              <span>
                {applicant.profileImage ? (
                  <img
                    src={applicant.profileImage}
                    alt={applicant.firstName + ' ' + applicant.lastName}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#eee', display: 'block' }}
                  />
                ) : (
                  <span className="avatar-initials">
                    {applicant.firstName && applicant.lastName ? 
                      `${applicant.firstName[0]}${applicant.lastName[0]}`.toUpperCase() : '?'}
                  </span>
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
                background: status === 'Approved' ? '#43a047' : 
                          status === 'Pending' ? '#ff9800' : 
                          status === 'Denied' ? '#f44336' : '#ff9800',
                minWidth: 90,
                display: 'inline-block',
              }}>
                {status}
              </span>

              <span style={{ minWidth: 120 }}>
                <div
                  style={{
                    border: '1.5px solid #ff9800',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontWeight: 600,
                    color: '#ff9800',
                    background: '#fff',
                    minWidth: 110,
                    marginRight: 8,
                    fontSize: '0.8rem',
                    minHeight: '24px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={`Approvals: ${approvedByEmails.length > 0 ? approvedByEmails.join(', ') : 'None'}`}
                >
                  {approvedByEmails.length > 0 ? (
                    <div style={{ lineHeight: '1.2' }}>
                      {approvedByEmails.map((email, emailIdx) => (
                        <div key={emailIdx} style={{ marginBottom: emailIdx < approvedByEmails.length - 1 ? '2px' : '0' }}>
                          {email}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>None</span>
                  )}
                </div>
              </span>

              <span style={{ minWidth: 120 }}>
                <div
                  style={{
                    border: '1.5px solid #f44336',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontWeight: 600,
                    color: '#f44336',
                    background: '#fff',
                    minWidth: 110,
                    marginRight: 8,
                    fontSize: '0.8rem',
                    minHeight: '24px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={`Denials: ${deniedByEmails.length > 0 ? deniedByEmails.join(', ') : 'None'}`}
                >
                  {deniedByEmails.length > 0 ? (
                    <div style={{ lineHeight: '1.2' }}>
                      {deniedByEmails.map((email, emailIdx) => (
                        <div key={emailIdx} style={{ marginBottom: emailIdx < deniedByEmails.length - 1 ? '2px' : '0' }}>
                          {email}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>None</span>
                  )}
                </div>
              </span>

              <span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
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
      {/* Modal for bulk approve/deny comment */}
      {bulkActionType && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 32px 0 rgba(34,34,34,0.18)',
            padding: '2.5rem 2.5rem 2rem 2.5rem',
            minWidth: 320,
            maxWidth: '90vw',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: bulkActionType === 'Approved' ? '#43a047' : '#f44336', marginBottom: 8 }}>
              {bulkActionType === 'Approved' ? 'Approve' : 'Deny'} Selected Applicants
            </div>
            <div style={{ fontSize: 15, color: '#444', marginBottom: 8 }}>
              Please provide a reason or comment (required):
            </div>
            <textarea
              value={reasonValue}
              onChange={e => setReasonValue(e.target.value)}
              rows={4}
              style={{ width: 320, borderRadius: 8, border: '1.5px solid #ff9800', padding: 10, fontSize: 16, resize: 'vertical' }}
              placeholder="Enter reason or comment (required)"
            />
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                style={{ background: '#ff3d00', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                onClick={confirmActionWithReason}
                disabled={!reasonValue.trim()}
              >
                {pendingAction?.action === 'Approved' ? 'Approve' : 'Deny'}
              </button>
              <button
                style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                onClick={() => { setReasonModalOpen(false); setPendingAction(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
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
      
      {modalApplicant && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setModalApplicant(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            padding: 24,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 16px 0 rgba(34,34,34,0.10)',
            minWidth: 320,
            maxWidth: 480,
            margin: '0 auto',
            textAlign: 'left',
            position: 'relative',
            zIndex: 10001
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textAlign: 'center',
                color: 'white',
                background: Number(modalApplicant.status) === 2 ? '#4caf50' : 
                          Number(modalApplicant.status) === 3 ? '#f44336' : '#ff9800',
                minWidth: 90,
                display: 'inline-block',
              }}>
                {statusToString(modalApplicant.status === undefined ? null : Number(modalApplicant.status))}
              </span>
              <span style={{ fontWeight: 700, fontSize: 20 }}>{modalApplicant.firstName} {modalApplicant.lastName}</span>
            </div>
            <button className="modal-close" onClick={() => setModalApplicant(null)} style={{ 
              position: 'absolute', 
              top: 18, 
              right: 24, 
              fontSize: 28, 
              color: '#888', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer' 
            }}>
              &times;
            </button>
            
            <div style={{ marginBottom: 18 }}>
              {modalApplicant.profileImage ? (
                <img
                  src={modalApplicant.profileImage}
                  alt={modalApplicant.firstName + ' ' + modalApplicant.lastName}
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', background: '#eee', display: 'block' }}
                />
              ) : modalApplicant.firstName && modalApplicant.lastName ? (
                <span style={{ 
                  width: 72, 
                  height: 72, 
                  borderRadius: '50%', 
                  background: '#eee', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 700, 
                  color: '#888', 
                  fontSize: 32 
                }}>
                  {modalApplicant.firstName[0]}{modalApplicant.lastName[0]}
                </span>
              ) : (
                <FaUserCircle style={{ width: 72, height: 72, color: '#bbb' }} />
              )}
            </div>
            
            <h3 style={{ margin: '0 0 1.2rem 0', color: '#023c69', fontSize: '1.3rem', fontWeight: 700, textAlign: 'center' }}>
              Applicant Details
            </h3>
            
            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading details...</p>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                {Object.entries(modalApplicant).map(([key, value]) => {
                  const lowerKey = key.toLowerCase();
                  if (lowerKey === 'partitionkey' || lowerKey === 'rowkey' || lowerKey === 'profileimage') {
                    return null;
                  }
                  
                  let displayValue;
                  if (key === 'status') {
                    displayValue = statusToString(value === undefined ? null : Number(value));
                  } else {
                    displayValue = value === null || value === undefined ? '' : String(value);
                  }
                  
                  return (
                    <div key={key} style={{ 
                      marginBottom: '0.7rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      borderBottom: '1px solid #f3f3f3', 
                      padding: '0.3rem 0' 
                    }}>
                      <strong style={{ color: '#555', fontWeight: 600, fontSize: 15 }}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                      </strong>
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
                          }}>
                            Copied!
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
                
                <div style={{ marginTop: 18 }}>
                  <label htmlFor="admin-reason" style={{ fontWeight: 600, color: '#023c69', marginBottom: 4, display: 'block' }}>
                    Reason/Comment (for approval/denial):
                  </label>
                  <textarea
                    id="admin-reason"
                    rows={3}
                    style={{ width: '100%', borderRadius: 6, border: '1.5px solid #ff9800', padding: 8, fontSize: '1em', resize: 'vertical' }}
                    placeholder="Enter your reason or comment here..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantList;