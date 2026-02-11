import { useState, useCallback, useEffect } from "react";
import "./Wizard.css";
import ConfigComponent from "./ConfigComponent";
import LogicComponent from "./LogicComponent";
import clsx from "clsx";
import { useConfigManager } from "../tools/ConfigManager";
import type { MainTypes, ProgressData, DriveCompressionOptions } from "../../tools/commonTypes";
import driveCompressionMultiple from "../tools/driveCompressionMultiple";

export type RowStatus = "waiting" | "running" | "done" | "error";

export type RowState = {
  progress: ProgressData | null;
  logs: string[];
  status: RowStatus;
  error?: string | null;
  duration?: string;
};

function Wizard() {
  const { path: configFile, setPath: setConfigFile, data: config } = useConfigManager();

  const [configWizzardStep, setConfigWizzardStep] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [rowStates, setRowStates] = useState<Record<number, RowState>>({});
  const [dirExistence, setDirExistence] = useState<Record<number, { source: boolean; target: boolean }>>({});

  const validateDirectories = useCallback(async () => {
    const results: Record<number, { source: boolean; target: boolean }> = {};
    const api = window.electronAPI as any;
    for (let i = 0; i < config.length; i++) {
      const item = config[i] as MainTypes;
      results[i] = {
        source: item.source ? await api.checkPathExists(item.source) : false,
        target: item.target ? await api.checkPathExists(item.target) : false,
      };
    }
    setDirExistence(results);
  }, [config]);

  // Validate on mount and whenever config changes (this covers "Add New Entry" and editing)
  useEffect(() => {
    validateDirectories();
  }, [config, validateDirectories]);

  function selectLogicView() {
    if (configFile) {
      setConfigWizzardStep(false);
    }
  }

  const startSync = async () => {
    if (isSyncing) return;

    // Validate directories before starting
    await validateDirectories();

    setIsSyncing(true);
    setIsFinished(false);

    // Initialize states for all rows
    const initialStates: Record<number, RowState> = {};
    config.forEach((_, i: number) => {
      initialStates[i] = {
        progress: null,
        logs: [],
        status: "waiting",
      };
    });
    setRowStates(initialStates);

    const options = (config as MainTypes[]).map((o: MainTypes, i: number): DriveCompressionOptions => {
      return {
        ...o,
        progressEvent: (data: ProgressData) => {
          setRowStates((prev) => ({
            ...prev,
            [i]: {
              ...prev[i],
              progress: data,
              status: "running",
            },
          }));
        },
        log: (line) => {
          setRowStates((prev) => ({
            ...prev,
            [i]: {
              ...prev[i],
              logs: [...(prev[i]?.logs || []), line],
              status: "running",
            },
          }));
        },
        end: (error, duration) => {
          setRowStates((prev) => ({
            ...prev,
            [i]: {
              ...prev[i],
              status: error ? "error" : "done",
              error: error,
              duration: duration,
            },
          }));
        },
      };
    });

    try {
      await driveCompressionMultiple(options);
    } catch (e) {
      console.error("Batch sync failed:", e);
    } finally {
      setIsSyncing(false);
      setIsFinished(true);
    }
  };

  const resetSync = () => {
    setRowStates({});
    setIsFinished(false);
    validateDirectories();
  };

  return (
    <div className="wizard-container">
      {/* Stepper Header */}
      <div className="wizard-stepper">
        <div className="wizard-line">
          <div className="wizard-line-fill" style={{ width: configWizzardStep ? "50%" : "100%" }} />
        </div>

        <div
          className={clsx("wizard-step", {
            completed: !configWizzardStep,
            active: configWizzardStep,
            disabled: isSyncing,
          })}
          onClick={() => !isSyncing && setConfigWizzardStep(true)}
          style={{ cursor: isSyncing ? "not-allowed" : "pointer" }}
        >
          <div className="wizard-dot">{!configWizzardStep ? "✓" : "1"}</div>
          <span className="wizard-label">Configure</span>
        </div>

        <div
          className={clsx("wizard-step", {
            completed: isFinished,
            disabled: !Boolean(configFile) || isSyncing,
            active: !configWizzardStep,
          })}
          onClick={() => !isSyncing && selectLogicView()}
          style={{ cursor: isSyncing || !configFile ? "not-allowed" : "pointer" }}
        >
          <div className="wizard-dot">{isFinished ? "✓" : "2"}</div>
          <span className="wizard-label">Execute</span>
        </div>
      </div>

      {/* Step Content Area */}
      <div className="wizard-content">
        <div className="step-body" style={{ flex: 1 }}>
          {configWizzardStep ? (
            <ConfigComponent toLogic={() => selectLogicView()} configFile={configFile} setConfigFile={setConfigFile} />
          ) : (
            <LogicComponent
              toConfig={() => setConfigWizzardStep(true)}
              isSyncing={isSyncing}
              rowStates={rowStates}
              dirExistence={dirExistence}
              onStart={startSync}
              onReset={resetSync}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Wizard;
