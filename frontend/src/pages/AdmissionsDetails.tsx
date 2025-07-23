import React from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import "./AdmissionsDetails.css";

// Example: You can fetch real data using the id param if needed
const mockDetails = {
  applicationId: "REDP-2025-00123",
  applicantName: "Priya Sharma",
  admissionStatus: "Approved",
  admissionDate: "2025-06-15",
  program: "Class 6",
  school: "Green Valley Public School",
  remarks: "All documents verified.",
  applicantId: 1,
};

const statusColors: Record<string, string> = {
  approved: "#00c853",
  pending: "#ff7a00",
  rejected: "#e53935",
};

const AdmissionsDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // In a real app, fetch details using the id param
  const details = mockDetails;

  return (
    <div className="admissions-details-container">
      <nav className="details-nav-links">
        <button className="back-btn" onClick={() => navigate("/dashboard/admissions")}>
          &larr; All Admissions
        </button>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          &larr; Dashboard
        </button>
      </nav>
      <h2 className="admissions-details-title">Admission Details</h2>
      <div className="admissions-details-card">
        <div className="detail-row">
          <span className="label">Application ID:</span>
          <span>{details.applicationId}</span>
        </div>
        <div className="detail-row">
          <span className="label">Applicant Name:</span>
          <span>
            {details.applicantName}{" "}
            <Link to={`/dashboard/applicants/${details.applicantId}`} className="related-link">
              (View Applicant)
            </Link>
          </span>
        </div>
        <div className="detail-row">
          <span className="label">Admission Status:</span>
          <span
            className="status-badge"
            style={{
              background: statusColors[details.admissionStatus.toLowerCase()] || "#bdbdbd",
              color: "#fff",
              padding: "0.2em 0.9em",
              borderRadius: 16,
              fontWeight: 600,
              fontSize: "0.97em",
              letterSpacing: 0.5,
            }}
          >
            {details.admissionStatus}
          </span>
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
