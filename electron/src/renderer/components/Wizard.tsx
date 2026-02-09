import { useState } from "react";
import "./Wizard.css";
import ConfigComponent from "./ConfigComponent";
import LogicComponent from "./LogicComponent";

function Wizard() {
  const [configFile, setConfigFile] = useState<string | null>(null);

  const [configWizzardStep, setConfigWizzardStep] = useState(false);

  return (
    <div className="wizard-container">
      {/* Stepper Header */}
      <div className="wizard-stepper">
        <div className="wizard-line">
          <div className="wizard-line-fill" style={{ width: configWizzardStep ? "100%" : "0%" }} />
        </div>

        <div
          className={`wizard-step ${!configWizzardStep ? "active" : "completed"}`}
          onClick={() => setConfigWizzardStep(false)}
        >
          <div className="wizard-dot">{!configWizzardStep ? "1" : "✓"}</div>
          <span className="wizard-label">Configure</span>
        </div>

        <div
          className={`wizard-step ${configWizzardStep ? "active" : "disabled"}`}
        >
          <div className="wizard-dot">2</div>
          <span className="wizard-label">Execute</span>
        </div>
      </div>

      {/* Step Content Area */}
      <div className="wizard-content">
        <div className="step-body" style={{ flex: 1 }}>
          {configWizzardStep ? (
            <ConfigComponent
              toLogic={() => setConfigWizzardStep(false)}
              configFile={configFile}
              setConfigFile={setConfigFile}
            />
          ) : (
            <LogicComponent toConfig={() => setConfigWizzardStep(true)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Wizard;
