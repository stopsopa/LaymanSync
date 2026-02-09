import { useState } from "react";
import "./Wizard.css";
import ConfigComponent from "./ConfigComponent";
import LogicComponent from "./LogicComponent";
import clsx from "clsx";

function Wizard() {
  const [configFile, setConfigFile] = useState<string | null>(null);

  const [configWizzardStep, setConfigWizzardStep] = useState(false);

  function selectLogicView() {
    if (configFile) {
      setConfigWizzardStep(false);
    }
  }

  return (
    <div className="wizard-container">
      {/* Stepper Header */}
      <div className="wizard-stepper">
        <div className="wizard-line">
          <div className="wizard-line-fill" style={{ width: configWizzardStep ? "100%" : "0%" }} />
        </div>

        <div
          className={clsx("wizard-step", {
            completed: configWizzardStep,
            active: true,
          })}
          onClick={() => setConfigWizzardStep(true)}
        >
          <div className="wizard-dot">{!configWizzardStep ? "1" : "✓"}</div>
          <span className="wizard-label">Configure</span>
        </div>

        <div
          className={clsx("wizard-step", {
            completed: !configWizzardStep,
            disabled: !Boolean(configFile),
            active: true,
          })}
          onClick={() => selectLogicView()}
        >
          <div className="wizard-dot">2</div>
          <span className="wizard-label">Execute</span>
        </div>
      </div>
      <pre>{JSON.stringify({ configWizzardStep, configFile }, null, 2)}</pre>

      {/* Step Content Area */}
      <div className="wizard-content">
        <div className="step-body" style={{ flex: 1 }}>
          {configWizzardStep ? (
            <ConfigComponent toLogic={() => selectLogicView()} configFile={configFile} setConfigFile={setConfigFile} />
          ) : (
            <LogicComponent toConfig={() => setConfigWizzardStep(true)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Wizard;
