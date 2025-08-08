import React from 'react';

const helpSections = [
  {
    title: 'Dashboard Overview',
    description: 'See a summary of applicants, admissions, students, and admins. Click any card to view more details.'
  },
  {
    title: 'Applicants',
    description: 'View and manage all applicants. Click a row to see applicant details, documents, and logs.'
  },
  {
    title: 'Admissions',
    description: 'Track the admissions process. Approve or deny applications and monitor progress.'
  },
  {
    title: 'Students',
    description: 'View all approved students. Access their academic records and fee status.'
  },
  {
    title: 'Admins',
    description: 'Manage admin users. Add, remove, or update admin privileges.'
  },
  {
    title: 'Logs',
    description: 'Audit all actions taken in the system. See who approved, edited, or viewed records.'
  },
  {
    title: 'Fee Portal',
    description: 'Manage student fee payments. Click a student to view their fee structure, payment status, and initiate payments.'
  },
  {
    title: 'Notifications',
    description: 'View recent system notifications and alerts.'
  },
];

const Help: React.FC = () => (
  <div style={{ maxWidth: 700, margin: '2rem auto', background: 'var(--redp-card)', borderRadius: 16, boxShadow: '0 2px 16px 0 rgba(34,34,34,0.08)', padding: '2.5rem 2rem', color: 'var(--redp-text)' }}>
    <h2 style={{ color: 'var(--redp-accent)', marginBottom: 24 }}>Help & Instructions</h2>
    <p style={{ marginBottom: 32, color: '#888' }}>
      This page explains how to use each section of the Red-P Admin System. Click on any sidebar button to navigate to that section.
    </p>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {helpSections.map(section => (
        <li key={section.title} style={{ marginBottom: 28 }}>
          <div style={{ fontWeight: 700, fontSize: '1.18em', color: 'var(--redp-accent)', marginBottom: 6 }}>{section.title}</div>
          <div style={{ color: 'var(--redp-text)', fontSize: '1.05em' }}>{section.description}</div>
        </li>
      ))}
    </ul>
    <div style={{ marginTop: 40, color: '#aaa', fontSize: '0.98em' }}>
      For further assistance, contact your system administrator.
    </div>
  </div>
);

export default Help;
