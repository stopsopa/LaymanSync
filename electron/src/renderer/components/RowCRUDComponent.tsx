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
}

const RowCRUDComponent: FC<RowCRUDComponentProps> = ({ item, index, onUpdate, onRemove }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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
      className="config-item-card"
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid rgba(224, 224, 224, 0.5)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        marginBottom: "15px",
      }}
    >
      {/* FIRST ROW: SOURCE */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <label
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#666",
              marginBottom: "4px",
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
              minHeight: "45px",
              padding: "5px 15px",
              fontSize: "0.9rem",
              borderRadius: "10px",
              background: "rgba(0,0,0,0.02)",
              border: "1px dashed rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                fontSize: "0.9rem",
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
            marginTop: "20px",
            whiteSpace: "nowrap",
            opacity: item.source ? 1 : 0.5,
            cursor: item.source ? "pointer" : "not-allowed",
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
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#666",
              marginBottom: "4px",
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
              minHeight: "45px",
              padding: "5px 15px",
              fontSize: "0.9rem",
              borderRadius: "10px",
              background: "rgba(0,0,0,0.02)",
              border: "1px dashed rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                fontSize: "0.9rem",
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
            marginTop: "20px",
            whiteSpace: "nowrap",
            opacity: item.target ? 1 : 0.5,
            cursor: item.target ? "pointer" : "not-allowed",
          }}
        >
          Reveal in Finder
        </button>
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
              padding: "8px 16px",
              borderRadius: "12px",
              background: item.delete ? "rgba(211, 47, 47, 0.1)" : "transparent",
              border: `1px solid ${item.delete ? "rgba(211, 47, 47, 0.3)" : "rgba(0,0,0,0.05)"}`,
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
                width: "20px",
                height: "20px",
                accentColor: "#d32f2f",
                cursor: "pointer",
              }}
            />
            <span
              style={{
                fontSize: "0.95rem",
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
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <div
          style={{
            flex: 1,
            height: "12px",
            background: "rgba(0,0,0,0.05)",
            borderRadius: "6px",
            overflow: "hidden",
            position: "relative",
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
              fontSize: "0.6rem",
              color: "#666",
              fontWeight: "bold",
            }}
          >
            IDLE
          </span>
        </div>
        <div style={{ width: "120px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="aws-button"
            style={{
              backgroundColor: "transparent",
              color: "#d32f2f",
              border: "1px solid rgba(211, 47, 47, 0.4)",
              padding: "6px 16px",
              fontSize: "0.85rem",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            title="Remove this entry"
          >
            Remove Row
          </button>
        </div>
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
