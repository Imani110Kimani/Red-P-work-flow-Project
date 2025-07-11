import React from "react";
import "./PendingDetails.css";

// Accepts applicants as prop and filters for status === 'Pending'

interface Applicant {
  id: number;
  name: string;
  school: string;
  status: string;
  submittedOn: string;
  reason: string;
  notes: string;
}

const PendingDetails: React.FC<{ applicants: Applicant[] }> = ({ applicants }) => {
  const pending = applicants.filter(a => a.status === 'Pending');
  // Local state for editing reasons/notes
  const [edits, setEdits] = React.useState<{ [id: number]: { reason: string; notes: string } }>({});

  // Handler for editing reason/notes
  const handleEdit = (id: number, field: 'reason' | 'notes', value: string) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Handler for saving to backend (API/Azure Function)
  const handleSave = (id: number, field: 'reason' | 'notes') => {
    // TODO: Backend: Save edits[id][field] to backend for applicant with id
    // Example: await api.updatePendingReasonOrNotes(id, field, edits[id][field])
    // Optionally show a loading indicator or success message
  };

  return (
    <div className="pending-details-container" style={{maxWidth: 1100, width: '100%', margin: '2rem auto'}}>
      <h2>Pending Applications</h2>
      <div style={{overflowX: 'auto'}}>
        <table className="pending-table" style={{minWidth: 700}}>
          <thead>
            <tr>
              <th>Name</th>
              <th>School</th>
              <th>Submitted On</th>
              <th>Reason</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No pending applications.</td></tr>
            ) : (
              pending.map(applicant => (
                <tr key={applicant.id}>
                  <td>{applicant.name}</td>
                  <td>{applicant.school}</td>
                  <td>{applicant.submittedOn}</td>
                  <td>
                    {/* Editable Reason. Backend: Save onBlur or onChange as needed. */}
                    <textarea
                      value={edits[applicant.id]?.reason ?? applicant.reason}
                      onChange={e => handleEdit(applicant.id, 'reason', e.target.value)}
                      onBlur={() => handleSave(applicant.id, 'reason')}
                      rows={2}
                      style={{ width: '100%', minWidth: 120, borderRadius: 6, border: '1.5px solid #ff9800', padding: 4, fontSize: '1em', resize: 'vertical' }}
                      placeholder="Enter reason..."
                    />
                  </td>
                  <td>
                    {/* Editable Notes. Backend: Save onBlur or onChange as needed. */}
                    <textarea
                      value={edits[applicant.id]?.notes ?? applicant.notes}
                      onChange={e => handleEdit(applicant.id, 'notes', e.target.value)}
                      onBlur={() => handleSave(applicant.id, 'notes')}
                      rows={2}
                      style={{ width: '100%', minWidth: 120, borderRadius: 6, border: '1.5px solid #ff9800', padding: 4, fontSize: '1em', resize: 'vertical' }}
                      placeholder="Enter notes..."
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingDetails;
