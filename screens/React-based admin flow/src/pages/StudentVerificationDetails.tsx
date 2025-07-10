import React from "react";
import { useNavigate } from "react-router-dom";
import "./StudentVerificationDetails.css";

const StudentVerificationDetails: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder data
  const student = {
    name: "John Doe",
    dob: "2007-04-12",
    grade: "10",
    school: "Springfield High School",
    status: "Pending",
    verificationDate: "-",
    documents: [
      { name: "Birth Certificate", url: "#" },
      { name: "Previous Report Card", url: "#" },
    ],
    notes: "Awaiting verification of submitted documents.",
  };

  return (
    <div className="student-verification-details-container">
      <div className="details-nav-links">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>&larr; Dashboard</button>
        <button className="back-btn" onClick={() => navigate('/student-verification/1')}>&larr; All Students</button>
      </div>
      <div className="details-card">
        <h2>Student Verification Details</h2>
        <div className="info-row">
          <span className="label">Student Name:</span>
          <span>{student.name}</span>
        </div>
        <div className="info-row">
          <span className="label">Date of Birth:</span>
          <span>{student.dob}</span>
        </div>
        <div className="info-row">
          <span className="label">Grade:</span>
          <span>{student.grade}</span>
        </div>
        <div className="info-row">
          <span className="label">School:</span>
          <span>{student.school} <a href="/school-verification/1" className="related-link">(View School Verification)</a></span>
        </div>
        <div className="info-row">
          <span className="label">Status:</span>
          <span className={`status-badge ${student.status.toLowerCase()}`}>{student.status}</span>
        </div>
        <div className="info-row">
          <span className="label">Verification Date:</span>
          <span>{student.verificationDate}</span>
        </div>
        <div className="info-row">
          <span className="label">Documents:</span>
          <ul className="documents-list">
            {student.documents.map((doc, idx) => (
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
          <span>{student.notes}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentVerificationDetails;
