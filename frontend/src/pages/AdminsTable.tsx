import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './AdminsTable.css';

interface Admin {
  email: string;
  role: 'admin' | 'super_admin';
  created_at?: string;
  last_login?: string;
}

const AdminsTable: React.FC = () => {
  const { userEmail } = useUser();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'super_admin' | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [transferTargetEmail, setTransferTargetEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all admins from the API
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://simbamanageadmins-egambyhtfxbfhabc.westus-01.azurewebsites.net/api/read-admin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.admins) {
          setAdmins(data.admins);
          
          // Find current user's role
          const currentUser = data.admins.find((admin: Admin) => admin.email.toLowerCase() === userEmail?.toLowerCase());
          setCurrentUserRole(currentUser?.role || null);
        }
      } else {
        setError('Failed to load admins');
      }
    } catch (err) {
      setError('Network error loading admins');
    } finally {
      setLoading(false);
    }
  };

  // Create new admin
  const handleCreateAdmin = async () => {
    if (!newAdminEmail.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch('https://simbamanageadmins-egambyhtfxbfhabc.westus-01.azurewebsites.net/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requester_email: userEmail,
          new_admin_email: newAdminEmail.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowCreateModal(false);
        setNewAdminEmail('');
        fetchAdmins(); // Refresh the list
      } else {
        setError(data.error || 'Failed to create admin');
      }
    } catch (err) {
      setError('Network error creating admin');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      setActionLoading(true);
      const response = await fetch('https://simbamanageadmins-egambyhtfxbfhabc.westus-01.azurewebsites.net/api/delete-admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requester_email: userEmail,
          admin_to_delete_email: selectedAdmin.email
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowDeleteModal(false);
        setSelectedAdmin(null);
        fetchAdmins(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete admin');
      }
    } catch (err) {
      setError('Network error deleting admin');
    } finally {
      setActionLoading(false);
    }
  };

  // Transfer super admin privileges
  const handleTransferSuperAdmin = async () => {
    if (!transferTargetEmail.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch('https://simbamanageadmins-egambyhtfxbfhabc.westus-01.azurewebsites.net/api/update-admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_super_admin_email: userEmail,
          new_super_admin_email: transferTargetEmail.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowTransferModal(false);
        setTransferTargetEmail('');
        fetchAdmins(); // Refresh the list
      } else {
        setError(data.error || 'Failed to transfer super admin privileges');
      }
    } catch (err) {
      setError('Network error transferring privileges');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const isSuperAdmin = currentUserRole === 'super_admin';

  if (loading) {
    return <div className="admins-loading">Loading admins...</div>;
  }

  return (
    <div className="admins-container">
      <div className="admins-header">
        <h1>Admin Management</h1>
        <div className="admins-actions">
          <button 
            className={`btn-create ${!isSuperAdmin ? 'disabled' : ''}`}
            onClick={() => setShowCreateModal(true)}
            disabled={!isSuperAdmin}
            title={!isSuperAdmin ? 'Only super admins can create new admins' : ''}
          >
            Create Admin
          </button>
          <button 
            className={`btn-transfer ${!isSuperAdmin ? 'disabled' : ''}`}
            onClick={() => setShowTransferModal(true)}
            disabled={!isSuperAdmin}
            title={!isSuperAdmin ? 'Only super admins can transfer privileges' : ''}
          >
            Transfer Super Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      <div className="admins-table-container">
  <table className="admins-table" style={{ color: 'var(--redp-text)', background: 'var(--redp-card)' }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.email}>
                <td>{admin.email}</td>
                <td>
                  <span className={`role-badge ${admin.role}`}>
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </td>
                <td>
                  <button 
                    className={`btn-delete ${!isSuperAdmin || admin.email === userEmail ? 'disabled' : ''}`}
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setShowDeleteModal(true);
                    }}
                    disabled={!isSuperAdmin || admin.email === userEmail}
                    title={
                      !isSuperAdmin 
                        ? 'Only super admins can delete admins' 
                        : admin.email === userEmail 
                        ? 'Cannot delete your own account'
                        : ''
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {admins.length === 0 && (
          <div className="no-admins">No admins found</div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Admin</h3>
            <input
              type="email"
              placeholder="Enter admin email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="modal-input"
            />
            <div className="modal-actions">
              <button 
                onClick={handleCreateAdmin}
                disabled={actionLoading}
                className="btn-confirm"
              >
                {actionLoading ? 'Creating...' : 'Create Admin'}
              </button>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setNewAdminEmail('');
                  setError('');
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Admin Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Admin</h3>
            <p>Are you sure you want to delete admin: <strong>{selectedAdmin.email}</strong>?</p>
            <p className="warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={handleDeleteAdmin}
                disabled={actionLoading}
                className="btn-delete-confirm"
              >
                {actionLoading ? 'Deleting...' : 'Delete Admin'}
              </button>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAdmin(null);
                  setError('');
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Super Admin Modal */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Transfer Super Admin Privileges</h3>
            <p>Transfer your super admin privileges to another admin:</p>
            <input
              type="email"
              placeholder="Enter target admin email"
              value={transferTargetEmail}
              onChange={(e) => setTransferTargetEmail(e.target.value)}
              className="modal-input"
            />
            <p className="warning">You will lose super admin privileges after this action.</p>
            <div className="modal-actions">
              <button 
                onClick={handleTransferSuperAdmin}
                disabled={actionLoading}
                className="btn-transfer-confirm"
              >
                {actionLoading ? 'Transferring...' : 'Transfer Privileges'}
              </button>
              <button 
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferTargetEmail('');
                  setError('');
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsTable;
