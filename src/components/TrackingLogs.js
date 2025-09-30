import React, { useState, useEffect } from 'react';

function TrackingLogs() {
  const [logs, setLogs] = useState([]);

  // Override console.log to capture tracking logs
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      if (args[0] && (args[0].startsWith('TRACKING:') || args[0].startsWith('AUDIT:') || args[0].startsWith('NOTIFICATION:'))) {
        setLogs(prev => [...prev, { message: args.join(' '), timestamp: new Date().toLocaleString() }]);
      }
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  return (
    <div>
      <h2>Tracking Logs</h2>
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
        {logs.length === 0 ? (
          <p>No tracking events yet. Perform actions like creating tasks, logging in, etc.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px', fontFamily: 'monospace' }}>
              <strong>{log.timestamp}:</strong> {log.message}
            </div>
          ))
        )}
      </div>
      <button onClick={() => setLogs([])} style={{ marginTop: '10px' }}>Clear Logs</button>
    </div>
  );
}

export default TrackingLogs;