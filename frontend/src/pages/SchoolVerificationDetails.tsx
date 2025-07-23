import React from "react";
import { useNavigate } from "react-router-dom";
import "./SchoolVerificationDetails.css";

const SchoolVerificationDetails: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder data
  const school = {
    name: "Springfield High School",
    address: "123 Main St, Springfield",
    contact: "(555) 123-4567",
    principal: "Samantha Carter",
    status: "Verified",
    verificationDate: "2025-06-15",
    documents: [
      { name: "Accreditation Certificate", url: "#" },
      { name: "Building Safety Report", url: "#" },
    ],
    notes: "All documents are up to date. No issues found during verification.",
  };

  return (
    <div className="school-verification-details-container">
      <div className="details-nav-links">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>&larr; Dashboard</button>
        <button className="back-btn" onClick={() => navigate('/school-verification/1')}>&larr; All Schools</button>
      </div>
      <div className="details-card">
        <h2>School Verification Details</h2>
        <div className="info-row">
          <span className="label">School Name:</span>
          <span>{school.name}</span>
        </div>
        <div className="info-row">
          <span className="label">Students:</span>
          <a href="/student-verification/1" className="related-link">View Student Verification</a>
        </div>
        <div className="info-row">
          <span className="label">Address:</span>
          <span>{school.address}</span>
        </div>
        <div className="info-row">
          <span className="label">Contact:</span>
          <span>{school.contact}</span>
        </div>
        <div className="info-row">
          <span className="label">Principal:</span>
          <span>{school.principal}</span>
        </div>
        <div className="info-row">
          <span className="label">Status:</span>
          <span className={`status-badge ${school.status.toLowerCase()}`}>{school.status}</span>
        </div>
        <div className="info-row">
          <span className="label">Verification Date:</span>
          <span>{school.verificationDate}</span>
        </div>
        <div className="info-row">
          <span className="label">Documents:</span>
          <ul className="documents-list">
            {school.documents.map((doc, idx) => (
              <li key={idx}>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  {doc.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="info-row notes-row">
          <span className="label">Notes:</span>
          <span>{school.notes}</span>
        </div>
      </div>
    </div>
  );
};

export default SchoolVerificationDetails;
