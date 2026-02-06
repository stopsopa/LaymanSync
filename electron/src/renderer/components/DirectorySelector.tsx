import React from 'react';
import './DirectorySelector.css';

interface DirectorySelectorProps {
  label: string;
  path: string | null;
  onDrop: (path: string) => void;
  disabled?: boolean;
}

const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  label,
  path,
  onDrop,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const items = Array.from(e.dataTransfer.items);
    
    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry && entry.isDirectory) {
          const file = item.getAsFile();
          if (file) {
            const dirPath = await window.electronAPI.getPathForFile(file);
            onDrop(dirPath);
            return;
          }
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // When using webkitdirectory, we get all files in the directory
      // We need to extract the directory path from the first file's path
      const firstFilePath = await window.electronAPI.getPathForFile(files[0]);
      
      // Extract directory path by removing the filename
      // The file path will be something like: /path/to/directory/filename.ext
      const dirPath = firstFilePath.substring(0, firstFilePath.lastIndexOf('/'));
      
      onDrop(dirPath);
    }
    // Reset input so the same directory can be selected again
    e.target.value = '';
  };

  const handleDropzoneClick = () => {
    if (!disabled) {
      document.getElementById(`file-input-${label}`)?.click();
    }
  };

  return (
    <div className="directory-selector">
      <label className="directory-label">{label}</label>
      
      <input
        type="file"
        id={`file-input-${label}`}
        // @ts-ignore - webkitdirectory is not in TypeScript types but works
        webkitdirectory="true"
        directory="true"
        onChange={handleFileSelect}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropzoneClick}
      >
        <div className="dropzone-content">
          <svg className="folder-icon" viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
          </svg>
          <p className="dropzone-text">
            {path ? 'Click or drop new directory' : 'Click or drop directory here'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DirectorySelector;
