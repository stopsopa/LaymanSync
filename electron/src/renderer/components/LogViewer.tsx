import React, { useEffect, useRef, useMemo } from 'react';
import './LogViewer.css';

interface LogViewerProps {
  logs: string[];
}

const LINES_PER_BLOCK = 1000;

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    logEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [logs]);

  // Split logs into blocks of 1000 lines for better performance
  const logBlocks = useMemo(() => {
    const blocks: string[][] = [];
    for (let i = 0; i < logs.length; i += LINES_PER_BLOCK) {
      blocks.push(logs.slice(i, i + LINES_PER_BLOCK));
    }
    return blocks;
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="log-viewer">
        <div className="log-header">
          <span className="log-title">Process Log</span>
          <span className="log-count">No logs yet</span>
        </div>
        <div className="log-content">
          <pre className="log-pre">Waiting for operation to start...</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="log-viewer">
      <div className="log-header">
        <span className="log-title">Process Log</span>
        <span className="log-count">{logs.length} lines</span>
      </div>
      <div className="log-content">
        {logBlocks.map((block, blockIndex) => (
          <pre key={blockIndex} className="log-pre">
            {block.join('\n')}
          </pre>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default LogViewer;
