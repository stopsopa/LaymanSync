import React from 'react';
import './SyncProgress.css';

interface ProgressData {
  progressPercentHuman: string;
  totalTimePassedHuman: string;
  estimatedTotalTimeHuman: string;
  estimatedRemainingTimeHuman: string;
}

interface SyncProgressProps {
  isProcessing: boolean;
  deleteMode: boolean;
  progress: ProgressData | null;
  onStart: () => void;
  canStart: boolean;
  completionStatus: 'success' | 'error' | null;
  completionDuration: string | null;
}

const SyncProgress: React.FC<SyncProgressProps> = ({
  isProcessing,
  deleteMode,
  progress,
  onStart,
  canStart,
  completionStatus,
  completionDuration
}) => {
  const progressPercent = progress 
    ? parseInt(progress.progressPercentHuman.replace('%', ''), 10) 
    : 0;

  return (
    <div className="sync-progress">
      {!isProcessing && !completionStatus && (
        <>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }} />
            </div>
          </div>
          <div className="progress-actions">
            <div className="progress-stats empty">Ready to start</div>
            <button
              className={`start-button ${deleteMode ? 'sync-mode' : 'copy-mode'}`}
              onClick={onStart}
              disabled={!canStart}
            >
              {deleteMode ? 'Start Sync' : 'Start Copy'}
            </button>
          </div>
        </>
      )}

      {isProcessing && (
        <>
          <div className="progress-bar-container">
            <div className="spinner-container">
              <div className="spinner" />
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill active" 
                style={{ width: `${progressPercent}%` }} 
              />
              <div className="progress-text">{progressPercent}%</div>
            </div>
          </div>
          <div className="progress-stats">
            {progress && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Progress:</span>
                  <span className="stat-value">{progress.progressPercentHuman}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Time Elapsed:</span>
                  <span className="stat-value">{progress.totalTimePassedHuman}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Estimated Total:</span>
                  <span className="stat-value">{progress.estimatedTotalTimeHuman}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Estimated Remaining Time:</span>
                  <span className="stat-value">{progress.estimatedRemainingTimeHuman}</span>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {completionStatus && (
        <>
          <div className="progress-bar-container">
            <div className="status-icon-container">
              {completionStatus === 'success' ? (
                <svg className="status-icon success" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              ) : (
                <svg className="status-icon error" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              )}
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${completionStatus === 'success' ? 'success' : 'error'}`}
                style={{ width: '100%' }} 
              />
              <div className="progress-text">100%</div>
            </div>
          </div>
          <div className="progress-stats">
            {progress && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Progress:</span>
                  <span className="stat-value">100%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Duration:</span>
                  <span className="stat-value">{completionDuration || progress.totalTimePassedHuman}</span>
                </div>
              </>
            )}
          </div>
          <div className={`completion-box ${completionStatus}`}>
            <div className="completion-header">
              {completionStatus === 'success' ? (
                <svg className="completion-icon success" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              ) : (
                <svg className="completion-icon error" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              )}
              <span className="completion-title">
                {completionStatus === 'success' ? 'Completed Successfully' : 'Operation Failed'}
              </span>
            </div>
            <div className="completion-details">
              {completionStatus === 'success' ? (
                <p>The {deleteMode ? 'sync' : 'copy'} operation completed successfully.</p>
              ) : (
                <p>The operation failed. See details in the modal.</p>
              )}
            </div>
          </div>
          <div className="progress-actions">
            <div></div>
            <button
              className={`start-button ${deleteMode ? 'sync-mode' : 'copy-mode'}`}
              onClick={onStart}
              disabled={!canStart}
            >
              {deleteMode ? 'Start Sync Again' : 'Start Copy Again'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SyncProgress;
