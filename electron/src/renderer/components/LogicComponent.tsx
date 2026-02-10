import type { FC } from "react";
import type { RowState } from "./Wizard";

type LogicComponentProps = {
  toConfig: () => void;
  isSyncing: boolean;
  isFinished: boolean;
  rowStates: Record<number, RowState>;
  dirExistence: Record<number, { source: boolean; target: boolean }>;
  onStart: () => void;
  onReset: () => void;
};

import { useConfigManager } from "../tools/ConfigManager";
import RowCRUDComponent from "./RowCRUDComponent";

const LogicComponent: FC<LogicComponentProps> = ({
  toConfig,
  isSyncing,
  isFinished,
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
    const newData = data.filter((_, i) => i !== index);
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
          data.map((item, index) => (
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
        }}
      >
        <button
          className="aws-button aws-button-secondary"
          onClick={onReset}
          disabled={!isFinished || isSyncing}
          style={{
            minWidth: "100px",
            opacity: !isFinished || isSyncing ? 0.5 : 1,
            cursor: !isFinished || isSyncing ? "not-allowed" : "pointer",
          }}
        >
          Reset
        </button>
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
  );
};

export default LogicComponent;
