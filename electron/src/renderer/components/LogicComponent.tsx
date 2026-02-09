import type { FC } from "react";

type LogicComponentProps = {
  toConfig: () => void;
};

import { useConfigManager } from "../tools/ConfigManager";

const LogicComponent: FC<LogicComponentProps> = ({ toConfig }) => {
  const { path, data, setConfig } = useConfigManager();

  const handleAddItem = () => {
    const newItem = {
      source: "",
      target: "",
      delete: false,
    };
    setConfig([...data, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setConfig(newData);
  };

  const handleUpdateItem = (index: number, updates: Partial<(typeof data)[0]>) => {
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
          <button onClick={toConfig} className="aws-button">
            Back to Select File
          </button>
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
            <div
              key={index}
              className="config-item-card"
              style={{
                background: "white",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: "15px",
                alignItems: "end",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#555" }}>Source Path</label>
                <input
                  type="text"
                  value={item.source || ""}
                  onChange={(e) => handleUpdateItem(index, { source: e.target.value || undefined })}
                  placeholder="/path/to/source"
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#555" }}>Target Path</label>
                <input
                  type="text"
                  value={item.target || ""}
                  onChange={(e) => handleUpdateItem(index, { target: e.target.value || undefined })}
                  placeholder="/path/to/target"
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!item.delete}
                    onChange={(e) => handleUpdateItem(index, { delete: e.target.checked })}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span>Delete</span>
                </label>

                <button
                  onClick={() => handleRemoveItem(index)}
                  className="aws-button"
                  style={{
                    backgroundColor: "#fff",
                    color: "#d32f2f",
                    borderColor: "#d32f2f",
                    padding: "6px 12px",
                  }}
                  title="Remove this entry"
                >
                  Remove
                </button>
              </div>
            </div>
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
