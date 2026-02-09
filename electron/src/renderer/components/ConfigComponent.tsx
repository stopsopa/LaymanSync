import type { FC } from "react";
import { useState } from "react";
import ConfigFile from "./ConfigFile";

type ConfigComponentProps = {
  toLogic: () => void;
  configFile: string | null;
  setConfigFile: (file: string | null) => void;
};

const ConfigComponent: FC<ConfigComponentProps> = ({ toLogic, configFile, setConfigFile }) => {
  const [test, setTest] = useState<string[]>([]);

  const addRow = (row: string) => {
    setTest((prev) => [...prev, row]);
  };

  return (
    <div className="wizard-step-content">
      <h3 className="section-title">Configuration</h3>

      <div>
        <ConfigFile value={configFile} onChange={setConfigFile} />
      </div>

      <button onClick={toLogic}>
        Next Step
      </button>

      <div>
        <label>
          <input type="radio" name="configMode" checked={configFile === null} onChange={() => setConfigFile(null)} />
          <span>No configuration (None)</span>
        </label>

        <label>
          <input
            type="radio"
            name="configMode"
            checked={configFile === "/myconfig.json"}
            onChange={() => setConfigFile("/myconfig.json")}
          />
          <span>Use myconfig.json</span>
        </label>
      </div>

      <pre>{JSON.stringify(configFile, null, 2)}</pre>

      <hr />

      <button
        onClick={() =>
          addRow(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus nec augue eu nibh convallis aliquam. Pellentesque sagittis hendrerit egestas. Mauris quam lorem, interdum quis odio non, tristique sagittis quam. Phasellus semper metus augue, nec rhoncus massa hendrerit eget. Quisque sed vulputate ex. Etiam at sodales odio. Mauris dictum sagittis eros, vel cursus odio consectetur sit amet. Nulla facilisi. Vivamus nec tempor enim, a auctor libero. Duis eget fermentum leo, ac venenatis justo. Proin nec pellentesque quam. Duis viverra ultricies sem, quis ultricies risus finibus sed.",
          )
        }
      >
        Add Row
      </button>

      {test.map((row, index) => (
        <div key={index}>{row}</div>
      ))}
    </div>
  );
};

export default ConfigComponent;
