
// ApplicantList.tsx
// This component displays all scholarship applications in a table with action controls for admin workflow.
// Backend engineers: Integrate API calls for fetching applicants, updating status, and deleting applicants where noted below.
// For Azure Functions, connect the action handlers to your HTTP triggers or function endpoints.

import React, { useState } from 'react';
import './ApplicantList.css';






// Applicant type should match the backend data model for a student application
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
// - applicants: Array of applicant objects (should be fetched from backend API)
// - onAction: Handler for status change (should call backend API/Azure Function to update status or delete)
interface ApplicantListProps {
  applicants: Applicant[];
  onAction: (id: number, newStatus: 'Approved' | 'Pending' | 'Denied') => void;
}

// Dummy fields for table display. Replace with real data from backend as needed.
const dummyFields = [
  'KCPE: 380',
  'Parent: John Doe',
  'Guardian: Jane Doe',
  'Address: 123 Main St',
  'DOB: 2005-06-01',
  'Gender: Female',
  'Stream: North',
  'Class: 8',
  'Extra: Prefers boarding',
  'Allergy: None',
];

const ApplicantList: React.FC<ApplicantListProps> = ({ applicants, onAction }) => {
  // modalApplicant: stores the applicant to show in the details modal
  const [modalApplicant, setModalApplicant] = useState<null | Applicant>(null);
  // statusSelect: stores the selected status for each applicant row (for dropdown)
  const [statusSelect, setStatusSelect] = useState<{ [id: number]: 'Approved' | 'Pending' | 'Denied' }>({});

  // TODO: Backend: Replace applicants prop with data fetched from API (e.g., useEffect + fetch)
  // TODO: Backend: Replace onAction with API/Azure Function call to update status or delete applicant

  return (
    <div className="applicant-list-container">
      <h2 className="applicant-list-title">All Applications</h2>
      <div className="applicant-list-table" style={{overflowX: 'auto'}}>
        {/* Table header: update columns as needed to match backend fields */}
        <div className="applicant-list-header" style={{display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 2fr 1.2fr 1.2fr 1.2fr 1.2fr 1.2fr 1.2fr 2fr 2fr 2fr', gap: 8, fontWeight: 600}}>
          <span>First Name</span>
          <span>Last Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Date of Birth</span>
          <span>Grade</span>
          <span>School</span>
          <span>Location</span>
          <span>KCPE</span>
          <span>Parent</span>
          <span>Guardian</span>
          <span>Actions</span>
        </div>
        {/* Table rows: map over applicants array */}
        {applicants.map((applicant, idx) => (
          <div className="applicant-list-row" key={applicant.id} style={{display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 2fr 1.2fr 1.2fr 1.2fr 1.2fr 1.2fr 1.2fr 2fr 2fr 2fr', gap: 8, alignItems: 'center'}}>
            <span>{applicant.firstName}</span>
            <span>{applicant.lastName}</span>
            <span>{applicant.email}</span>
            <span>{applicant.phone}</span>
            <span>{applicant.dateOfBirth}</span>
            <span>{applicant.gradeLevel}</span>
            <span>{applicant.schoolName}</span>
            <span>{applicant.location}</span>
            <span>{dummyFields[0]}</span>
            <span>{dummyFields[1]}</span>
            <span>{dummyFields[2]}</span>
            <span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              {/* Backend: Call API/Azure Function on status change or delete */}
              <select
                value={statusSelect[applicant.id] || 'Approved'}
                onChange={e => setStatusSelect(s => ({ ...s, [applicant.id]: e.target.value as 'Approved' | 'Pending' | 'Denied' }))}
                style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid #bbb', fontWeight: 500 }}
              >
                <option value="Approved">Approve</option>
                <option value="Pending">Pending</option>
                <option value="Denied">Deny</option>
              </select>
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
                onClick={() => onAction(applicant.id, statusSelect[applicant.id] || 'Approved')}
              >
                <span role="img" aria-label="action"></span> Take Action
              </button>
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
                onClick={() => setModalApplicant(applicant)}
              >
                View
              </button>
            </span>
          </div>
        ))}
      </div>
      {/* Modal for applicant details. Backend: Add more fields as needed. */}
      {modalApplicant && (
        <div className="modal-overlay" onClick={() => setModalApplicant(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalApplicant(null)}>&times;</button>
            <h3>Applicant Details</h3>
            <div><strong>First Name:</strong> {modalApplicant.firstName}</div>
            <div><strong>Last Name:</strong> {modalApplicant.lastName}</div>
            <div><strong>Email:</strong> {modalApplicant.email}</div>
            <div><strong>Phone:</strong> {modalApplicant.phone}</div>
            <div><strong>Date of Birth:</strong> {modalApplicant.dateOfBirth}</div>
            <div><strong>Grade:</strong> {modalApplicant.gradeLevel}</div>
            <div><strong>School:</strong> {modalApplicant.schoolName}</div>
            <div><strong>Location:</strong> {modalApplicant.location}</div>
            <div><strong>KCPE:</strong> {dummyFields[0]}</div>
            <div><strong>Parent:</strong> {dummyFields[1]}</div>
            <div><strong>Guardian:</strong> {dummyFields[2]}</div>
            {/* Backend: Add essay or other fields here if needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantList;
