import { useState, useRef } from "react";
import type { FC } from "react";
import type { MainOptionalTypes } from "../../tools/commonTypes";
import DropzoneDirectory from "./DropzoneDirectory";
import ConfirmationModal from "./ConfirmationModal";

interface RowCRUDComponentProps {
  item: MainOptionalTypes;
  index: number;
  onUpdate: (index: number, updates: Partial<MainOptionalTypes>) => void;
  onRemove: (index: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

const RowCRUDComponent: FC<RowCRUDComponentProps> = ({ item, index, onUpdate, onRemove, onMove }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("drag-index", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const dragIndex = parseInt(e.dataTransfer.getData("drag-index"), 10);
    if (dragIndex !== index) {
      onMove(dragIndex, index);
    }
  };

  const handleRevealSource = () => {
    if (item.source) {
      window.electronAPI.revealDirectory(item.source);
    }
  };

  const handleRevealTarget = () => {
    if (item.target) {
      window.electronAPI.revealDirectory(item.target);
    }
  };

  const showPopover = (e: React.MouseEvent) => {
    if (popoverRef.current && "showPopover" in popoverRef.current) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const popover = popoverRef.current;

      // Show it first to get its dimensions
      popover.showPopover();

      const popoverRect = popover.getBoundingClientRect();

      popover.style.position = "fixed";
      // Position above: trigger top - popover height - gap (8px)
      popover.style.top = `${rect.top - popoverRect.height - 8}px`;
      popover.style.left = `${rect.left}px`;
    }
  };

  const hidePopover = () => {
    if (popoverRef.current && popoverRef.current.hidePopover) {
      popoverRef.current.hidePopover();
    }
  };

  return (
    <div
      className={`config-item-card ${isDraggingOver ? "dragging-over" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        padding: "10px 15px",
        borderRadius: "12px",
        border: `1px solid ${isDraggingOver ? "#0073bb" : "rgba(224, 224, 224, 0.5)"}`,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        transition: "all 0.2s ease",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
        {/* DRAG HANDLE */}
        <div
          style={{
            width: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            color: "#ccc",
            background: "rgba(0,0,0,0.02)",
            borderRadius: "6px",
            border: "1px solid rgba(0,0,0,0.03)",
          }}
          title="Drag to reorder"
        >
          <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
            <circle cx="2" cy="2" r="1.5" />
            <circle cx="2" cy="8" r="1.5" />
            <circle cx="2" cy="14" r="1.5" />
            <circle cx="10" cy="2" r="1.5" />
            <circle cx="10" cy="8" r="1.5" />
            <circle cx="10" cy="14" r="1.5" />
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* FIRST ROW: SOURCE */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: "0.65rem",
                  fontWeight: "600",
                  color: "#666",
                  marginBottom: "2px",
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Source Directory
              </label>
              <DropzoneDirectory
                onChange={(path) => onUpdate(index, { source: path })}
                style={{
                  minHeight: "34px",
                  padding: "2px 12px",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.02)",
                  border: "1px dashed rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: item.source ? "#333" : "#999",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.source || "Select source directory..."}
                </div>
              </DropzoneDirectory>
            </div>
            <button
              onClick={handleRevealSource}
              disabled={!item.source}
              className="aws-button aws-button-secondary"
              style={{
                marginTop: "16px",
                whiteSpace: "nowrap",
                opacity: item.source ? 1 : 0.5,
                cursor: item.source ? "pointer" : "not-allowed",
                padding: "4px 10px",
                fontSize: "0.75rem",
                height: "34px",
              }}
            >
              Reveal in Finder
            </button>
          </div>

          {/* SECOND ROW: DESTINATION */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: "0.65rem",
                  fontWeight: "600",
                  color: "#666",
                  marginBottom: "2px",
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Destination Directory
              </label>
              <DropzoneDirectory
                onChange={(path) => onUpdate(index, { target: path })}
                style={{
                  minHeight: "34px",
                  padding: "2px 12px",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.02)",
                  border: "1px dashed rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: item.target ? "#333" : "#999",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.target || "Select destination directory..."}
                </div>
              </DropzoneDirectory>
            </div>
            <button
              onClick={handleRevealTarget}
              disabled={!item.target}
              className="aws-button aws-button-secondary"
              style={{
                marginTop: "16px",
                whiteSpace: "nowrap",
                opacity: item.target ? 1 : 0.5,
                cursor: item.target ? "pointer" : "not-allowed",
                padding: "4px 10px",
                fontSize: "0.75rem",
                height: "34px",
              }}
            >
              Reveal in Finder
            </button>
          </div>
        </div>
      </div>

      {/* THIRD ROW: DELETE FLAG */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}>
        <div
          onMouseEnter={(e) => showPopover(e)}
          onMouseLeave={hidePopover}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "4px 12px",
              borderRadius: "8px",
              background: item.delete ? "rgba(211, 47, 47, 0.08)" : "transparent",
              border: `1px solid ${item.delete ? "rgba(211, 47, 47, 0.25)" : "rgba(0,0,0,0.04)"}`,
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onClick={() => onUpdate(index, { delete: !item.delete })}
          >
            <input
              type="checkbox"
              checked={!!item.delete}
              onChange={(e) => onUpdate(index, { delete: e.target.checked })}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "16px",
                height: "16px",
                accentColor: "#d32f2f",
                cursor: "pointer",
              }}
            />
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: "500",
                color: item.delete ? "#d32f2f" : "#444",
              }}
            >
              Enable Destructive Delete
            </span>
          </div>
        </div>

        <div
          ref={popoverRef}
          popover="auto"
          style={{
            padding: "12px 16px",
            background: "#333",
            color: "white",
            borderRadius: "8px",
            fontSize: "0.85rem",
            maxWidth: "250px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            position: "fixed",
            margin: "0",
            pointerEvents: "none",
            left: "-9999px", // Start offscreen
            top: "-9999px",
          }}
        >
          <strong>Warning:</strong> This flag will delete files in the destination that do not exist in the source. Use
          with caution!
        </div>
      </div>

      {/* FOURTH ROW: PROGRESS BAR & REMOVE */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            flex: 1,
            height: "28px",
            background: "rgba(0,0,0,0.04)",
            borderRadius: "6px",
            overflow: "hidden",
            position: "relative",
            border: "1px solid rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              width: "0%",
              height: "100%",
              background: "linear-gradient(90deg, #0073bb, #00a1c9)",
              borderRadius: "6px",
              transition: "width 0.5s ease",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "0.65rem",
              color: "#555",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            WAITING IN QUEUE
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="aws-button"
          style={{
            width: "28px",
            height: "28px",
            minWidth: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            color: "#d32f2f",
            border: "1px solid rgba(211, 47, 47, 0.4)",
            padding: "0",
            borderRadius: "6px",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          title="Remove this entry"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>

      {isModalOpen && (
        <ConfirmationModal
          title="Remove Configuration?"
          message="Are you sure you want to remove this configuration entry? This action cannot be undone."
          items={[
            `Source: ${item.source || "Not set"}`,
            `Target: ${item.target || "Not set"}`,
            `Delete Flag: ${item.delete ? "YES (Destructive)" : "NO"}`,
          ]}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          onConfirm={() => {
            onRemove(index);
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
          type="delete"
        />
      )}
    </div>
  );
};

export default RowCRUDComponent;
