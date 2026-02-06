import React, { useEffect, useRef } from 'react';
import './LogViewer.css';

interface LogViewerProps {
  logs: string[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="log-viewer">
      <div className="log-header">
        <span className="log-title">Process Log</span>
        <span className="log-count">{logs.length} lines</span>
      </div>
      <div className="log-content">
        {logs.map((log, index) => (
          <div key={index} className="log-line">
            <span className="log-line-number">{index + 1}</span>
            <span className="log-line-text">{log}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default LogViewer;
