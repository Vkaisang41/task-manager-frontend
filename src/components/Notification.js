import React, { useState, useEffect } from 'react';

function Notification({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose && onClose();
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const styles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    backgroundColor: type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#27ae60',
    color: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: '300px',
  };

  return (
    <div style={styles}>
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          onClose && onClose();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          marginLeft: '10px',
        }}
      >
        ×
      </button>
    </div>
  );
}

export default Notification;