import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function MarkAttendance({ user }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [markedTime, setMarkedTime] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [showRedirect, setShowRedirect] = useState(false);
  const [currentDate] = useState(() => {
    return new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      const time = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTime(time);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentIndianTime = () => {
    return new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    const checkAttendance = async () => {
      try {
        const response = await api.get('/attendance/');
        setAttendanceData(response.data);
        
        const storedMarkedTime = localStorage.getItem('attendance_marked_time');
        const storedDate = localStorage.getItem('attendance_marked_date');
        
        if (response.data.already_marked && storedMarkedTime && storedDate === currentDate) {
          setMarkedTime(storedMarkedTime);
        }
      } catch (err) {
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };   
    checkAttendance();
  }, [currentDate]);

  const handleMarkAttendance = async () => {
    setSubmitting(true);
    setError('');
    setShowRedirect(true);
    
    try {
      await api.post('/attendance/');
      
      const markingTime = getCurrentIndianTime();
      
      setMarkedTime(markingTime);
      localStorage.setItem('attendance_marked_time', markingTime);
      localStorage.setItem('attendance_marked_date', currentDate);
      
      setAttendanceData({
        ...attendanceData,
        already_marked: true,
        can_mark: false
      });
      
      setTimeout(() => {
        if (user.is_admin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
      setShowRedirect(false);
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
    if (attendanceData?.on_leave) return "You are on Leave today";
    if (attendanceData?.on_wfh) return "You are on Work From Home today";
    if (attendanceData?.already_marked) return "You have already marked attendance today";
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
          <div style={styles.dateTimeContainer}>
            <p style={styles.date}>{currentDate}</p>
            <p style={styles.time}>{currentTime}</p>
          </div>
          <div style={styles.error}>{error}</div>
          <button onClick={handleBack} style={styles.backButton}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const statusMessage = getStatusMessage();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Mark Attendance</h2>
        
        <div style={styles.dateTimeContainer}>
          <p style={styles.date}>{currentDate}</p>
          <p style={styles.time}>{currentTime}</p>
        </div>
        
        {markedTime ? (
          <div style={styles.markedTimeContainer}>
            <p style={styles.markedTimeLabel}>✓ Attendance Marked</p>
            <p style={styles.markedTimeValue}>{markedTime}</p>
            {showRedirect && (
              <p style={styles.redirectMessage}>Redirecting to dashboard...</p>
            )}
          </div>
        ) : (
          <>
            {attendanceData?.can_mark ? (
              <button 
                onClick={handleMarkAttendance} 
                disabled={submitting}
                style={submitting ? styles.disabledButton : styles.markButton}
              >
                {submitting ? 'Marking...' : 'Mark Present'}
              </button>
            ) : (
              <div style={styles.info}>
                <p style={styles.infoText}>{statusMessage || 'Cannot mark attendance'}</p>
              </div>
            )}
          </>
        )}
        <center>
        <button onClick={handleBack} style={styles.backButton}>Back to Dashboard</button>
        </center>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '100px',
    minHeight: '100vh',
  },
  card: {
    maxWidth: '400px',
    margin: '0 auto',
    background: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    border: '2px solid var(--moss-green)',
  },
  title: {
    color: 'var(--moss-dark)',
    fontSize: '28px',
    marginTop: 0,
    marginBottom: '25px',
    fontWeight: 500,
    textAlign: 'center',
    borderBottom: '2px solid var(--moss-light)',
    paddingBottom: '15px',
  },
 dateTimeContainer: {
  backgroundColor: 'var(--moss-pale)',
  padding: '15px 20px',
  borderRadius: '12px',
  marginBottom: '25px',
  border: '1px solid var(--moss-green)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '10px',
},
date: {
  fontSize: '18px',
  color: 'var(--moss-dark)',
  margin: 0,
  fontWeight: 500,
},
time: {
  fontSize: '20px',
  color: 'var(--moss-dark)',
  margin: 0,
  fontWeight: 500,
  fontFamily: 'Times New Roman, Times, serif',
  backgroundColor: 'white',
  padding: '5px 12px',
  borderRadius: '20px',
  border: '1px solid var(--moss-green)',
},
  markedTimeContainer: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: 'var(--moss-pale)',
    borderRadius: '12px',
    border: '2px solid var(--moss-green)',
  },
  markedTimeLabel: {
    fontSize: '12px',
    color: 'var(--moss-dark)',
    margin: '0 0 10px 0',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textAlign: 'center',
  },
  markedTimeValue: {
    fontSize: '20px',
    color: 'var(--moss-dark)',
    margin: '0 0 5px 0',
    fontWeight: 600,
    fontFamily: 'Times New Roman, Times, serif',
    textAlign: 'center',
  },
  redirectMessage: {
    fontSize: '14px',
    color: 'var(--moss-green)',
    margin: '10px 0 0 0',
    fontStyle: 'italic',
    textAlign: 'center',
    animation: 'pulse 1.5s infinite',
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
    width: '100%',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'var(--moss-dark)',
    },
  },
  disabledButton: {
    padding: '12px 25px',
    backgroundColor: '#cccccc',
    color: '#666666',
    border: '1px solid #999999',
    borderRadius: '8px',
    cursor: 'not-allowed',
    margin: '10px 5px',
    fontSize: '16px',
    fontFamily: 'Times New Roman, Times, serif',
    width: '100%',
  },
  backButton: {
    display: 'inline-block',
    backgroundColor: 'var(--moss-pale)',
    color: 'var(--moss-dark)',
    padding: '12px 25px',
    border: '2px solid var(--moss-green)',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontFamily: 'Times New Roman, Times, serif',
    width: '60%',
    marginTop: '10px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#d4c8b0',
    },
  },
  error: {
    color: '#a94442',
    backgroundColor: '#f2dede',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
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
    textAlign: 'center',
    border: '1px solid var(--moss-green)',
    margin: 0,
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--moss-dark)',
    fontSize: '20px',
  },
};

// Add this to your global CSS file or index.css
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);

export default MarkAttendance;