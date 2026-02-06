import React from 'react';
import './DirectoryDisplay.css';

interface DirectoryDisplayProps {
  sourceDir: string | null;
  destinationDir: string | null;
  onShowInFinder: (path: string) => void;
}

const DirectoryDisplay: React.FC<DirectoryDisplayProps> = ({
  sourceDir,
  destinationDir,
  onShowInFinder
}) => {
  if (!sourceDir && !destinationDir) {
    return null;
  }

  return (
    <div className="directory-display">
      {sourceDir && (
        <div className="directory-row">
          <span className="directory-row-label">Source Directory:</span>
          <span className="directory-row-path" title={sourceDir}>{sourceDir}</span>
          <button
            className="show-finder-button"
            onClick={() => onShowInFinder(sourceDir)}
          >
            Show in Finder
          </button>
        </div>
      )}
      
      {destinationDir && (
        <div className="directory-row">
          <span className="directory-row-label">Destination Directory:</span>
          <span className="directory-row-path" title={destinationDir}>{destinationDir}</span>
          <button
            className="show-finder-button"
            onClick={() => onShowInFinder(destinationDir)}
          >
            Show in Finder
          </button>
        </div>
      )}
    </div>
  );
};

export default DirectoryDisplay;
