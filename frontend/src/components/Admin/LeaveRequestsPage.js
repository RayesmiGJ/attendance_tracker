import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function LeaveRequestsPage({ user }) {
  const navigate = useNavigate();
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchPendingLeaves = async () => {
    try {
      const response = await api.get('/admin/leave-requests/');
      setPendingLeaves(response.data);
    } catch (err) {
      console.error('Failed to fetch pending leaves', err);
      setError('Could not load pending leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const handleLeaveAction = async (leaveId, action) => {
    setActionLoading(leaveId);
    try {
      await api.post(`/admin/leave-action/${leaveId}/`, { action });
      fetchPendingLeaves();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} leave request`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/admin')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
        <h2 style={styles.title}>Leave Requests</h2>
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>Loading pending leaves...</div>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : pendingLeaves.length === 0 ? (
          <div style={styles.noRequests}>No pending leave requests.</div>
        ) : (
          <div style={styles.requestsList}>
            {pendingLeaves.map((leave) => (
              <div key={leave.id} style={styles.requestCard}>
                <div style={styles.requestHeader}>
                  <strong>{leave.user_name}</strong> - {leave.get_leave_type_display}
                  <span style={styles.requestDate}>{formatDate(leave.date)}</span>
                </div>
                <div style={styles.requestReason}>Reason: {leave.reason}</div>
                <div style={styles.requestApplied}>
                  Applied on: {formatDateTime(leave.created_at)}
                </div>
                <div style={styles.requestActions}>
                  <button
                    onClick={() => handleLeaveAction(leave.id, 'approve')}
                    disabled={actionLoading === leave.id}
                    style={styles.approveButton}
                  >
                    {actionLoading === leave.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleLeaveAction(leave.id, 'reject')}
                    disabled={actionLoading === leave.id}
                    style={styles.rejectButton}
                  >
                    {actionLoading === leave.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    backgroundColor: 'var(--moss-dark)',
    padding: '20px 30px',
    borderRadius: '12px',
    color: 'white',
  },
  backButton: {
    backgroundColor: 'var(--moss-pale)',
    color: 'var(--moss-dark)',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 500,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    border: '2px solid var(--moss-green)',
  },
  loading: {
    textAlign: 'center',
    padding: '30px',
    color: 'var(--moss-dark)',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  noRequests: {
    backgroundColor: 'var(--moss-pale)',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    color: 'var(--moss-dark)',
  },
  requestsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  requestCard: {
    backgroundColor: 'var(--moss-pale)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid var(--moss-green)',
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '18px',
  },
  requestDate: {
    color: 'var(--moss-dark)',
    fontSize: '14px',
    backgroundColor: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  requestReason: {
    marginBottom: '8px',
    color: '#555',
  },
  requestApplied: {
    fontSize: '12px',
    color: '#777',
    marginBottom: '15px',
  },
  requestActions: {
    display: 'flex',
    gap: '10px',
  },
  approveButton: {
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default LeaveRequestsPage;