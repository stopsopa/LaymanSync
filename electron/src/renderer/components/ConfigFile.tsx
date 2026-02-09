import type { FC } from "react";
import DropzoneFile from "./DropzoneFile";
import "./ConfigFile.css";

interface ConfigFileProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onNext: () => void;
}

const ConfigFile: FC<ConfigFileProps> = ({ value, onChange, onNext }) => {
  const handleExistingFileChange = (path: string) => {
    if (path.toLowerCase().endsWith(".json")) {
      onChange(path);
    }
  };

  const handleCreateNew = async () => {
    try {
      const path = await window.electronAPI.saveFile({
        title: "Create New Configuration",
        defaultPath: "layman-sync-config.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (path) {
        onChange(path);
      }
    } catch (err) {
      console.error("Error creating new config file:", err);
    }
  };

  return (
    <div className="config-file-container">
      <div className="config-file-section section-top">
        <h4 className="config-section-title">Select Existing Configuration</h4>
        <DropzoneFile onChange={handleExistingFileChange} className="config-action-dropzone">
          <div className="config-action-trigger">
            <svg className="button-icon" viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: "8px" }}>
              <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
            </svg>
            Click to select .json config file or drag and drop it here
          </div>
        </DropzoneFile>
      </div>

      <div className="config-file-divider">
        <span>OR</span>
      </div>

      <div className="config-file-section section-bottom">
        <h4 className="config-section-title">Create New Configuration</h4>
        <div className="create-new-action">
          <button type="button" className="config-action-trigger create-new-button" onClick={handleCreateNew}>
            <svg className="button-icon" viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: "8px" }}>
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Choose name and location for new .json config
          </button>
          <p className="create-new-hint">
            This will open a native OS dialog to let you pick where to save your new configuration file.
          </p>
        </div>
      </div>

      {value && value.toLowerCase().endsWith(".json") && (
        <div className="selected-config-display">
          <div className="selected-config-info-row">
            <span className="selected-label">Active Configuration:</span>
            <code className="selected-path">{value}</code>
          </div>
          <div className="selected-config-actions">
            <button type="button" className="aws-button aws-button-primary next-step-button" onClick={onNext}>
              Next Step (Execute)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigFile;
