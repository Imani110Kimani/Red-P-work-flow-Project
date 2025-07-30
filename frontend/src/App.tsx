import redpLogo from './assets/redp-logo.png';
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import { Notifications } from "./pages/Notifications";
import LandingLoginPage from "./pages/LandingLoginPage";
import StudentVerificationDetails from "./pages/StudentVerificationDetails";
import SchoolVerificationDetails from "./pages/SchoolVerificationDetails";
import ApplicantList from "./pages/ApplicantList";
import ApplicantDetails from "./pages/ApplicantDetails";
import AdmissionDetails from "./pages/AdmissionsDetails";

const App: React.FC = () => (
  <div style={{ background: '#fff', minHeight: '100vh' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0 1rem 0' }}>
      <div style={{
        background: 'rgba(255,61,0,0.85)',
        borderRadius: 32,
        padding: 18,
        boxShadow: '0 6px 24px #ff3d00',
        marginBottom: 36
      }}>
        <img
          src={redpLogo}
          alt="REDP logo"
          style={{ height: 90, display: 'block', opacity: 1 }}
        />
      </div>
      <h1 style={{
        color: '#ff3d00',
        fontWeight: 900,
        letterSpacing: 2,
        fontSize: '2.2rem',
        margin: 0
      }}>
        RED(<span style={{ fontWeight: 900 }}>P</span>) Admin Portal
      </h1>
    </div>

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLoginPage />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={null} />
          <Route path="admissions" element={<AdmissionDetails />} />
          <Route path="admissions/:id" element={<AdmissionDetails />} />
          <Route path="student-verification" element={<StudentVerificationDetails />} />
          <Route path="student-verification/:id" element={<StudentVerificationDetails />} />
          <Route path="school-verification" element={<SchoolVerificationDetails />} />
          <Route path="school-verification/:id" element={<SchoolVerificationDetails />} />
          <Route path="applicants" element={<ApplicantList />} />
          <Route path="applicants/:id" element={<ApplicantDetails />} />
          <Route path="logs" element={<Notifications />} />
        </Route>
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
