
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
  const [currentStatus, setCurrentStatus] = React.useState<string>(applicant?.status || 'Pending');
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState<boolean>(false);

  if (!applicant) {
    return <div className="applicant-details-container">Applicant not found.</div>;
  }

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      // No backend/API call, just update local state
      setCurrentStatus(newStatus);
      // No alert or message box
    } catch (error) {
      // No error handling needed for local update
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'denied':
        return '#f44336';
      default:
        return '#666';
    }
  };

  return (
    <div className="applicant-details-container">
      <h2 className="applicant-details-title">Applicant Details</h2>
      
      {/* Status Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)', 
        borderRadius: 12, 
        padding: '1.2rem', 
        marginBottom: '1.5rem', 
        border: '2px solid #ff9800',
        boxShadow: '0 2px 8px rgba(255,152,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <h4 style={{ margin: 0, color: '#ff3d00', fontWeight: 700, fontSize: '1.1rem' }}>Application Status</h4>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#fff',
            background: `linear-gradient(90deg, ${getStatusColor(currentStatus)} 60%, ${getStatusColor(currentStatus)}dd 100%)`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {currentStatus}
          </span>
        </div>
        
        {/* Status Update Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleStatusUpdate('Pending')}
            disabled={isUpdatingStatus || currentStatus === 'Pending'}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #ff9800',
              background: currentStatus === 'Pending' ? '#ff9800' : '#fff',
              color: currentStatus === 'Pending' ? '#fff' : '#ff9800',
              fontWeight: 600,
              cursor: currentStatus === 'Pending' ? 'default' : 'pointer',
              fontSize: '0.85rem',
              opacity: isUpdatingStatus ? 0.6 : 1
            }}
            title="Set application to pending review (automatic for new applications)"
          >
            ⏳ Set Pending
          </button>
          <button
            onClick={() => handleStatusUpdate('Approved')}
            disabled={isUpdatingStatus || currentStatus === 'Approved'}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #4caf50',
              background: currentStatus === 'Approved' ? '#4caf50' : '#fff',
              color: currentStatus === 'Approved' ? '#fff' : '#4caf50',
              fontWeight: 600,
              cursor: currentStatus === 'Approved' ? 'default' : 'pointer',
              fontSize: '0.85rem',
              opacity: isUpdatingStatus ? 0.6 : 1
            }}
            title="Approve student and send approval email"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => handleStatusUpdate('Denied')}
            disabled={isUpdatingStatus || currentStatus === 'Denied'}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #f44336',
              background: currentStatus === 'Denied' ? '#f44336' : '#fff',
              color: currentStatus === 'Denied' ? '#fff' : '#f44336',
              fontWeight: 600,
              cursor: currentStatus === 'Denied' ? 'default' : 'pointer',
              fontSize: '0.85rem',
              opacity: isUpdatingStatus ? 0.6 : 1
            }}
            title="Deny application (feature coming soon)"
          >
            ❌ Deny (Coming Soon)
          </button>
        </div>
        
        {isUpdatingStatus && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '0.85rem', 
            color: '#ff9800', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid #ff9800',
              borderTop: '2px solid transparent',
              animation: 'spin 1s linear infinite'
            }}></div>
            Updating status...
          </div>
        )}
      </div>

      <div className="applicant-details-card">
        <div><strong>Name:</strong> {applicant.name}</div>
        <div><strong>School:</strong> {applicant.school} {' '}
          <Link to={`/school-verification/1`} className="related-link">(View School Verification)</Link>
        </div>
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
