import { useState } from "react";
import DropzoneDirectory from "./DropzoneDirectory";
import DropzoneFile from "./DropzoneFile";
import "./NewComponent.css";

function NewComponent() {
  const [source, setSource] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [x, setX] = useState<string | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [file2, setFile2] = useState<string | null>(null);

  const handleSourceChange = (path: string) => {
    setSource(path);
  };

  const handleTargetChange = (path: string) => {
    setTarget(path);
  };

  const handleXChange = (path: string) => {
    setX(path);
  };

  const handleFileChange = (path: string) => {
    setFile(path);
  };

  const handleFile2Change = (path: string) => {
    setFile2(path);
  };

  return (
    <div className="new-component-container">
      <DropzoneDirectory onChange={handleSourceChange}>{source ? source : `no source`}</DropzoneDirectory>

      <DropzoneDirectory onChange={handleTargetChange}>{target ? target : `no target`}</DropzoneDirectory>

      <DropzoneDirectory onChange={handleXChange}>{x ? x : `no x`}</DropzoneDirectory>

      <DropzoneFile onChange={handleFileChange}>{file ? file : `no file`}</DropzoneFile>
      <DropzoneFile onChange={handleFile2Change}>{file2 ? file2 : `no file2`}</DropzoneFile>
    </div>
  );
}

export default NewComponent;
