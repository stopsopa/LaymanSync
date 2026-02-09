import React from 'react';
import './DirectoryDisplay.css';

interface DirectoryDisplayProps {
  source: string | null;
  target: string | null;
  onShowInFinder: (path: string) => void;
}

const DirectoryDisplay: React.FC<DirectoryDisplayProps> = ({
  source,
  target,
  onShowInFinder
}) => {
  if (!source && !target) {
    return null;
  }

  return (
    <div className="directory-display">
      {source && (
        <div className="directory-row">
          <span className="directory-row-label">Source Directory:</span>
          <span className="directory-row-path" title={source}>{source}</span>
          <button
            className="show-finder-button"
            onClick={() => onShowInFinder(source)}
          >
            Show in Finder
          </button>
        </div>
      )}
      
      {target && (
        <div className="directory-row">
          <span className="directory-row-label">Destination Directory:</span>
          <span className="directory-row-path" title={target}>{target}</span>
          <button
            className="show-finder-button"
            onClick={() => onShowInFinder(target)}
          >
            Show in Finder
          </button>
        </div>
      )}
    </div>
  );
};

export default DirectoryDisplay;
