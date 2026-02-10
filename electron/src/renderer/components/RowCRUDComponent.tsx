import { useState, useRef, useEffect } from "react";
import type { FC } from "react";
import type { MainOptionalTypes } from "../../tools/commonTypes";
import DropzoneDirectory from "./DropzoneDirectory";
import ConfirmationModal from "./ConfirmationModal";
import type { RowState } from "./Wizard";

interface RowCRUDComponentProps {
  item: MainOptionalTypes;
  index: number;
  onUpdate: (index: number, updates: Partial<MainOptionalTypes>) => void;
  onRemove: (index: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  isSyncing: boolean;
  state?: RowState;
  dirExistence?: { source: boolean; target: boolean };
}

const RowCRUDComponent: FC<RowCRUDComponentProps> = ({
  item,
  index,
  onUpdate,
  onRemove,
  onMove,
  isSyncing,
  state,
  dirExistence,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);
  const [popoverContent, setPopoverContent] = useState<React.ReactNode>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLPreElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state?.logs]);

  const handleDragStart = (e: React.DragEvent) => {
    if (isSyncing) return;

    // Set the entire card as the drag image even though we only drag by the handle
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      // Calculate where the cursor is relative to the card to keep it positioned properly
      e.dataTransfer.setDragImage(cardRef.current, e.clientX - rect.left, e.clientY - rect.top);
    }

    e.dataTransfer.setData("drag-index", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isSyncing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isSyncing) return;
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

  const showPopover = (e: React.MouseEvent, content: React.ReactNode) => {
    if (popoverRef.current && "showPopover" in popoverRef.current) {
      setPopoverContent(content);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const popover = popoverRef.current;

      // Show it first to get its dimensions
      popover.showPopover();

      const popoverRect = popover.getBoundingClientRect();

      popover.style.position = "fixed";
      popover.style.left = `${rect.left + rect.width / 2 - popoverRect.width / 2}px`;
      popover.style.top = `${rect.top - popoverRect.height - 12}px`;
      popover.style.margin = "0";
    }
  };

  const hidePopover = () => {
    if (popoverRef.current && popoverRef.current.hidePopover) {
      popoverRef.current.hidePopover();
      setPopoverContent(null);
    }
  };

  // Auto-expand logs when sync starts or ends, collapse on reset
  useEffect(() => {
    if (state?.status === "running" || state?.status === "done" || state?.status === "error") {
      setIsLogsExpanded(true);
    } else if (!state || state.status === "waiting") {
      setIsLogsExpanded(false);
    }
  }, [state?.status]);

  const progressPercent =
    state?.status === "done" || state?.status === "error" ? "100%" : state?.progress?.progressPercentHuman || "0%";
  const statusLabel = () => {
    if (!state) return "WAITING IN QUEUE";
    if (state.status === "running") return `SYNCING: ${progressPercent}`;
    if (state.status === "done") return `FINISHED (${state.duration || "0s"})`;
    if (state.status === "error") return "ERROR OCCURRED";
    return "WAITING IN QUEUE";
  };

  const getProgressColor = () => {
    if (state?.status === "done") return "var(--aws-green)";
    if (state?.status === "error") return "var(--aws-red)";
    return "var(--aws-blue)";
  };

  const renderExistenceIcon = (exists: boolean | undefined, path: string | undefined) => {
    if (!path) return null;
    const content = exists ? "Directory exists" : "Directory does not exist";
    const color = exists ? "#4caf50" : "#ff1744";

    return (
      <div
        onMouseEnter={(e) =>
          showPopover(
            e,
            <span>
              <strong>Status:</strong> {content}
            </span>,
          )
        }
        onMouseLeave={hidePopover}
        style={{ color, display: "flex", alignItems: "center", padding: "0 4px", cursor: "help" }}
      >
        {exists ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        )}
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={`config-item-card ${isDraggingOver ? "dragging-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        padding: "10px 15px",
        borderRadius: "12px",
        border: `1px solid ${
          state?.status === "error"
            ? "#ff1744" // Vibrant red border for errors
            : isDraggingOver
              ? "#0073bb"
              : "rgba(224, 224, 224, 0.5)"
        }`,
        boxShadow:
          state?.status === "error"
            ? "0 0 12px rgba(255, 23, 68, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)" // Red glow for errors
            : "0 4px 16px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        transition: "all 0.2s ease",
        position: "relative",
        opacity: isSyncing && state?.status === "waiting" ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
        {/* DRAG HANDLE */}
        <div
          draggable={!isSyncing}
          onDragStart={handleDragStart}
          style={{
            width: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isSyncing ? "not-allowed" : "grab",
            color: "#ccc",
            background: "rgba(0,0,0,0.02)",
            borderRadius: "6px",
            border: "1px solid rgba(0,0,0,0.03)",
          }}
          title={isSyncing ? "Sorting disabled during sync" : "Drag to reorder"}
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
                disabled={isSyncing}
                style={{
                  minHeight: "34px",
                  padding: "2px 12px",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  background: isSyncing ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.02)",
                  border: "1px dashed rgba(0,0,0,0.1)",
                  cursor: isSyncing ? "not-allowed" : "pointer",
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
                  {item.source || "Select source directory (click or drag & drop)..."}
                </div>
              </DropzoneDirectory>
            </div>
            <div style={{ marginTop: "16px", alignSelf: "center" }}>
              {renderExistenceIcon(dirExistence?.source, item.source)}
            </div>
            <button
              onClick={handleRevealSource}
              disabled={!item.source || isSyncing || !dirExistence?.source}
              className="aws-button aws-button-secondary"
              style={{
                marginTop: "16px",
                whiteSpace: "nowrap",
                opacity: item.source && !isSyncing && dirExistence?.source ? 1 : 0.5,
                cursor: item.source && !isSyncing && dirExistence?.source ? "pointer" : "not-allowed",
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
                disabled={isSyncing}
                style={{
                  minHeight: "34px",
                  padding: "2px 12px",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  background: isSyncing ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.02)",
                  border: "1px dashed rgba(0,0,0,0.1)",
                  cursor: isSyncing ? "not-allowed" : "pointer",
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
                  {item.target || "Select destination directory (click or drag & drop)..."}
                </div>
              </DropzoneDirectory>
            </div>
            <div style={{ marginTop: "16px", alignSelf: "center" }}>
              {renderExistenceIcon(dirExistence?.target, item.target)}
            </div>
            <button
              onClick={handleRevealTarget}
              disabled={!item.target || isSyncing || !dirExistence?.target}
              className="aws-button aws-button-secondary"
              style={{
                marginTop: "16px",
                whiteSpace: "nowrap",
                opacity: item.target && !isSyncing && dirExistence?.target ? 1 : 0.5,
                cursor: item.target && !isSyncing && dirExistence?.target ? "pointer" : "not-allowed",
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
          onMouseEnter={(e) =>
            showPopover(
              e,
              <>
                <strong>Warning:</strong> This flag will delete files in the destination that do not exist in the
                source. Use with caution!
              </>,
            )
          }
          onMouseLeave={hidePopover}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            // @ts-ignore - anchorName is new
            anchorName: `--anchor-delete-${index}`,
          }}
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
              cursor: isSyncing ? "not-allowed" : "pointer",
              opacity: isSyncing ? 0.6 : 1,
            }}
            onClick={() => !isSyncing && onUpdate(index, { delete: !item.delete })}
          >
            <input
              type="checkbox"
              checked={!!item.delete}
              onChange={(e) => !isSyncing && onUpdate(index, { delete: e.target.checked })}
              onClick={(e) => e.stopPropagation()}
              disabled={isSyncing}
              style={{
                width: "16px",
                height: "16px",
                accentColor: "#d32f2f",
                cursor: isSyncing ? "not-allowed" : "pointer",
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
          popover="manual"
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
            zIndex: 9999,
          }}
        >
          {popoverContent}
        </div>
      </div>

      {/* FOURTH ROW: PROGRESS BAR & REMOVE */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            flex: 1,
            height: "28px",
            background: state?.status === "error" ? "rgba(209, 50, 18, 0.15)" : "#eaeded",
            borderRadius: "4px",
            overflow: "hidden",
            position: "relative",
            border: `1px solid ${
              state?.status === "error"
                ? "var(--aws-red)"
                : state?.status === "running"
                  ? "var(--aws-blue)"
                  : "var(--aws-border)"
            }`,
          }}
        >
          <div
            style={{
              width: state?.status === "error" ? "100%" : progressPercent,
              height: "100%",
              background: getProgressColor(),
              transition: "width 0.5s ease, background 0.3s ease",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "0.75rem",
              color: "#ffffff",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "1px",
              // text-shadow ensures visibility on both bright and dark backgrounds
              textShadow: "0px 0px 4px rgba(0, 0, 0, 0.8), 0px 1px 2px rgba(0, 0, 0, 0.9)",
              whiteSpace: "nowrap",
            }}
          >
            {statusLabel()}
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isSyncing}
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
            opacity: isSyncing ? 0.3 : 1,
            cursor: isSyncing ? "not-allowed" : "pointer",
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

      {/* FIFTH ROW: LOG TOGGLE */}
      <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "2px" }}>
        <button
          onClick={() => setIsLogsExpanded(!isLogsExpanded)}
          style={{
            background: "none",
            border: "none",
            color: "#0073bb",
            fontSize: "0.7rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "0",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {isLogsExpanded ? "▼ Hide Logs" : "▶ Show Logs"}
          {state?.logs && state.logs.length > 0 && ` (${state.logs.length})`}
        </button>
      </div>

      {/* LOG SECTION */}
      {isLogsExpanded && (
        <div
          style={{
            marginTop: "4px",
            background: "#1e1e1e",
            borderRadius: "6px",
            border: "1px solid #333",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "160px",
          }}
        >
          <pre
            ref={scrollRef}
            style={{
              flex: 1,
              margin: 0,
              padding: "8px 12px",
              color: "#eee",
              fontSize: "0.75rem",
              fontFamily: "'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              overflowY: "auto",
              lineHeight: "1.4",
            }}
          >
            {state?.logs && state.logs.length > 0
              ? state.logs.join("\n")
              : state?.status === "waiting"
                ? "Waiting in queue..."
                : "Initializing..."}
            {state?.error && (
              <div style={{ color: "#ff5252", marginTop: "8px", fontWeight: "bold" }}>ERROR: {state.error}</div>
            )}
          </pre>
        </div>
      )}

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
