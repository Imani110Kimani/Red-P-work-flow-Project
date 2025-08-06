import React, { useState } from 'react';
import { useApplicantData } from '../contexts/ApplicantDataContext';
import './Dashboard.css';

// Demo data for fee payments
const initialFeePayments = [
  { id: 1, name: 'John Doe', school: 'RedP Academy', amount: 50000, dueDate: '2025-09-01', status: 'Pending', structureAccepted: false },
  { id: 2, name: 'Jane Smith', school: 'RedP Academy', amount: 48000, dueDate: '2025-09-01', status: 'Pending', structureAccepted: false },
  { id: 3, name: 'Samuel Kim', school: 'BlueSky School', amount: 53000, dueDate: '2025-09-01', status: 'Paid', structureAccepted: true },
];

function getDemoStructure(school: string) {
  if (school === 'RedP Academy') {
    return {
      items: [
        { label: 'Tuition', amount: 30000 },
        { label: 'Books', amount: 8000 },
        { label: 'Uniform', amount: 7000 },
        { label: 'Meals', amount: 5000 },
      ],
      total: 50000,
      bank: { name: 'Equity Bank', accName: 'RedP Academy', account: '1234567890', branch: 'Nairobi', paybill: '123456' },
    };
  }
  return {
    items: [
      { label: 'Tuition', amount: 35000 },
      { label: 'Books', amount: 9000 },
      { label: 'Uniform', amount: 6000 },
      { label: 'Meals', amount: 3000 },
    ],
    total: 53000,
    bank: { name: 'KCB', accName: 'BlueSky School', account: '9876543210', branch: 'Kisumu', paybill: '654321' },
  };
}

const FeePortal: React.FC = () => {
  const [structureModal, setStructureModal] = useState<{ open: boolean; feeId?: number }>({ open: false });
  const [feePayments, setFeePayments] = useState(initialFeePayments);
  const [search, setSearch] = useState('');
  const { applicants, detailedApplicants } = useApplicantData();
  const [docModal, setDocModal] = useState<{ open: boolean; name?: string; content?: string }>({ open: false });

  function handleAcceptStructure(feeId: number) {
    setFeePayments(fees => fees.map(f => f.id === feeId ? { ...f, structureAccepted: true } : f));
  }
  function handlePayFee(feeId: number) {
    setFeePayments(fees => fees.map(f => f.id === feeId ? { ...f, status: 'Paid' } : f));
  }

  // Filtered fees by search
  const filteredFees = feePayments.filter(fee =>
    fee.name.toLowerCase().includes(search.toLowerCase()) ||
    fee.school.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-recent-table" style={{ marginTop: 32 }}>
      <div className="dashboard-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Fee Payment Portal</h2>
        <input
          type="text"
          placeholder="Search student or school..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16, width: 240 }}
        />
      </div>
      <div style={{ marginTop: 18 }}>
        {filteredFees.map(fee => (
          <div key={fee.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px 0 rgba(2,60,105,0.07)', padding: '1.2rem 1rem 1rem 1rem', marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, fontSize: '1.08em', color: '#222' }}>{fee.name}</div>
              <div style={{ fontWeight: 600, color: '#ff9800', fontSize: '0.98em' }}>{fee.school}</div>
              <span style={{
                padding: '4px 14px',
                borderRadius: 20,
                fontWeight: 700,
                color: '#fff',
                background: fee.status === 'Paid' ? '#4caf50' : '#ff9800',
                fontSize: '0.98em',
                letterSpacing: 0.2,
                marginLeft: 8,
              }}>{fee.status}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <button onClick={() => setStructureModal({ open: true, feeId: fee.id })} style={{
                color: '#023c69',
                background: '#f7fafd',
                border: '1.5px solid #023c69',
                borderRadius: 8,
                padding: '7px 18px',
                fontWeight: 700,
                fontSize: '0.98em',
                marginRight: 10,
                cursor: 'pointer',
                textDecoration: 'underline',
                transition: 'background 0.2s',
              }}>View Fee Structure</button>
              {!fee.structureAccepted ? (
                <button onClick={() => handleAcceptStructure(fee.id)} disabled={structureModal.open && structureModal.feeId === fee.id} style={{
                  background: '#fff3e0',
                  color: '#ff9800',
                  border: '1.5px solid #ff9800',
                  borderRadius: 8,
                  padding: '7px 18px',
                  fontWeight: 700,
                  cursor: structureModal.open && structureModal.feeId === fee.id ? 'not-allowed' : 'pointer',
                  marginRight: 10,
                  opacity: structureModal.open && structureModal.feeId === fee.id ? 0.5 : 1,
                  transition: 'background 0.2s',
                }}>Accept Structure</button>
              ) : (
                <span style={{ color: '#4caf50', fontWeight: 700, fontSize: '0.97em', marginRight: 10 }}>Structure Accepted</span>
              )}
              {fee.structureAccepted && fee.status === 'Pending' && (
                <button onClick={() => handlePayFee(fee.id)} style={{
                  background: 'linear-gradient(90deg, #4caf50 60%, #ff9800 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 6px 0 rgba(76,175,80,0.07)',
                  transition: 'background 0.2s',
                }}>Pay Now</button>
              )}
              {fee.status === 'Paid' && (
                <span style={{ color: '#4caf50', fontWeight: 700, fontSize: '0.97em' }}>Paid</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Student Info Modal */}
      {structureModal.open && (() => {
        const fee = feePayments.find(f => f.id === structureModal.feeId);
        if (!fee) return null;
        // Try to find matching applicant by name (demo logic, real app should use ID)
        const applicant = applicants.find(a => a.firstName && fee.name && fee.name.toLowerCase().includes(a.firstName.toLowerCase()));
        const details = applicant ? detailedApplicants[`${applicant.partitionKey}|${applicant.rowKey}`] : null;
        // Demo avatar logic
        const avatar = details && details.profileImage
          ? <img src={details.profileImage} alt="avatar" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff9800', marginRight: 16 }} />
          : <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ff9800', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24, marginRight: 16 }}>
              {fee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>;
        // Demo documents if none
        const demoDocs = [
          { name: 'Birth Certificate.pdf', content: 'This is a demo birth certificate.' },
          { name: 'Report Card.pdf', content: 'This is a demo report card.' },
        ];
        const documents = details && details.documents && details.documents.length > 0 ? details.documents : demoDocs;
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} onClick={() => setStructureModal({ open: false, feeId: undefined })}>
            <div style={{
              background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(34,34,34,0.18)', padding: '2.2rem 2.5rem 1.5rem 2.5rem', minWidth: 320, maxWidth: '95vw', position: 'relative',
            }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setStructureModal({ open: false, feeId: undefined })} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 24, color: '#888', cursor: 'pointer' }}>×</button>
              <h3 style={{ marginTop: 0, color: '#ff9800', fontWeight: 900, fontSize: '1.25em' }}>Student Information</h3>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                {avatar}
                <div style={{ color: '#555', fontWeight: 600, fontSize: '1.1em' }}>Student: {fee.name}</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <strong>School:</strong> {fee.school}<br />
                <strong>Status:</strong> {fee.status}<br />
                {details && (
                  <>
                    <strong>Email:</strong> {details.email || 'N/A'}<br />
                    <strong>Phone:</strong> {details.phone || 'N/A'}<br />
                    <strong>Date of Birth:</strong> {details.dateOfBirth || 'N/A'}<br />
                    <strong>Grade Level:</strong> {details.gradeLevel || 'N/A'}<br />
                    <strong>Location:</strong> {details.location || 'N/A'}<br />
                  </>
                )}
              </div>
              <div style={{ marginBottom: 18 }}>
                <strong>Documents:</strong><br />
                <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                  {documents.map((doc: any, idx: number) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      <button
                        style={{ color: '#023c69', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1em', padding: 0 }}
                        onClick={() => setDocModal({ open: true, name: doc.name, content: doc.content || 'Demo document content.' })}
                      >
                        {doc.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
      {/* Document Modal */}
      {docModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setDocModal({ open: false })}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px 0 rgba(34,34,34,0.18)', padding: '2rem 2.5rem', minWidth: 320, maxWidth: '95vw', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDocModal({ open: false })} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 24, color: '#888', cursor: 'pointer' }}>×</button>
            <h3 style={{ marginTop: 0, color: '#ff9800', fontWeight: 900, fontSize: '1.15em' }}>{docModal.name}</h3>
            <div style={{ marginTop: 16, color: '#222', fontSize: '1.08em', whiteSpace: 'pre-wrap' }}>{docModal.content}</div>
          </div>
        </div>
      )}
              <div style={{ marginBottom: 18 }}>
                <strong>Results:</strong><br />
                {details && details.results ? (
                  <pre style={{ background: '#f7fafd', padding: '8px', borderRadius: 6, fontSize: '1em', color: '#222' }}>{JSON.stringify(details.results, null, 2)}</pre>
                ) : <span style={{ color: '#888' }}>No results available.</span>}
              </div>
              <div style={{ marginBottom: 18 }}>
                <strong>Essay:</strong><br />
                {details && details.essay ? (
                  <div style={{ background: '#f7fafd', padding: '8px', borderRadius: 6, fontSize: '1em', color: '#222' }}>{details.essay}</div>
                ) : <span style={{ color: '#888' }}>No essay available.</span>}
              </div>
              <div style={{ marginBottom: 18 }}>
                <strong>Fee Structure:</strong><br />
                <table style={{ width: '100%', marginBottom: 8, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f7fafd' }}>
                      <th style={{ textAlign: 'left', padding: '6px 10px' }}>Item</th>
                      <th style={{ textAlign: 'right', padding: '6px 10px' }}>Amount (KES)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDemoStructure(fee.school).items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '6px 10px', color: '#222' }}>{item.label}</td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', color: '#ff9800', fontWeight: 700 }}>{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#222' }}>Total</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, color: '#ff3d00', fontSize: '1.08em' }}>{getDemoStructure(fee.school).total.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ background: '#f7fafd', borderRadius: 10, padding: '1em 1.2em', marginBottom: 8, fontSize: '1em' }}>
                  <div><strong>Bank:</strong> {getDemoStructure(fee.school).bank.name}</div>
                  <div><strong>Account Name:</strong> {getDemoStructure(fee.school).bank.accName}</div>
                  <div><strong>Account Number:</strong> {getDemoStructure(fee.school).bank.account}</div>
                  <div><strong>Branch:</strong> {getDemoStructure(fee.school).bank.branch}</div>
                  <div><strong>Paybill:</strong> {getDemoStructure(fee.school).bank.paybill}</div>
                </div>
              </div>
              <button onClick={() => { setStructureModal({ open: false, feeId: undefined }); handleAcceptStructure(fee.id); }} style={{
                background: '#ff9800', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: '1.08em', cursor: 'pointer', marginTop: 8, boxShadow: '0 1px 6px 0 rgba(255,152,0,0.07)',
              }}>Accept Structure</button>
            </div>
          </div>
        );
      })()}
      <div style={{ marginTop: 32, color: '#888', fontSize: '1.05em' }}>
        <strong>Note:</strong> This is a demo. Payments and structure acceptance are simulated and not real.
      </div>
    </div>
  );
};

export default FeePortal;
