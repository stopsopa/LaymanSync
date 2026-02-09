import type { FC } from "react";

type LogicComponentProps = {
  toConfig: () => void;
};

const LogicComponent: FC<LogicComponentProps> = ({ toConfig }) => {
  return (
    <div className="wizard-step-content">
      <h3 className="section-title">Execution Logic</h3>
      <button onClick={toConfig}>Back to Configuration</button>
    </div>
  );
};

export default LogicComponent;
