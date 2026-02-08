export type MainTypes = {
  source: string;
  target: string;
  delete?: boolean;
};

export type ProgressData = {
  progressPercentHuman: string;
  totalTimePassedHuman: string;
  estimatedTotalTimeHuman: string;
  estimatedRemainingTimeHuman: string;
};

export type DriveCompressionOptions = {
  progressEvent?: (data: ProgressData) => void;
  log?: (line: string) => void;
  end: (error: string | null, duration: string) => void;
} & MainTypes;
