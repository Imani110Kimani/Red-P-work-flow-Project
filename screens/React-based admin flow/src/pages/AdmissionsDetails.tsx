import React from "react";
import "./AdmissionsDetails.css";
import { useNavigate } from "react-router-dom";

const AdmissionsDetails: React.FC = () => {
  const navigate = useNavigate();
  // Placeholder data
  const details = {
    applicationId: "REDP-2025-00123",
    applicantName: "Priya Sharma",
    admissionStatus: "Approved",
    admissionDate: "2025-06-15",
    program: "Class 6",
    school: "Green Valley Public School",
    remarks: "All documents verified."
  };

  return (
    <div className="admissions-details-container">
      <div className="details-nav-links">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>&larr; Dashboard</button>
        <button className="back-btn" onClick={() => navigate('/admissions/1')}>&larr; All Admissions</button>
      </div>
      <h2>Admissions Details</h2>
      <div className="admissions-details-card">
        <div className="detail-row">
          <span className="label">Application ID:</span>
          <span>{details.applicationId}</span>
        </div>
        <div className="detail-row">
          <span className="label">Applicant Name:</span>
          <span>{details.applicantName} <a href="/applicants/1" className="related-link">(View Applicant)</a></span>
        </div>
        <div className="detail-row">
          <span className="label">Admission Status:</span>
          <span className={`status-badge ${details.admissionStatus.toLowerCase()}`}>{details.admissionStatus}</span>
        </div>
        <div className="detail-row">
          <span className="label">Admission Date:</span>
          <span>{details.admissionDate}</span>
        </div>
        <div className="detail-row">
          <span className="label">Program:</span>
          <span>{details.program}</span>
        </div>
        <div className="detail-row">
          <span className="label">School:</span>
          <span>{details.school}</span>
        </div>
        <div className="detail-row">
          <span className="label">Remarks:</span>
          <span>{details.remarks}</span>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsDetails;
