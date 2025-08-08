import React from "react";
import redpLogo from "./assets/redp-logo.png";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Dashboard from "./pages/Dashboard";
import FeePortal from "./pages/FeePortal";
import Notifications from "./pages/Notifications";
import LandingLoginPage from "./pages/LandingLoginPage";
import StudentVerificationDetails from "./pages/StudentVerificationDetails";
import SchoolVerificationDetails from "./pages/SchoolVerificationDetails";
import ApplicantList from "./pages/ApplicantList";
import ApplicantDetails from "./pages/ApplicantDetails";
<<<<<<< HEAD
// import AdmissionDetails from "./pages/AdmissionsDetails";
import Students from "./pages/Students";
import Admissions from "./pages/Admissions";
=======
import AdmissionDetails from "./pages/AdmissionsDetails";
import PendingDetails from "./pages/PendingDetails";
import AdminsTable from "./pages/AdminsTable";
import { useApplicantData } from "./contexts/ApplicantDataContext";
>>>>>>> 3d5021cbf3ada6c1272a1ddc84a4f7903aff7c15

// Handler for approve/deny actions
const handleApplicantAction = async (partitionKey, rowKey, newStatus, adminEmail) => {
  try {
    await fetch("/api/updateApplicantStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partitionKey, rowKey, status: newStatus, adminEmail }),
    });
    // Optionally, refresh applicant data/context here
  } catch (error) {
    console.error("Failed to update applicant status:", error);
  }
};

const App: React.FC = () => (
  <div style={{ background: '#fff', minHeight: '100vh' }}>
    <div style={{
      width: '100%',
      background: '#ffad1f',
      display: 'flex',
      alignItems: 'center',
      padding: '0.5rem 2rem',
      minHeight: 60,
      boxShadow: '0 2px 8px 0 rgba(34,34,34,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <img src={redpLogo} alt="RED(P) Logo" style={{ height: 44, display: 'block' }} />
    </div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLoginPage />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={null} />
          <Route path="students" element={<Students />} />
          <Route path="admissions" element={<Admissions />} />
          {/* <Route path="admissions/:id" element={<AdmissionDetails />} /> */}
          <Route path="student-verification" element={<StudentVerificationDetails />} />
          <Route path="student-verification/:id" element={<StudentVerificationDetails />} />
          <Route path="school-verification" element={<SchoolVerificationDetails />} />
          <Route path="school-verification/:id" element={<SchoolVerificationDetails />} />
        <Route path="applicants" element={<ApplicantList onAction={handleApplicantAction} />} />
          <Route path="applicants/:id" element={<ApplicantDetails />} />
<<<<<<< HEAD
=======
          <Route path="pending" element={<PendingDetailsWithFetch />} />
          <Route path="pending/:id" element={<PendingDetailsWithFetch />} />
          <Route path="admins" element={<AdminsTable />} />
          {/* Change notifications route to logs */}
>>>>>>> 3d5021cbf3ada6c1272a1ddc84a4f7903aff7c15
          <Route path="logs" element={<Notifications />} />
          <Route path="fee-portal" element={<FeePortal />} />
          {/* Let Dashboard handle unmatched dashboard routes (shows creative info page) */}
          <Route path="*" element={null} />
        </Route>
        {/* Only show 404 for non-dashboard unmatched routes */}
        <Route
          path="*"
          element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>404 - Page Not Found</h2>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  </div>
);

export default App;
