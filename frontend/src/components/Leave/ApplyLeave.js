import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function ApplyLeave({ user }) {
  const [leaveType, setLeaveType] = useState('single'); 
  const [formData, setFormData] = useState({
    leave_type: 'SL',
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
      
      setFormData({ 
        leave_type: 'SL', 
        date: '', 
        from_date: '', 
        to_date: '', 
        reason: '' 
      });
      setTimeout(() => {setSuccess(false);setSuccessMessage('');}, 3000);
      
    } catch (err) {
      console.error('Leave application error:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to apply leave');
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
          <div style={styles.success}>{successMessage}</div>
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
            >
              <option value="SL">Sick Leave</option>
              <option value="PL">Paid Leave</option>
              <option value="CL">Casual Leave</option>
            </select>
          </div>
          
          <div style={styles.toggleGroup}>
            <button type="button" onClick={() => {
                setLeaveType('single');
                setError(''); 
              }}
              style={{
                ...styles.toggleButton,
                ...(leaveType === 'single' ? styles.toggleButtonActive : {})
              }}
            >
              Single Day
            </button>
            <button type="button" onClick={() => {
                setLeaveType('range');
                setError(''); 
              }}
              style={{
                ...styles.toggleButton,
                ...(leaveType === 'range' ? styles.toggleButtonActive : {})
              }}
            >
              Multiple Days
            </button>
          </div>
          
          {leaveType === 'single' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Date:</label>
              <input type="date"  name="date"  value={formData.date}  onChange={handleChange}  min={today}  style={styles.input} required
              />
            </div>
          )}
          
          {leaveType === 'range' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>From Date:</label>
                <input type="date"  name="from_date"  value={formData.from_date}  onChange={handleChange}  min={today} style={styles.input}  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>To Date:</label>
                <input  type="date" name="to_date"  value={formData.to_date}  onChange={handleChange}  min={formData.from_date || today}  style={styles.input}  required
                />
              </div>
            </>
          )}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Reason:</label>
            <textarea  name="reason"  value={formData.reason}  onChange={handleChange}  rows="3"  style={styles.textarea}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={submitting}
            style={styles.submitButton}
          >
            {submitting ? 'Applying...' : 'Apply Leave'}
          </button>
        </form>
        
        <button onClick={handleBack} style={styles.backButton}>Back to Dashboard</button>
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
    transition: '0.2s',
  },
  toggleButtonActive: {
    backgroundColor: 'var(--moss-green)',
    color: 'white',
    borderColor: 'var(--moss-dark)',
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