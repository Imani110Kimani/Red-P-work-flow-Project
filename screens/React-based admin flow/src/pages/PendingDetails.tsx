import React from "react";
import { useNavigate } from "react-router-dom";
import "./PendingDetails.css";

const PendingDetails: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder data
  const pending = {
    type: "Application",
    applicant: "Jane Smith",
    submittedOn: "2025-07-01",
    status: "Pending",
    reason: "Awaiting document upload",
    notes: "Applicant has not yet uploaded the required proof of address.",
  };

  return (
    <div className="pending-details-container">
      <div className="details-nav-links">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>&larr; Dashboard</button>
        <button className="back-btn" onClick={() => navigate('/pending/1')}>&larr; All Pending</button>
      </div>
      <div className="details-card">
        <h2>Pending Details</h2>
        <div className="info-row">
          <span className="label">Type:</span>
          <span>{pending.type}</span>
        </div>
        <div className="info-row">
          <span className="label">Applicant:</span>
          <span>{pending.applicant}</span>
        </div>
        <div className="info-row">
          <span className="label">Submitted On:</span>
          <span>{pending.submittedOn}</span>
        </div>
        <div className="info-row">
          <span className="label">Status:</span>
          <span className={`status-badge ${pending.status.toLowerCase()}`}>{pending.status}</span>
        </div>
        <div className="info-row">
          <span className="label">Reason:</span>
          <span>{pending.reason}</span>
        </div>
        <div className="info-row notes-row">
          <span className="label">Notes:</span>
          <span>{pending.notes}</span>
        </div>
        <div className="info-row">
          <span className="label">Applicant:</span>
          <a href="/applicants/1" className="related-link">View Applicant</a>
        </div>
      </div>
    </div>
  );
};

export default PendingDetails;
