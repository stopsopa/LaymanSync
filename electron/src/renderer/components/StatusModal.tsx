import './StatusModal.css';

interface StatusModalProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  duration?: string;
  onClose: () => void;
}

function StatusModal({ type, title, message, duration, onClose }: StatusModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content status-modal-content ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header status-header ${type}`}>
          <div className="header-title-container">
            {type === 'success' ? (
              <svg className="status-icon-svg success" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : (
              <svg className="status-icon-svg error" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            )}
            <h2>{title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {duration && (
            <div className="status-meta">
              <span className="label">Duration:</span>
              <span className="value">{duration}</span>
            </div>
          )}
          <div className={`message-container ${type}`}>
            <pre className="message-content">{message}</pre>
          </div>
        </div>
        <div className="modal-footer">
          <button className={`aws-button ${type === 'success' ? 'aws-button-primary' : 'aws-button-danger'}`} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusModal;
