import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './ApplicantDetails.css';

// Placeholder data (in a real app, fetch by ID)
const applicants = [
  {
    id: 1,
    name: 'Jane Doe',
    school: 'Kimana Girls School',
    status: 'Pending',
    date: '2025-07-01',
    details: 'Application for Form 1, 2025.',
    contact: 'jane.doe@email.com',
    phone: '+254 700 123456',
    address: '123 Main St, Nairobi',
    guardian: 'Mary Doe',
    guardianPhone: '+254 700 654321',
    scores: { math: 88, english: 92, science: 85 },
    extra: 'Prefers boarding school. Allergic to peanuts.'
  },
  {
    id: 2,
    name: 'Rajombol Siayho',
    school: 'Maasai Primary School',
    status: 'Approved',
    date: '2025-07-02',
    details: 'Application for Form 2, 2025.',
    contact: 'rajombol@email.com',
    phone: '+254 701 222333',
    address: '456 Maasai Rd, Kajiado',
    guardian: 'Samuel Siayho',
    guardianPhone: '+254 701 333222',
    scores: { math: 75, english: 80, science: 78 },
    extra: 'Has a scholarship.'
  },
  {
    id: 3,
    name: 'Amina Njeri',
    school: 'Nairobi High',
    status: 'In Progress',
    date: '2025-07-03',
    details: 'Application for Form 1, 2025.',
    contact: 'amina@email.com',
    phone: '+254 702 555444',
    address: '789 River Rd, Nairobi',
    guardian: 'Fatuma Njeri',
    guardianPhone: '+254 702 444555',
    scores: { math: 90, english: 87, science: 91 },
    extra: 'Needs special accommodation for exams.'
  },
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
        <div><strong>Contact Email:</strong> {applicant.contact}</div>
        <div><strong>Phone:</strong> {applicant.phone}</div>
        <div><strong>Address:</strong> {applicant.address}</div>
        <div><strong>Guardian:</strong> {applicant.guardian} ({applicant.guardianPhone})</div>
        <div><strong>Scores:</strong> Math: {applicant.scores.math}, English: {applicant.scores.english}, Science: {applicant.scores.science}</div>
        <div><strong>Other Info:</strong> {applicant.extra}</div>
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
