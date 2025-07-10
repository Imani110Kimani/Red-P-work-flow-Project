import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApplicantList from './pages/ApplicantList';
import ApplicantDetails from './pages/ApplicantDetails';
import AdminProfile from './pages/AdminProfile';
import Notifications from './pages/Notifications';
import AdmissionsDetails from './pages/AdmissionsDetails';
import SchoolVerificationDetails from './pages/SchoolVerificationDetails';
import StudentVerificationDetails from './pages/StudentVerificationDetails';
import PendingDetails from './pages/PendingDetails';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applicants" element={<ApplicantList />} />
        <Route path="/applicants/:id" element={<ApplicantDetails />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admissions/:id" element={<AdmissionsDetails />} />
        <Route path="/school-verification/:id" element={<SchoolVerificationDetails />} />
        <Route path="/student-verification/:id" element={<StudentVerificationDetails />} />
        <Route path="/pending/:id" element={<PendingDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
