import { type FC } from "react";
import type { RowState } from "./Wizard";

type LogicComponentProps = {
  toConfig: () => void;
  isSyncing: boolean;
  rowStates: Record<number, RowState>;
  dirExistence: Record<number, { source: boolean; target: boolean }>;
  onStart: () => void;
  onReset: () => void;
};

import { useConfigManager } from "../tools/ConfigManager";
import RowCRUDComponent from "./RowCRUDComponent";

const LogicComponent: FC<LogicComponentProps> = ({
  toConfig: _toConfig,
  isSyncing,
  rowStates,
  dirExistence,
  onStart,
  onReset,
}) => {
  const { path, data, setConfig } = useConfigManager();

  const handleAddItem = () => {
    if (isSyncing) return;
    const newItem = {
      source: "",
      target: "",
      delete: false,
    };
    setConfig([newItem, ...data]);
  };

  const handleRemoveItem = (index: number) => {
    if (isSyncing) return;
    const newData = data.filter((_, i: number) => i !== index);
    setConfig(newData);
  };

  const handleUpdateItem = (index: number, updates: any) => {
    if (isSyncing) return;
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    setConfig(newData);
  };

  const handleMoveItem = (dragIndex: number, hoverIndex: number) => {
    if (isSyncing) return;
    const dragItem = data[dragIndex];
    const newData = [...data];
    newData.splice(dragIndex, 1);
    newData.splice(hoverIndex, 0, dragItem);
    setConfig(newData);
  };

  return (
    <div className="wizard-step-content" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h3 className="section-title" style={{ margin: 0 }}>
            Sync Configurations
          </h3>
          <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem", color: "#666" }}>
            <strong>Source of truth:</strong> {path || "No file selected"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleAddItem}
            className="aws-button aws-button-primary"
            disabled={isSyncing}
            style={{ opacity: isSyncing ? 0.6 : 1, cursor: isSyncing ? "not-allowed" : "pointer" }}
          >
            + Add New Entry
          </button>
        </div>
      </div>

      <div className="config-list-container" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              background: "#f9f9f9",
              borderRadius: "8px",
              border: "2px dashed #ddd",
              color: "#888",
            }}
          >
            No configuration entries found in this file. Click "Add New Entry" to get started.
          </div>
        ) : (
          data.map((item: any, index: number) => (
            <RowCRUDComponent
              key={index}
              item={item}
              index={index}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
              onMove={handleMoveItem}
              isSyncing={isSyncing}
              state={rowStates[index]}
              dirExistence={dirExistence[index]}
            />
          ))
        )}
      </div>

      <div
        style={{
          marginTop: "30px",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          id="popover-reset"
          popover="manual"
          className="aws-popover"
          style={{
            position: "fixed",
            margin: 0,
            pointerEvents: "none",
            zIndex: 10000,
          }}
        >
          Clears all sync progress, logs, and status from the previous run to allow a fresh start or new changes. It
          also re-evaluates whether source and target folders exist.
        </div>
        <div
          onMouseEnter={(e: any) => {
            const wrapper = e.currentTarget;
            const popover = document.getElementById("popover-reset") as HTMLElement;
            const rect = wrapper.getBoundingClientRect();
            popover.showPopover();
            const popoverRect = popover.getBoundingClientRect();
            popover.style.left = `${rect.left + rect.width / 2 - popoverRect.width / 2}px`;
            popover.style.top = `${rect.top - popoverRect.height - 12}px`;
          }}
          onMouseLeave={() => (document.getElementById("popover-reset") as any)?.hidePopover()}
          style={{ display: "inline-block" }}
        >
          <button
            className="aws-button aws-button-secondary"
            onClick={onReset}
            disabled={isSyncing}
            style={{
              minWidth: "100px",
              opacity: isSyncing ? 0.5 : 1,
              cursor: isSyncing ? "not-allowed" : "pointer",
            }}
          >
            Reset
          </button>
        </div>

        <div
          id="popover-start"
          popover="manual"
          className="aws-popover"
          style={{
            position: "fixed",
            margin: 0,
            pointerEvents: "none",
            zIndex: 10000,
          }}
        >
          Launches the rclone sync/copy process for all directories defined in the configuration file.
        </div>
        <div
          onMouseEnter={(e: any) => {
            const wrapper = e.currentTarget;
            const popover = document.getElementById("popover-start") as HTMLElement;
            const rect = wrapper.getBoundingClientRect();
            popover.showPopover();
            const popoverRect = popover.getBoundingClientRect();
            popover.style.left = `${rect.left + rect.width / 2 - popoverRect.width / 2}px`;
            popover.style.top = `${rect.top - popoverRect.height - 12}px`;
          }}
          onMouseLeave={() => (document.getElementById("popover-start") as any)?.hidePopover()}
          style={{ display: "inline-block" }}
        >
          <button
            className="aws-button aws-button-primary"
            onClick={onStart}
            disabled={isSyncing || data.length === 0}
            style={{
              minWidth: "140px",
              padding: "10px 24px",
              opacity: isSyncing || data.length === 0 ? 0.5 : 1,
              cursor: isSyncing || data.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            {isSyncing ? "Syncing..." : "Start Sync"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogicComponent;
