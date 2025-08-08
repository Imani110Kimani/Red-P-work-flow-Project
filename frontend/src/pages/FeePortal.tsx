import React, { useState } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import './FeePortal.css';

// Types
export interface Student {
	id: string;
	name: string;
	email: string;
	phone: string;
	school: string;
	currentClass: string;
	feeStructure: string;
	kcpeSlip: string;
	highSchoolResults: { term: string; file: string; uploaded: string }[];
	paymentStatus: 'Pending' | 'Paid';
	feeBalance: number;
	lastPayment: string;
	docsComplete: boolean;
	parent: { name: string; phone: string };
	notes: string;
}

// Dummy data for students and their uploaded documents (extended)
const students: Student[] = [
	{
		id: 'stu001',
		name: 'Jane Mwangi',
		email: 'jane.mwangi@example.com',
		phone: '0712 345678',
		school: 'Alliance Girls High School',
		currentClass: 'Form 3',
		feeStructure: 'fee-jan-2025.pdf',
		kcpeSlip: 'kcpe-jane.pdf',
		highSchoolResults: [
			{ term: 'Term 1, 2025', file: 'results-term1-2025.pdf', uploaded: '2025-03-10' },
			{ term: 'Term 3, 2024', file: 'results-term3-2024.pdf', uploaded: '2024-11-20' },
		],
		paymentStatus: 'Pending',
		feeBalance: 12000,
		lastPayment: '2025-01-15',
		docsComplete: true,
		parent: { name: 'Mary Mwangi', phone: '0722 111222' },
		notes: 'Needs follow-up on term 2 results.'
	},
	{
		id: 'stu002',
		name: 'Samuel Otieno',
		email: 'samuel.otieno@example.com',
		phone: '0700 987654',
		school: 'Maseno School',
		currentClass: 'Form 2',
		feeStructure: 'fee-jan-2025.pdf',
		kcpeSlip: 'kcpe-samuel.pdf',
		highSchoolResults: [
			{ term: 'Term 1, 2025', file: 'results-term1-2025.pdf', uploaded: '2025-03-12' },
			{ term: 'Term 2, 2024', file: 'results-term2-2024.pdf', uploaded: '2024-07-15' },
		],
		paymentStatus: 'Paid',
		feeBalance: 0,
		lastPayment: '2025-03-20',
		docsComplete: true,
		parent: { name: 'Peter Otieno', phone: '0733 222333' },
		notes: ''
	},
	{
		id: 'stu003',
		name: 'Aisha Hassan',
		email: 'aisha.hassan@example.com',
		phone: '0799 555444',
		school: 'Moi Girls Eldoret',
		currentClass: 'Form 4',
		feeStructure: 'fee-jan-2025.pdf',
		kcpeSlip: 'kcpe-aisha.pdf',
		highSchoolResults: [
			{ term: 'Term 1, 2025', file: 'results-term1-2025.pdf', uploaded: '2025-03-10' },
			{ term: 'Term 3, 2024', file: 'results-term3-2024.pdf', uploaded: '2024-11-20' },
			{ term: 'Term 2, 2024', file: 'results-term2-2024.pdf', uploaded: '2024-07-10' },
		],
		paymentStatus: 'Pending',
		feeBalance: 8000,
		lastPayment: '2025-02-10',
		docsComplete: false,
		parent: { name: 'Fatuma Hassan', phone: '0711 333222' },
		notes: 'Missing KCPE slip.'
	},
];

const FeePortal: React.FC = () => {
	const [confirmPay, setConfirmPay] = useState<Student | null>(null);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const { showToast } = useToast();
	const handlePayNow = (student: Student, e: React.MouseEvent) => {
		e.stopPropagation();
		setConfirmPay(student);
	};
	const handleConfirmPay = () => {
		if (confirmPay) {
			showToast(`Payment initiated for ${confirmPay.name}`, 'success');
			setConfirmPay(null);
		}
	};
	return (
		<div className="fee-portal-root">
			<h2>Fee Payment Portal</h2>
			<table className="fee-portal-table" style={{ color: 'var(--redp-text)', background: 'var(--redp-card)' }}>
				<thead>
					<tr>
				<th style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Avatar</th>
				<th style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Name</th>
				<th style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Class</th>
				<th style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>School</th>
				<th style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Payment Status</th>
				<th style={{ color: 'var(--redp-table-header)', background: 'var(--redp-table-header-bg)' }}>Action</th>
					</tr>
				</thead>
				<tbody>
					{students.map(student => (
				    <tr key={student.id} onClick={() => setSelectedStudent(student)} style={{ background: 'var(--redp-table-bg)' }}>
							{/* Avatar */}
							<td style={{ textAlign: 'center' }}>
								<span className="avatar-initials fee-avatar">
									{student.name.split(' ').map(n => n[0]).join('').slice(0,2)}
								</span>
							</td>
							<td className="fee-name">{student.name}</td>
							<td>{student.currentClass}</td>
							<td>{student.school}</td>
							<td>
								<span className={`fee-status ${student.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}>{student.paymentStatus}</span>
							</td>
							<td>
								{student.paymentStatus === 'Pending' ? (
									<button className="pay-btn" onClick={e => { e.stopPropagation(); handlePayNow(student, e); }}>Pay Now</button>
								) : (
									<span className="fee-status paid">Paid</span>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<ConfirmDialog
				open={!!confirmPay}
				title="Confirm Payment"
				message={confirmPay ? `Are you sure you want to initiate payment for ${confirmPay.name}?` : ''}
				onConfirm={handleConfirmPay}
				onCancel={() => setConfirmPay(null)}
			/>
			{/* Student Details Modal */}
			{selectedStudent && (
				<Modal open={!!selectedStudent} onClose={() => setSelectedStudent(null)}>
					<div style={{ minWidth: 340, maxWidth: 480, padding: 8 }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
							<span className="avatar-initials fee-avatar" style={{ width: 54, height: 54, fontSize: '1.5em' }}>
								{selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0,2)}
							</span>
							<div>
								<div style={{ fontWeight: 700, fontSize: '1.18em', color: '#e53935' }}>{selectedStudent.name}</div>
								<div style={{ color: '#888', fontSize: '1em' }}>{selectedStudent.currentClass} &bull; {selectedStudent.school}</div>
								<div style={{ color: '#ff9800', fontWeight: 600, fontSize: '0.98em' }}>Parent: {selectedStudent.parent.name} ({selectedStudent.parent.phone})</div>
							</div>
						</div>
						<div style={{ marginBottom: 10 }}>
							<div style={{ fontWeight: 600, color: '#222', marginBottom: 4 }}>Fee Structure:</div>
							<a href={`/${selectedStudent.feeStructure}`} target="_blank" rel="noopener noreferrer" style={{ color: '#ff9800', textDecoration: 'underline', fontWeight: 600 }}>
								{selectedStudent.feeStructure}
							</a>
							<span style={{ color: '#888', fontSize: '0.97em', marginLeft: 8 }}>(Last payment: {selectedStudent.lastPayment}, Balance: KES {selectedStudent.feeBalance.toLocaleString()})</span>
						</div>
						<div style={{ marginBottom: 10 }}>
							<div style={{ fontWeight: 600, color: '#222', marginBottom: 4 }}>KCPE Slip:</div>
							<a href={`/${selectedStudent.kcpeSlip}`} target="_blank" rel="noopener noreferrer" style={{ color: '#ff9800', textDecoration: 'underline', fontWeight: 600 }}>
								{selectedStudent.kcpeSlip}
							</a>
						</div>
						<div style={{ marginBottom: 10 }}>
							<div style={{ fontWeight: 600, color: '#222', marginBottom: 4 }}>High School Results:</div>
							<ul style={{ paddingLeft: 18, margin: 0 }}>
								{selectedStudent.highSchoolResults.map(res => (
									<li key={res.term} style={{ marginBottom: 2 }}>
										<a href={`/${res.file}`} target="_blank" rel="noopener noreferrer" style={{ color: '#ff9800', textDecoration: 'underline', fontWeight: 600 }}>{res.term}</a>
										<span style={{ color: '#888', fontSize: '0.97em', marginLeft: 8 }}>(Uploaded: {res.uploaded})</span>
									</li>
								))}
							</ul>
						</div>
						<div style={{ marginBottom: 10 }}>
							<div style={{ fontWeight: 600, color: '#222', marginBottom: 4 }}>Other Details:</div>
							<div style={{ color: '#555', fontSize: '0.98em' }}>{selectedStudent.notes || 'No additional notes.'}</div>
							<div style={{ color: selectedStudent.docsComplete ? '#00c853' : '#e53935', fontWeight: 600, marginTop: 4 }}>
								Documents: {selectedStudent.docsComplete ? 'Complete' : 'Incomplete'}
							</div>
						</div>
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
							<button className="pay-btn" onClick={() => { setSelectedStudent(null); setConfirmPay(selectedStudent); }}>Pay Now</button>
							<button className="pay-btn" style={{ background: '#eee', color: '#e53935' }} onClick={() => setSelectedStudent(null)}>Close</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
};

export default FeePortal;
