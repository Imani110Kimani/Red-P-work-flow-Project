import React, { useState } from 'react';
import './ApplicantDetails.css';

const API_URL = '';

const NewAdmissionForm: React.FC = () => {
  const [form, setForm] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    DateOfBirth: '',
    GradeLevel: '',
    SchoolName: '',
    Location: '',
    Essay: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [schoolDocFile, setSchoolDocFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Preview helpers
  // ...existing code...

  React.useEffect(() => {
    // This effect is no longer needed as we are not previewing text directly from SAS URL
    // but from the Essay field which is a string.
    // Keeping it for now as it might be used elsewhere or for future text preview.
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'StudentID') setStudentIdFile(files[0]);
      if (name === 'SchoolDoc') setSchoolDocFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (studentIdFile) formData.append('StudentID', studentIdFile);
      if (schoolDocFile) formData.append('SchoolDoc', schoolDocFile);
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to submit admission.');
      setSubmitted(true);
      setForm({
        FirstName: '', LastName: '', Email: '', Phone: '', DateOfBirth: '', GradeLevel: '', SchoolName: '', Location: '', Essay: ''
      });
      setStudentIdFile(null);
      setSchoolDocFile(null);
  } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setError((err as { message?: string }).message || 'Submission failed.');
      } else {
        setError('Submission failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="applicant-details-container">
      <h2 className="applicant-details-title">New Admission</h2>
      <form className="applicant-details-card" onSubmit={handleSubmit}>
        <div><label><strong>First Name:</strong> <input name="FirstName" value={form.FirstName} onChange={handleChange} required /></label></div>
        <div><label><strong>Last Name:</strong> <input name="LastName" value={form.LastName} onChange={handleChange} required /></label></div>
        <div><label><strong>Email:</strong> <input name="Email" type="email" value={form.Email} onChange={handleChange} required /></label></div>
        <div><label><strong>Phone:</strong> <input name="Phone" value={form.Phone} onChange={handleChange} required /></label></div>
        <div><label><strong>Date of Birth:</strong> <input name="DateOfBirth" type="date" value={form.DateOfBirth} onChange={handleChange} required /></label></div>
        <div><label><strong>Grade Level:</strong> <input name="GradeLevel" type="number" value={form.GradeLevel} onChange={handleChange} required min="1" max="12" /></label></div>
        <div><label><strong>School Name:</strong> <input name="SchoolName" value={form.SchoolName} onChange={handleChange} required /></label></div>
        <div><label><strong>Location:</strong> <input name="Location" value={form.Location} onChange={handleChange} required /></label></div>
        <div><label><strong>Essay:</strong> <textarea name="Essay" value={form.Essay} onChange={handleEssayChange} required rows={5} style={{ width: '70%' }} /></label></div>
        <div><label><strong>Student ID:</strong> <input name="StudentID" type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileChange} required />
          {studentIdFile && <span style={{ marginLeft: 8, color: 'green' }}>{studentIdFile.name}</span>}
        </label></div>
        <div><label><strong>School Doc:</strong> <input name="SchoolDoc" type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileChange} required />
          {schoolDocFile && <span style={{ marginLeft: 8, color: 'green' }}>{schoolDocFile.name}</span>}
        </label></div>
        <button type="submit" className="dashboard-action-btn primary" style={{ marginTop: 18 }} disabled={loading || !studentIdFile || !schoolDocFile}>{loading ? 'Submitting...' : 'Submit Admission'}</button>
        {submitted && <div style={{ color: 'green', marginTop: 10 }}>Form submitted successfully!</div>}
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>
      {/* Preview Modal */}
      {/* This section is no longer needed as we are not previewing text directly from SAS URL */}
      {/* but from the Essay field which is a string. */}
      {/* Keeping it for now as it might be used elsewhere or for future text preview. */}
    </div>
  );
};

export default NewAdmissionForm; 