import type { FC } from "react";

type LogicComponentProps = {
  toConfig: () => void;
};

import { useConfigManager } from "../tools/ConfigManager";
import RowCRUDComponent from "./RowCRUDComponent";

const LogicComponent: FC<LogicComponentProps> = ({ toConfig }) => {
  const { path, data, setConfig } = useConfigManager();

  const handleAddItem = () => {
    const newItem = {
      source: "",
      target: "",
      delete: false,
    };
    setConfig([newItem, ...data]);
  };

  const handleRemoveItem = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setConfig(newData);
  };

  const handleUpdateItem = (index: number, updates: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
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
          <button onClick={handleAddItem} className="aws-button aws-button-primary">
            + Add New Entry
          </button>
        </div>
      </div>

      <div className="config-list-container" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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
            />
          ))
        )}
      </div>

      <div style={{ marginTop: "40px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
        <h4 style={{ color: "#888", marginBottom: "10px", fontSize: "0.8rem", textTransform: "uppercase" }}>
          Debug View (Raw Content)
        </h4>
        <pre
          style={{
            fontSize: "11px",
            maxHeight: "150px",
            overflow: "auto",
            background: "#f4f4f4",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LogicComponent;
