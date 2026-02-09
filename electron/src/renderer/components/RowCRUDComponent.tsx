import type { FC } from "react";
import type { MainOptionalTypes } from "../../tools/commonTypes";

interface RowCRUDComponentProps {
  item: MainOptionalTypes;
  index: number;
  onUpdate: (index: number, updates: Partial<MainOptionalTypes>) => void;
  onRemove: (index: number) => void;
}

const RowCRUDComponent: FC<RowCRUDComponentProps> = ({ item, index, onUpdate, onRemove }) => {
  return (
    <div
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
          onChange={(e) => onUpdate(index, { source: e.target.value || undefined })}
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
          onChange={(e) => onUpdate(index, { target: e.target.value || undefined })}
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
            onChange={(e) => onUpdate(index, { delete: e.target.checked })}
            style={{ width: "18px", height: "18px" }}
          />
          <span>Delete</span>
        </label>

        <button
          onClick={() => onRemove(index)}
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
  );
};

export default RowCRUDComponent;
