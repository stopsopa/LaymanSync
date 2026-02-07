import React from 'react';
import './DeleteModeToggle.css';

interface DeleteModeToggleProps {
  deleteMode: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const DeleteModeToggle: React.FC<DeleteModeToggleProps> = ({
  deleteMode,
  onChange,
  disabled = false
}) => {
  return (
    <div className="delete-mode-toggle">
      <div className="toggle-header">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={deleteMode}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="toggle-checkbox"
          />
          <span className="toggle-text">Enable Sync Mode (Delete)</span>
        </label>
      </div>

      {deleteMode && (
        <div className="warning-box">
          <div className="warning-header">
            <svg className="warning-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <span className="warning-title">Warning: Destructive Operation</span>
          </div>
          <div className="warning-content">
            <p>
              <strong>rclone sync</strong> makes destination <strong>identical</strong> to source by copying changes and <strong>deleting</strong> files in destination that don't exist in source.
            </p>
            <p className="warning-emphasis">
              ⚠️ Files unique to destination will be permanently deleted!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteModeToggle;
