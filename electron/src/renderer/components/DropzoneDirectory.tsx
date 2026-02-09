import React, { useState, useCallback } from "react";
import "./DropzoneDirectory.css";

interface DropzoneDirectoryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  onChange: (path: string) => void;
  disabled?: boolean;
}

const DropzoneDirectory: React.FC<DropzoneDirectoryProps> = ({
  onChange,
  children,
  disabled = false,
  className = "",
  ...rest
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showTemporaryError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const items = Array.from(e.dataTransfer.items);

      if (items.length === 0) return;

      if (items.length > 1) {
        showTemporaryError("Please drop exactly one directory.");
        return;
      }

      const item = items[0];
      const entry = item.kind === "file" ? item.webkitGetAsEntry() : null;

      if (entry && entry.isDirectory) {
        const file = item.getAsFile();
        if (file) {
          try {
            const path = await window.electronAPI.getPathForFile(file);
            if (path) {
              onChange(path);
              return;
            }
          } catch (err) {
            console.error("Error getting path for dropped item:", err);
          }
        }
      }

      showTemporaryError("This component accepts only one directory, not files.");
    },
    [disabled, onChange],
  );

  const handleClick = async () => {
    if (disabled) return;
    try {
      const path = await window.electronAPI.openDirectory();
      if (path) {
        onChange(path);
      }
    } catch (err) {
      console.error("Error opening directory picker:", err);
    }
  };

  return (
    <div
      {...rest}
      className={`custom-dropzone-directory ${isDragging ? "dragging" : ""} ${disabled ? "disabled" : ""} ${errorMessage ? "has-error" : ""} ${className}`.trim()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="dropzone-directory-inner">
        {errorMessage ? (
          <div className="dropzone-error-message">{errorMessage}</div>
        ) : (
          children || (
            <div className="default-dropzone-directory-content">
              <svg className="dropzone-directory-icon" viewBox="0 0 24 24" width="48" height="48">
                <path
                  fill="currentColor"
                  d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                />
              </svg>
              <p>Click or drag directory here</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DropzoneDirectory;
