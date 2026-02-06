import { useState } from 'react';
import './App.css';
import DirectorySelector from './components/DirectorySelector';
import DirectoryDisplay from './components/DirectoryDisplay';
import DeleteModeToggle from './components/DeleteModeToggle';
import SyncProgress from './components/SyncProgress';
import LogViewer from './components/LogViewer';
import Footer from './components/Footer';

interface ProgressData {
  progressPercentHuman: string;
  totalTimePassedHuman: string;
  estimatedTotalTimeHuman: string;
  estimatedRemainingTimeHuman: string;
}

function App() {
  const [sourceDir, setSourceDir] = useState<string | null>(null);
  const [destinationDir, setDestinationDir] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [completionStatus, setCompletionStatus] = useState<'success' | 'error' | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionDuration, setCompletionDuration] = useState<string | null>(null);

  const resetState = () => {
    setProgress(null);
    setLogs([]);
    setCompletionStatus(null);
    setCompletionMessage(null);
    setCompletionDuration(null);
  };

  const handleSourceDrop = (path: string) => {
    if (isProcessing) return;
    resetState();
    setSourceDir(path);
  };

  const handleDestinationDrop = (path: string) => {
    if (isProcessing) return;
    resetState();
    setDestinationDir(path);
  };

  const handleDeleteModeChange = (enabled: boolean) => {
    if (isProcessing) return;
    setDeleteMode(enabled);
  };

  const handleShowInFinder = (path: string) => {
    window.electronAPI.revealDirectory(path);
  };

  const handleStart = async () => {
    if (!sourceDir || !destinationDir) return;

    resetState();
    setIsProcessing(true);

    // TODO: Phase 4 - Implement actual driveCompression call
    // For now, simulate the process with mock logs and progress
    const mockLogs = [
      `Starting ${deleteMode ? 'sync' : 'copy'} operation...`,
      `Source: ${sourceDir}`,
      `Destination: ${destinationDir}`,
      `Mode: ${deleteMode ? 'rclone sync (with delete)' : 'rclone copy'}`,
      'Scanning source directory...',
      'Calculating total size...',
      'Starting transfer...',
    ];

    // Add initial logs
    mockLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, index * 200);
    });

    // Simulate progress updates
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setProgress({
          progressPercentHuman: `${currentProgress}%`,
          totalTimePassedHuman: `${Math.floor(currentProgress / 20)}s`,
          estimatedTotalTimeHuman: `${Math.floor(100 / 20)}s`,
          estimatedRemainingTimeHuman: `${Math.floor((100 - currentProgress) / 20)}s`,
        });
        setLogs(prev => [...prev, `Progress: ${currentProgress}%`]);
      }
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setLogs(prev => [...prev, 'Transfer complete!']);
          setCompletionStatus('success');
          setCompletionDuration('5s');
          setIsProcessing(false);
        }, 500);
      }
    }, 500);
  };

  const canStart = !isProcessing && sourceDir !== null && destinationDir !== null;

  return (
    <div className="app-container">
      <div className="app-content">
        {/* Section 1: Manual Selectors */}
        {!isProcessing && (
          <div className="manual-selectors">
            <DirectorySelector
              label="source directory"
              path={sourceDir}
              onDrop={handleSourceDrop}
              disabled={isProcessing}
            />
            <DirectorySelector
              label="destination directory"
              path={destinationDir}
              onDrop={handleDestinationDrop}
              disabled={isProcessing}
            />
          </div>
        )}

        {/* Section 2: Directory Display */}
        <DirectoryDisplay
          sourceDir={sourceDir}
          destinationDir={destinationDir}
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
          completionMessage={completionMessage}
          completionDuration={completionDuration}
        />

        {/* Section 5: Log Viewer */}
        <LogViewer logs={logs} />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
