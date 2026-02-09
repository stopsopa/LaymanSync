import { useState, useEffect } from 'react';
import DirectorySelector from './DirectorySelector';
import DirectoryDisplay from './DirectoryDisplay';
import DeleteModeToggle from './DeleteModeToggle';
import SyncProgress from './SyncProgress';
import LogViewer from './LogViewer';
import StatusModal from './StatusModal';

interface ProgressData {
  progressPercentHuman: string;
  totalTimePassedHuman: string;
  estimatedTotalTimeHuman: string;
  estimatedRemainingTimeHuman: string;
}

function PreviousComponent() {
  const [source, setSource] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [completionStatus, setCompletionStatus] = useState<'success' | 'error' | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionDuration, setCompletionDuration] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Set up IPC event listeners
  useEffect(() => {
    const unsubProgress = window.electronAPI.onSyncProgress((data: ProgressData) => {
      setProgress(data);
    });

    const unsubLog = window.electronAPI.onSyncLog((line: string) => {
      setLogs(prev => [...prev, line]);
    });

    const unsubEnd = window.electronAPI.onSyncEnd((result: { error: string | null; duration: string }) => {
      setCompletionDuration(result.duration);
      if (result.error) {
        setCompletionStatus('error');
        setCompletionMessage(result.error);
      } else {
        setCompletionStatus('success');
        setCompletionMessage(`The ${deleteMode ? 'sync' : 'copy'} operation completed successfully.`);
      }
      setShowStatusModal(true);
      setIsProcessing(false);
    });

    return () => {
      unsubProgress();
      unsubLog();
      unsubEnd();
    };
  }, [deleteMode]);

  const resetState = () => {
    setProgress(null);
    setLogs([]);
    setCompletionStatus(null);
    setCompletionMessage(null);
    setCompletionDuration(null);
    setShowStatusModal(false);
  };

  const handleSourceDrop = (path: string) => {
    if (isProcessing) return;
    resetState();
    setSource(path);
  };

  const handleDestinationDrop = (path: string) => {
    if (isProcessing) return;
    resetState();
    setTarget(path);
  };

  const handleDeleteModeChange = (enabled: boolean) => {
    if (isProcessing) return;
    setDeleteMode(enabled);
  };

  const handleShowInFinder = (path: string) => {
    window.electronAPI.revealDirectory(path);
  };

  const handleStart = async () => {
    if (!source || !target) return;

    resetState();
    setIsProcessing(true);

    // Start the actual rclone operation via IPC
    window.electronAPI.startSync({
      source,
      target,
      deleteMode,
    });
  };

  const canStart = !isProcessing && source !== null && target !== null;

  return (
    <div className="previous-component-container">
      <div className="app-content">
        {/* Section 1: Manual Selectors */}
        {!isProcessing && (
          <div className="manual-selectors">
            <DirectorySelector
              label="source directory"
              path={source}
              onDrop={handleSourceDrop}
              disabled={isProcessing}
            />
            <DirectorySelector
              label="destination directory"
              path={target}
              onDrop={handleDestinationDrop}
              disabled={isProcessing}
            />
          </div>
        )}

        {/* Section 2: Directory Display */}
        <DirectoryDisplay
          source={source}
          target={target}
          onShowInFinder={handleShowInFinder}
        />

        {/* Section 3: Delete Mode Toggle */}
        <DeleteModeToggle
          deleteMode={deleteMode}
          onChange={handleDeleteModeChange}
          disabled={isProcessing}
        />

        {/* Section 4: Progress Bar and Start Button */}
        <SyncProgress
          isProcessing={isProcessing}
          deleteMode={deleteMode}
          progress={progress}
          onStart={handleStart}
          canStart={canStart}
          completionStatus={completionStatus}
          completionDuration={completionDuration}
        />

        {/* Section 5: Log Viewer */}
        <LogViewer logs={logs} />
      </div>

      {/* Status Modal (Success or Error) */}
      {showStatusModal && completionStatus && completionMessage && (
        <StatusModal
          type={completionStatus}
          title={completionStatus === 'success' ? 'Completed Successfully' : 'Operation Failed'}
          message={completionMessage}
          duration={completionDuration || undefined}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
}

export default PreviousComponent;
