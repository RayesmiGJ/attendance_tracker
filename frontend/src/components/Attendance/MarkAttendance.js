import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function MarkAttendance({ user }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAttendance = async () => {
      try {
        const response = await api.get('/attendance/');
        setAttendanceData(response.data);
      } catch (err) {
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };   
    checkAttendance();
  }, []);

  const handleMarkAttendance = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      await api.post('/attendance/');
      if (user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
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

  const getStatusMessage = () => {
    if (attendanceData?.on_leave) {
      return "You are on Leave today";
    }
    if (attendanceData?.on_wfh) {
      return "You are on Work From Home today";
    }
    if (attendanceData?.already_marked) {
      return "You have already marked attendance today";
    }
    return null;
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (error && !attendanceData?.can_mark) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Mark Attendance</h2>
          <p style={styles.date}>Date: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          })}</p>
          
          <div style={styles.error}>{error}</div>
          
          <button onClick={handleBack} style={styles.backButton}>Back</button>
        </div>
      </div>
    );
  }

  const statusMessage = getStatusMessage();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Mark Attendance</h2>
        <p style={styles.date}>Date: {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })}</p>
        
        {attendanceData?.can_mark ? (
          <button 
            onClick={handleMarkAttendance} 
            disabled={submitting}
            style={styles.markButton}
          >
            {submitting ? 'Marking...' : 'Mark Present'}
          </button>
        ) : (
          <div style={styles.info}>
            <p style={styles.infoText}>{statusMessage}</p>
          </div>
        )}
        
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
    padding: '40px',
    borderRadius: '16px',
    width: '350px',
    textAlign: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    border: '2px solid var(--moss-green)',
  },
  title: {
    color: 'var(--moss-dark)',
    fontSize: '28px',
    marginTop: 0,
    marginBottom: '20px',
    fontWeight: 500,
  },
  date: {
    fontSize: '18px',
    color: 'var(--moss-green)',
    backgroundColor: 'var(--moss-pale)',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '25px',
  },
  markButton: {
    padding: '12px 25px',
    backgroundColor: 'var(--moss-green)',
    color: 'white',
    border: '1px solid var(--moss-dark)',
    borderRadius: '8px',
    cursor: 'pointer',
    margin: '10px 5px',
    fontSize: '16px',
    fontFamily: 'Times New Roman, Times, serif',
    transition: '0.2s',
    width: '100%',
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  backButton: {
    padding: '12px 25px',
    backgroundColor: 'var(--moss-pale)',
    color: 'var(--moss-dark)',
    border: '1px solid var(--moss-green)',
    borderRadius: '8px',
    cursor: 'pointer',
    margin: '10px 5px',
    fontSize: '16px',
    fontFamily: 'Times New Roman, Times, serif',
    transition: '0.2s',
    width: '100%',
  },
  error: {
    color: '#a94442',
    backgroundColor: '#f2dede',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ebccd1',
  },
  info: {
    marginBottom: '20px',
  },
  infoText: {
    color: 'var(--moss-dark)',
    backgroundColor: 'var(--moss-pale)',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '16px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '20px',
    color: 'var(--moss-dark)',
  },
};

export default MarkAttendance;