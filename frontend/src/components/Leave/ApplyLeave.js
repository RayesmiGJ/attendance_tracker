import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function ApplyLeave({ user }) {
  const [leaveType, setLeaveType] = useState('single'); 
  const [formData, setFormData] = useState({
    leave_type: '', 
    date: '',
    from_date: '',
    to_date: '',
    reason: ''
  });
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    if (!formData.leave_type) {
      setError('Please select a leave type');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess(false);
    
    try {
      const leaveData = {
        leave_type: formData.leave_type,
        reason: formData.reason
      };

      if (leaveType === 'single') {
        if (!formData.date) {
          setError('Please select a date');
          setSubmitting(false);
          return;
        }
        leaveData.date = formData.date;
      } else {
        if (!formData.from_date || !formData.to_date) {
          setError('Please select both from and to dates');
          setSubmitting(false);
          return;
        }
        
        if (new Date(formData.from_date) > new Date(formData.to_date)) {
          setError('From date cannot be after to date');
          setSubmitting(false);
          return;
        }
        
        leaveData.from_date = formData.from_date;
        leaveData.to_date = formData.to_date;
      }
      
      const response = await api.post('/leave/', leaveData);
      
      if (response.data.message) {
        setSuccessMessage(response.data.message);
      } else {
        setSuccessMessage('Leave applied successfully!');
      }
      
      setSuccess(true);
      
      setTimeout(() => {
        setFormData({ 
          leave_type: '',
          date: '', 
          from_date: '', 
          to_date: '', 
          reason: '' 
        });
        setLeaveType('single');
      }, 100);
      
      setTimeout(() => {
        if (user.is_admin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 2000);
      
    } catch (err) {
      console.error('Leave application error:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Invalid request. Please check your input.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your connection.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to apply leave. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (user.is_admin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Apply Leave</h2>
        
        {success && (
          <div style={styles.success}>
            {successMessage}
            <div style={styles.redirect}>Redirecting to dashboard...</div>
          </div>
        )}
        
        {error && (
          <div style={styles.error}>{error}</div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Leave Type:</label>
            <select 
              name="leave_type" 
              value={formData.leave_type}
              onChange={handleChange}
              style={styles.select}
              required
              disabled={success || submitting}
            >
              <option value="" disabled>Select Leave Type</option>
              <option value="SL">Sick Leave</option>
              <option value="PL">Paid Leave</option>
              <option value="CL">Casual Leave</option>
            </select>
          </div>
          
          <div style={styles.toggleGroup}>
            <button 
              type="button" 
              onClick={() => {
                setLeaveType('single');
                setError(''); 
              }}
              disabled={success || submitting}
              style={{
                ...styles.toggleButton,
                ...(leaveType === 'single' ? styles.toggleButtonActive : {}),
                ...((success || submitting) ? styles.disabledToggleButton : {})
              }}
            >
              Single Day
            </button>
            <button 
              type="button" 
              onClick={() => {
                setLeaveType('range');
                setError(''); 
              }}
              disabled={success || submitting}
              style={{
                ...styles.toggleButton,
                ...(leaveType === 'range' ? styles.toggleButtonActive : {}),
                ...((success || submitting) ? styles.disabledToggleButton : {})
              }}
            >
              Multiple Days
            </button>
          </div>
          
          {leaveType === 'single' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Date:</label>
              <input 
                type="date"  
                name="date"  
                value={formData.date}  
                onChange={handleChange}  
                min={today}  
                style={styles.input} 
                required
                disabled={success || submitting}
              />
            </div>
          )}
          
          {leaveType === 'range' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>From Date:</label>
                <input 
                  type="date"  
                  name="from_date"  
                  value={formData.from_date}  
                  onChange={handleChange}  
                  min={today} 
                  style={styles.input}  
                  required
                  disabled={success || submitting}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>To Date:</label>
                <input  
                  type="date" 
                  name="to_date"  
                  value={formData.to_date}  
                  onChange={handleChange}  
                  min={formData.from_date || today}  
                  style={styles.input}  
                  required
                  disabled={success || submitting}
                />
              </div>
            </>
          )}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Reason:</label>
            <textarea  
              name="reason"  
              value={formData.reason}  
              onChange={handleChange}  
              rows="3"  
              style={styles.textarea}
              required
              disabled={success || submitting}
              placeholder="Enter reason for leave..."
            />
          </div>
          
          <button 
            type="submit" 
            disabled={submitting || success}
            style={submitting || success ? styles.disabledButton : styles.submitButton}
          >
            {submitting ? 'Applying...' : success ? 'Applied ✓' : 'Apply Leave'}
          </button>
        </form>
        
        <button 
          onClick={handleBack} 
          style={styles.backButton}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  card: {
    background: 'white',
    padding: '35px',
    borderRadius: '16px',
    width: '400px',
    maxWidth: '100%',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    border: '2px solid var(--moss-green)',
  },
  title: {
    color: 'var(--moss-dark)',
    fontSize: '28px',
    marginTop: 0,
    marginBottom: '25px',
    textAlign: 'center',
    fontWeight: 500,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: 'var(--moss-dark)',
    fontSize: '16px',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid var(--moss-light)',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'Times New Roman, Times, serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid var(--moss-light)',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'Times New Roman, Times, serif',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid var(--moss-light)',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'Times New Roman, Times, serif',
    boxSizing: 'border-box',
    resize: 'vertical',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  toggleGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  toggleButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'white',
    color: 'var(--moss-dark)',
    border: '2px solid var(--moss-light)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'Times New Roman, Times, serif',
    transition: 'all 0.2s',
    fontWeight: 500,
  },
  toggleButtonActive: {
    backgroundColor: 'var(--moss-green)',
    color: 'white',
    borderColor: 'var(--moss-dark)',
  },
  disabledToggleButton: {
    backgroundColor: '#f0f0f0',
    color: '#999',
    borderColor: '#ddd',
    cursor: 'not-allowed',
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    margin: '15px 0 8px',
    backgroundColor: 'var(--moss-green)',
    color: 'white',
    border: '1px solid var(--moss-dark)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: 'Times New Roman, Times, serif',
    transition: 'background-color 0.2s',
    fontWeight: 500,
  },
  disabledButton: {
    width: '100%',
    padding: '12px',
    margin: '15px 0 8px',
    backgroundColor: '#cccccc',
    color: '#666666',
    border: '1px solid #999999',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'Times New Roman, Times, serif',
    cursor: 'not-allowed',
  },
  backButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'var(--moss-pale)',
    color: 'var(--moss-dark)',
    border: '1px solid var(--moss-green)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: 'Times New Roman, Times, serif',
    marginTop: '5px',
    transition: 'background-color 0.2s',
    fontWeight: 500,
  },
  success: {
    backgroundColor: 'var(--moss-pale)',
    color: 'var(--moss-dark)',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '2px solid var(--moss-green)',
  },
  redirect: {
    fontSize: '14px',
    marginTop: '5px',
    color: 'var(--moss-green)',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '2px solid #f5c6cb',
  },
};


export default ApplyLeave;