import React from 'react';
import ApplicantList from './ApplicantList';
import { useNotification } from '../contexts/NotificationContext';
import { useApplicantData } from '../contexts/ApplicantDataContext';

// Backend API endpoint for approval/denial
const APPROVAL_API_URL = 'https://simbagetaddapproval-hcf5cffbcccmgsbn.westus-01.azurewebsites.net/api/add-approval';


interface ActionWithReason {
  partitionKey: string;
  rowKey: string;
  newStatus: 'Approved' | 'Pending' | 'Denied';
  adminEmail?: string;
  reason?: string;
}

const ApplicantListWithAction: React.FC = () => {
  const { addNotification } = useNotification();
  const { refetchApplicants, fetchAllApplicantDetails, applicants } = useApplicantData();

  // Enhanced approve/deny handler with reason
  const handleAction = async (
    partitionKey: string,
    rowKey: string,
    newStatus: 'Approved' | 'Pending' | 'Denied',
    adminEmail?: string,
    reason?: string
  ) => {
    try {
      const response = await fetch(APPROVAL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partitionKey,
          rowKey,
          email: adminEmail,
          action: newStatus === 'Denied' ? 'deny' : 'approve',
          reason: reason || '',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        addNotification(
          data.message || `Application ${newStatus.toLowerCase()} successfully!`,
          'success'
        );
        // Force refresh applicants and their details so the table updates
        await refetchApplicants(true);
        if (applicants.length > 0) {
          await fetchAllApplicantDetails(applicants, true);
        }
      } else {
        addNotification(data.error || data.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      addNotification('Network error. Please try again.', 'error');
    }
  };

  // Pass the enhanced handler to ApplicantList
  return <ApplicantList onAction={handleAction} />;
};

export default ApplicantListWithAction;
