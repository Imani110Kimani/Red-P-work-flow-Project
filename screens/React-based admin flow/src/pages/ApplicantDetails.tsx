import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './ApplicantDetails.css';

// Placeholder data (in a real app, fetch by ID)
const applicants = [
  { id: 1, name: 'Jane Doe', school: 'Kimana Girls School', status: 'Pending', date: '2025-07-01', details: 'Application for Form 1, 2025.' },
  { id: 2, name: 'Rajombol Siayho', school: 'Maasai Primary School', status: 'Approved', date: '2025-07-02', details: 'Application for Form 2, 2025.' },
  { id: 3, name: 'Amina Njeri', school: 'Nairobi High', status: 'In Progress', date: '2025-07-03', details: 'Application for Form 1, 2025.' },
];

const ApplicantDetails: React.FC = () => {
  const { id } = useParams();
  const applicant = applicants.find(a => a.id === Number(id));

  if (!applicant) {
    return <div className="applicant-details-container">Applicant not found.</div>;
  }

  return (
    <div className="applicant-details-container">
      <h2 className="applicant-details-title">Applicant Details</h2>
      <div className="applicant-details-card">
        <div><strong>Name:</strong> {applicant.name}</div>
        <div><strong>School:</strong> {applicant.school} {' '}
          <Link to={`/school-verification/1`} className="related-link">(View School Verification)</Link>
        </div>
        <div><strong>Status:</strong> <span className={`status-badge ${applicant.status.toLowerCase().replace(' ', '-')}`}>{applicant.status}</span></div>
        <div><strong>Date:</strong> {applicant.date}</div>
        <div><strong>Details:</strong> {applicant.details}</div>
        <div><strong>Admission:</strong> <Link to={`/admissions/1`} className="related-link">View Admission Details</Link></div>
      </div>
      <div className="details-nav-links">
        <Link to="/applicants" className="back-link">Back to List</Link>
        <Link to="/dashboard" className="back-link">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default ApplicantDetails;
