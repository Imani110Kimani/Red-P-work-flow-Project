import redpLogo from './assets/redp-logo.png';
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FeePortal from './pages/FeePortal';
//import FaceIDCamera from "./pages/FaceIDCamera";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import Notifications from "./pages/Notifications";
import LandingLoginPage from "./pages/LandingLoginPage";
import StudentVerificationDetails from "./pages/StudentVerificationDetails";
import SchoolVerificationDetails from "./pages/SchoolVerificationDetails";
import ApplicantListWithAction from "./pages/ApplicantListWithAction";
import ApplicantDetails from "./pages/ApplicantDetails";
import AdmissionDetails from "./pages/AdmissionsDetails";
import PendingDetails from "./pages/PendingDetails";
import AdminsTable from "./pages/AdminsTable";
import { useApplicantData } from "./contexts/ApplicantDataContext";
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Help from './pages/Help';



// Wrapper to fetch applicants and pass to PendingDetails using cached data
const PendingDetailsWithFetch: React.FC = () => {
  const { applicants, loading, error } = useApplicantData();

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>Loading pending applicants...</div>;
  if (error) return <div style={{padding:'2rem',color:'#f44336',textAlign:'center'}}>Failed to load applicants: {error}</div>;
  
  // Map API data to PendingDetails expected shape
  const mapped = applicants.map((a: any) => ({
    id: a.rowKey || a.id || Math.random().toString(),
    name: `${a.firstName || ''} ${a.lastName || ''}`.trim(),
    school: a.schoolName || a.school || '',
    status: typeof a.status === 'number' ? (a.status === 1 ? 'Pending' : a.status === 2 ? 'Approved' : a.status === 3 ? 'Denied' : 'Pending') : a.status || 'Pending',
    submittedOn: a.dateOfBirth || a.date || '',
    reason: a.reason || '',
    notes: a.notes || ''
  }));

  return <PendingDetails applicants={mapped} />;
};


const App: React.FC = () => (
  <ThemeProvider>
    <ToastProvider>
      <div className="redp-app-bg" style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingLoginPage />} />
            <Route path="/dashboard" element={<Dashboard />}>
              {/* Dashboard main summary/cards can be rendered by default (index route) */}
              <Route index element={null} />
              <Route path="admissions" element={<AdmissionDetails />} />
              <Route path="admissions/:id" element={<AdmissionDetails />} />
              <Route path="students" />
              <Route path="school-verification" element={<SchoolVerificationDetails />} />
              <Route path="school-verification/:id" element={<SchoolVerificationDetails />} />
              <Route path="applicants" element={<ApplicantListWithAction />} />
              <Route path="applicants/:id" element={<ApplicantDetails />} />
              <Route path="pending" element={<PendingDetailsWithFetch />} />
              <Route path="pending/:id" element={<PendingDetailsWithFetch />} />
              <Route path="admins" element={<AdminsTable />} />
              <Route path="logs" element={<Logs />} />
              <Route path="logs" element={<Notifications />} />
              <Route path="fee-portal" element={<FeePortal />} />
            </Route>
            <Route path="help" element={<Help />} />
            {/* Fallback for 404 */}
            <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}><h2>404 - Page Not Found</h2></div>} />
          </Routes>
        </BrowserRouter>
        {/* Notifications are now only shown on /dashboard/logs route */}
      </div>
    </ToastProvider>
  </ThemeProvider>
);

export default App;
