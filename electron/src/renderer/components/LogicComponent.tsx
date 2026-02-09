import type { FC } from "react";

type LogicComponentProps = {
  toConfig: () => void;
};

import { useConfigManager } from "../tools/ConfigManager";

const LogicComponent: FC<LogicComponentProps> = ({ toConfig }) => {
  const { path, data, setConfig } = useConfigManager();

  const handleToggleDelete = () => {
    if (data && data.length > 0) {
      const newData = [...data];
      newData[0] = { ...newData[0], delete: !newData[0].delete };
      setConfig(newData);
    }
  };

  return (
    <div className="wizard-step-content" style={{ padding: "20px" }}>
      <h3 className="section-title">Execution Logic</h3>
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Config Path:</strong> {path || "None"}
        </p>
        <button onClick={toConfig} className="aws-button">
          Back to Configuration
        </button>
      </div>

      <div className="debug-section" style={{ background: "#f4f4f4", padding: "15px", borderRadius: "8px" }}>
        <h4>Config Data Example:</h4>
        <pre style={{ fontSize: "12px", maxHeight: "200px", overflow: "auto" }}>{JSON.stringify(data, null, 2)}</pre>

        {data && data.length > 0 && (
          <button onClick={handleToggleDelete} className="aws-button aws-button-primary" style={{ marginTop: "10px" }}>
            Toggle Delete on First Item
          </button>
        )}
      </div>
    </div>
  );
};

export default LogicComponent;
