import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [sourceDir, setSourceDir] = useState<string>('');
  const [destinationDir, setDestinationDir] = useState<string>('');
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [rcloneVersion, setRcloneVersion] = useState<string>('rclone version loading...');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load config from persistence
    window.electronAPI.loadConfig().then((config) => {
      if (config) {
        setSourceDir(config.sourceDir || '');
        setDestinationDir(config.destinationDir || '');
        setDeleteMode(config.deleteMode || false);
      }
    });

    // Get bundled rclone version for footer
    window.electronAPI.getRcloneVersion().then(version => {
      setRcloneVersion(version);
    });

    // Setup real-time listeners for rclone
    const unbindLog = window.electronAPI.onLog((line) => {
      setLogs((prev) => [...prev, line]);
    });

    const unbindProgress = window.electronAPI.onProgress((data) => {
      setProgress(data);
    });

    const unbindEnd = window.electronAPI.onEnd((error, duration) => {
      setIsRunning(false);
      // Force 100% on end
      setProgress((prev: any) => ({ ...prev, progressPercentHuman: '100%' }));
      if (error) {
        setStatus('error');
        setLogs((prev) => [...prev, `[ERROR] ${error}`, `Final duration: ${duration}`]);
        setErrorModal({ show: true, message: error });
      } else {
        setStatus('success');
        setLogs((prev) => [...prev, `[SUCCESS] Process completed successfully.`, `Final duration: ${duration}`]);
      }
    });

    return () => {
      unbindLog();
      unbindProgress();
      unbindEnd();
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [logs]);

  const saveConfig = (cfg: { sourceDir: string; destinationDir: string; deleteMode: boolean }) => {
    window.electronAPI.saveConfig(cfg);
  };

  const resetProcessState = () => {
    setStatus('idle');
    setLogs([]);
    setProgress(null);
  };

  const handleSelectSource = async () => {
    const dir = await window.electronAPI.selectDirectory();
    if (dir) {
      setSourceDir(dir);
      saveConfig({ sourceDir: dir, destinationDir, deleteMode });
      resetProcessState();
    }
  };

  const handleSelectDest = async () => {
    const dir = await window.electronAPI.selectDirectory();
    if (dir) {
      setDestinationDir(dir);
      saveConfig({ sourceDir, destinationDir: dir, deleteMode });
      resetProcessState();
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'source' | 'destination') => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // In Electron, we can get the absolute path from the File object
      const path = window.electronAPI.getPathForFile(files[0]);
      if (type === 'source') {
        setSourceDir(path);
        saveConfig({ sourceDir: path, destinationDir, deleteMode });
      } else {
        setDestinationDir(path);
        saveConfig({ sourceDir, destinationDir: path, deleteMode });
      }
      resetProcessState();
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setStatus('running');
    setLogs(['[Main] Initializing rclone process...', `Selected Action: ${deleteMode ? 'SYNC (SYNC/DELETE)' : 'COPY'}`]);
    
    window.electronAPI.startRclone({
      sourceDir,
      destinationDir,
      delete: deleteMode
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    resetProcessState();
  };

  const handleCloseErrorModal = () => {
    setErrorModal({ show: false, message: '' });
    handleReset();
  };

  return (
    <div className="app-container">
      {/* ERROR MODAL */}
      {errorModal.show && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div style={{ color: 'var(--aws-red)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px' }}>
              Execution Error
            </div>
            <div style={{ marginBottom: '20px', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {errorModal.message}
            </div>
            <div style={{ textAlign: 'right' }}>
              <button className="aws-button aws-button-primary" onClick={handleCloseErrorModal}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 1. MANUAL SELECTORS - Hidden during processing */}
      {!isRunning && (
        <div className="manual-selectors card">
          <div className="selector-side">
            <label>source directory</label>
            <div 
              className="dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.currentTarget.classList.add('active')}
              onDragLeave={(e) => e.currentTarget.classList.remove('active')}
              onDrop={(e) => {
                e.currentTarget.classList.remove('active');
                handleDrop(e, 'source');
              }}
              onClick={handleSelectSource}
            >
              Drag & Drop Source Folder <br/> or Click to Select
            </div>
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <button className="aws-button aws-button-secondary" onClick={handleSelectSource}>
                Select Directory Manually
              </button>
            </div>
          </div>
          <div className="selector-side">
            <label>destination directory</label>
            <div 
              className="dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.currentTarget.classList.add('active')}
              onDragLeave={(e) => e.currentTarget.classList.remove('active')}
              onDrop={(e) => {
                e.currentTarget.classList.remove('active');
                handleDrop(e, 'destination');
              }}
              onClick={handleSelectDest}
            >
              Drag & Drop Destination Folder <br/> or Click to Select
            </div>
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <button className="aws-button aws-button-secondary" onClick={handleSelectDest}>
                Select Directory Manually
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PATH DISPLAY - Always visible, compact during processing */}
      <div className={`path-display-section card ${isRunning ? 'compact' : ''}`}>
        <div className="path-line">
          <div className="path-label">source</div>
          <div className="path-value" title={sourceDir}>{sourceDir || 'Not selected'}</div>
          <button 
            className="aws-button aws-button-secondary"
            onClick={() => window.electronAPI.revealPath(sourceDir)}
            disabled={!sourceDir}
          >
            Show in Finder
          </button>
        </div>
        <div className="path-line">
          <div className="path-label">destination</div>
          <div className="path-value" title={destinationDir}>{destinationDir || 'Not selected'}</div>
          <button 
            className="aws-button aws-button-secondary"
            onClick={() => window.electronAPI.revealPath(destinationDir)}
            disabled={!destinationDir}
          >
            Show in Finder
          </button>
        </div>
      </div>

      {/* 3. DELETE MODE */}
      {!isRunning && (
        <div className="delete-mode-section card">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700 }}>
            <input 
              type="checkbox" 
              checked={deleteMode} 
              onChange={(e) => {
                const val = e.target.checked;
                setDeleteMode(val);
                saveConfig({ sourceDir, destinationDir, deleteMode: val });
              }}
            />
            Enable 'Delete' mode (Caution: will sync/mirror and delete extra files in destination)
          </label>
          {deleteMode && (
            <div className="warning-box">
              <strong>WARNING:</strong> In sync mode, files in the destination that are not present in the source will be deleted. 
              This operation is destructive and cannot be undone. Use with extreme caution.
            </div>
          )}
        </div>
      )}

      {/* 4. PROGRESS BAR */}
      <div className="progress-section card">
        {!status.includes('idle') && status !== 'running' && (
          <div style={{ marginBottom: '10px', fontWeight: 700, color: status === 'success' ? 'var(--aws-green)' : 'var(--aws-red)' }}>
            {status === 'success' ? '✔ Synchronization completed successfully.' : '✘ Synchronization failed.'}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isRunning && <div className="spinner"></div>}
          <div className="progress-bar-container" style={{ flex: 1 }}>
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${parseInt(progress?.progressPercentHuman || '0', 10)}%`,
                backgroundColor: status === 'error' ? 'var(--aws-red)' : 'var(--aws-blue)'
              }}
            ></div>
          </div>
        </div>
        <div className="progress-stats">
          <div>Progress: {progress?.progressPercentHuman || '0%'} complete</div>
          <div>
            {isRunning ? (
              progress ? 
                `Estimated Remaining Time: ${progress.estimatedRemainingTimeHuman} (Total elapsed: ${progress.totalTimePassedHuman})` : 
                'Initializing rclone...'
            ) : (
              status === 'idle' ? 'Ready to start' : `Process finished. Total duration: ${progress?.totalTimePassedHuman || 'unknown'}`
            )}
          </div>
        </div>
        
        <div className="start-btn-container">
          {isRunning ? (
            <button className="aws-button aws-button-secondary" disabled>
              RUNNING...
            </button>
          ) : (
            <>
              {status !== 'idle' && (
                <button className="aws-button aws-button-secondary" onClick={handleReset} style={{ marginRight: '10px' }}>
                  RESET
                </button>
              )}
              <button 
                className="aws-button aws-button-primary"
                disabled={!sourceDir || !destinationDir}
                onClick={handleStart}
              >
                {deleteMode ? 'START SYNC' : 'START COPY'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 5. LOGS */}
      <div className="logs-section">
        {logs.length === 0 ? (
          <div style={{ color: '#879596', fontStyle: 'italic', padding: '10px' }}>
            Operation logs will appear here once the process starts...
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="log-line">{log}</div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-left">
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); window.electronAPI.openExternal('https://rclone.org'); }}>
            {rcloneVersion}
          </a>
        </div>
        <div className="footer-right">
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); window.electronAPI.openExternal('https://github.com/stopsopa/LaymanSync'); }}>
            https://github.com/stopsopa/LaymanSync
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
