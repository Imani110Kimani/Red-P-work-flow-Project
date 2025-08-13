import React from 'react';

import type { Student } from './FeePortal';

interface StudentDrawerProps {
  student: Student;
  onClose: () => void;
}

const drawerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  width: 420,
  height: '100vh',
  background: '#fff',
  boxShadow: '-4px 0 16px 0 rgba(229,57,53,0.13)',
  zIndex: 1000,
  padding: '2rem 2.2rem 2rem 2rem',
  overflowY: 'auto',
  transition: 'transform 0.3s',
  display: 'flex',
  flexDirection: 'column',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(34,34,34,0.18)',
  zIndex: 999,
};

const StudentDrawer: React.FC<StudentDrawerProps> = ({ student, onClose }) => {
  if (!student) return null;
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={drawerStyle}>
        <button onClick={onClose} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 22, color: '#e53935', cursor: 'pointer', marginBottom: 10 }}>&times;</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 54, height: 54, borderRadius: '50%', background: '#ffb224', color: '#fff', fontWeight: 900, fontSize: '1.5rem', boxShadow: '0 1px 4px 0 rgba(229,57,53,0.08)', textTransform: 'uppercase', letterSpacing: 1
          }}>{student.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#e53935' }}>{student.name}</div>
            <div style={{ fontSize: '1.01em', color: '#444' }}>{student.currentClass} &bull; {student.school}</div>
            <div style={{ fontSize: '0.98em', color: '#888' }}>{student.email}</div>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}><b>Student ID:</b> {student.id}</div>
        <div style={{ marginBottom: 10 }}><b>Phone:</b> {student.phone}</div>
        <div style={{ marginBottom: 10 }}><b>Parent/Guardian:</b> {student.parent.name} ({student.parent.phone})</div>
        <div style={{ marginBottom: 10 }}><b>Fee Balance:</b> <span style={{ color: student.feeBalance > 0 ? '#e53935' : 'green', fontWeight: 700 }}>{student.feeBalance > 0 ? `KES ${student.feeBalance.toLocaleString()}` : '0 (Cleared)'}</span></div>
        <div style={{ marginBottom: 10 }}><b>Last Payment:</b> {student.lastPayment}</div>
        <div style={{ marginBottom: 10 }}><b>Payment Status:</b> <span style={{ color: student.paymentStatus === 'Paid' ? 'green' : '#e53935', fontWeight: 700 }}>{student.paymentStatus}</span></div>
        <div style={{ marginBottom: 10 }}><b>Fee Structure:</b> <a href={`#/${student.feeStructure}`} target="_blank" rel="noopener noreferrer">View</a></div>
        <div style={{ marginBottom: 10 }}><b>KCPE Slip:</b> <a href={`#/${student.kcpeSlip}`} target="_blank" rel="noopener noreferrer">View</a></div>
        <div style={{ marginBottom: 10 }}><b>High School Results:</b>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {student.highSchoolResults.map((res, idx) => (
              <li key={idx}>
                <span style={{ fontWeight: 500 }}>{res.term}:</span> <a href={`#/${res.file}`} target="_blank" rel="noopener noreferrer">View</a>
                <span style={{ fontSize: '0.9em', color: '#888', marginLeft: 6 }}>({res.uploaded})</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginBottom: 10 }}><b>Documents Status:</b> {student.docsComplete ? (<span style={{ color: 'green', fontWeight: 700 }}>✔ Complete</span>) : (<span style={{ color: '#e53935', fontWeight: 700 }}>✖ Incomplete</span>)}
        </div>
        <div style={{ marginBottom: 10 }}><b>Notes:</b> <span style={{ color: '#ff9800' }}>{student.notes}</span></div>
        <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          {student.paymentStatus === 'Pending' && <button className="pay-btn">Pay Now</button>}
          <button className="pay-btn" style={{ background: '#ff9800' }}>Send Reminder</button>
        </div>
      </div>
    </>
  );
};

export default StudentDrawer;
