import redpLogo from './assets/redp-logo.png';
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import LandingLoginPage from "./pages/LandingLoginPage";
import StudentVerificationDetails from "./pages/StudentVerificationDetails";
import SchoolVerificationDetails from "./pages/SchoolVerificationDetails";
import ApplicantList from "./pages/ApplicantList";
import ApplicantDetails from "./pages/ApplicantDetails";
import AdmissionDetails from "./pages/AdmissionsDetails";
import PendingDetails from "./pages/PendingDetails";


// Wrapper to fetch applicants and pass to PendingDetails
const PendingDetailsWithFetch: React.FC = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch("https://simbagetapplicants-hcf5cffbcccmgsbn.westus-01.azurewebsites.net/api/httptablefunction")
      .then(res => res.json())
      .then(data => {
        // Map API data to PendingDetails expected shape
        const mapped = data.map((a: any) => ({
          id: a.rowKey || a.id || Math.random().toString(),
          name: `${a.firstName || ''} ${a.lastName || ''}`.trim(),
          school: a.schoolName || a.school || '',
          status: typeof a.status === 'number' ? (a.status === 1 ? 'Pending' : a.status === 2 ? 'Approved' : a.status === 3 ? 'Denied' : 'Pending') : a.status || 'Pending',
          submittedOn: a.dateOfBirth || a.date || '',
          reason: a.reason || '',
          notes: a.notes || ''
        }));
        setApplicants(mapped);
        setLoading(false);
      })
      .catch(err => { setError(err); setLoading(false); });
  }, []);
  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>Loading pending applicants...</div>;
  if (error) return <div style={{padding:'2rem',color:'#f44336',textAlign:'center'}}>Failed to load applicants.</div>;
  return <PendingDetails applicants={applicants} />;
};

const App: React.FC = () => (
  <div style={{ background: '#fff', minHeight: '100vh' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0 1rem 0' }}>
      <div style={{ background: 'rgba(255,61,0,0.85)', borderRadius: 32, padding: 18, boxShadow: '0 6px 24px #ff3d00', marginBottom: 36 }}>
        <img
          src={redpLogo}
          alt="REDP logo"
          style={{ height: 90, display: 'block', opacity: 1 }}
        />
      </div>
      <h1 style={{ color: '#ff3d00', fontWeight: 900, letterSpacing: 2, fontSize: '2.2rem', margin: 0 }}>RED(<span style={{fontWeight:900}}>P</span>) Admin Portal</h1>
    </div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLoginPage />} />
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Dashboard main summary/cards can be rendered by default (index route) */}
          <Route index element={null} />
          <Route path="admissions" element={<AdmissionDetails />} />
          <Route path="admissions/:id" element={<AdmissionDetails />} />
          <Route path="student-verification" element={<StudentVerificationDetails />} />
          <Route path="student-verification/:id" element={<StudentVerificationDetails />} />
          <Route path="school-verification" element={<SchoolVerificationDetails />} />
          <Route path="school-verification/:id" element={<SchoolVerificationDetails />} />
          <Route path="applicants" element={<ApplicantList />} />
          <Route path="applicants/:id" element={<ApplicantDetails />} />
          <Route path="pending" element={<PendingDetailsWithFetch />} />
          <Route path="pending/:id" element={<PendingDetailsWithFetch />} />
          {/* Change notifications route to logs */}
          <Route path="logs" element={<Notifications />} />
        </Route>
        {/* Fallback for 404 */}
        <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}><h2>404 - Page Not Found</h2></div>} />
      </Routes>
    </BrowserRouter>
  </div>
);

export default App;
