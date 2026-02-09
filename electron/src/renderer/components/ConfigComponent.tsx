import type { FC } from "react";

type ConfigComponentProps = {
  toLogic: () => void;
  configFile: string;
  setConfigFile: (file: string) => void;
};

const ConfigComponent: FC<ConfigComponentProps> = ({ toLogic, configFile, setConfigFile }) => {
  return (
    <div className="wizard-step-content">
      <h3 className="section-title">Configuration</h3>

      <button onClick={toLogic}>Next Step</button>
    </div>
  );
};

export default ConfigComponent;
