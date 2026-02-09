import { useState } from "react";
import DropzoneDirectory from "./DropzoneDirectory";
import "./NewComponent.css";

function NewComponent() {
  const [source, setSource] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);

  const [x, setX] = useState<string | null>(null);

  const handleSourceChange = (path: string) => {
    setSource(path);
  };

  const handleTargetChange = (path: string) => {
    setTarget(path);
  };

  const handleXChange = (path: string) => {
    setX(path);
  };

  return (
    <div className="new-component-container">
      <DropzoneDirectory onChange={handleSourceChange}>{source ? source : `no source`}</DropzoneDirectory>

      <DropzoneDirectory onChange={handleTargetChange}>{target ? target : `no target`}</DropzoneDirectory>

      <DropzoneDirectory onChange={handleXChange}>{x ? x : `no x`}</DropzoneDirectory>
    </div>
  );
}

export default NewComponent;
