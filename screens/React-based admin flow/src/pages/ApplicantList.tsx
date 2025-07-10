import React from 'react';
import { Link } from 'react-router-dom';
import './ApplicantList.css';

const applicants = [
  { id: 1, name: 'Jane Doe', school: 'Kimana Girls School', status: 'Pending' },
  { id: 2, name: 'Rajombol Siayho', school: 'Maasai Primary School', status: 'Approved' },
  { id: 3, name: 'Amina Njeri', school: 'Nairobi High', status: 'In Progress' },
];

const ApplicantList: React.FC = () => {
  return (
    <div className="applicant-list-container">
      <h2 className="applicant-list-title">All Applications</h2>
      <div className="applicant-list-table">
        <div className="applicant-list-header">
          <span>Name</span>
          <span>School</span>
          <span>Status</span>
          <span>Details</span>
        </div>
        {applicants.map((applicant) => (
          <div className="applicant-list-row" key={applicant.id}>
            <span>{applicant.name}</span>
            <span>{applicant.school}</span>
            <span className={`status-badge ${applicant.status.toLowerCase().replace(' ', '-')}`}>{applicant.status}</span>
            <Link to={`/applicants/${applicant.id}`} className="details-link">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicantList;
