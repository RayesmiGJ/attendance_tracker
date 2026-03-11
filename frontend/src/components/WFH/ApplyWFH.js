import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function ApplyWFH({ user }) {
  const [formData, setFormData] = useState({
    from_date: '',
    to_date: ''
  });
  const [success, setSuccess] = useState(false);
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
    
    try {
      await api.post('/wfh/', formData);
      setSuccess(true);
      setFormData({ from_date: '', to_date: '' });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply WFH');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (user.is_superuser) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Apply Work From Home</h2>
        
        {success && (
          <div style={styles.success}> WFH applied successfully!</div>
        )}
        
        {error && (
          <div style={styles.error}> {error}</div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
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
            />
          </div>
          
          <button 
            type="submit" 
            disabled={submitting}
            style={styles.submitButton}
            
          >
            {submitting ? 'Applying...' : 'Apply'}
          </button>
        </form>
        
        <button onClick={handleBack} style={styles.backButton}>Back</button>
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
    width: '350px',
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

export default ApplyWFH;