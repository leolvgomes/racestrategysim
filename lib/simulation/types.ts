export type TyreCompound = "soft" | "medium" | "hard";

export type RaceConfig = {
  laps: number;
  baseLapTime: number;
  fuelCapacity: number;
  fuelConsumptionPerLap: number;
  fuelTimePenaltyPerLiter: number;
  tyreWearAggression: number;
  pitStopLoss: number;
};

export type TyreProfile = {
  compound: TyreCompound;
  label: string;
  shortLabel: string;
  colorClass: string;
  paceModifier: number;
  wearRate: number;
  idealLife: number;
};

export type Stint = {
  compound: TyreCompound;
  laps: number;
};

export type Strategy = {
  id: string;
  name: string;
  stints: Stint[];
};

export type LapSimulation = {
  lap: number;
  stintIndex: number;
  compound: TyreCompound;
  lapInStint: number;
  fuelLoad: number;
  lapTime: number;
  tyreWearPenalty: number;
};

export type SimulationResult = {
  strategy: Strategy;
  totalTime: number;
  pitStops: number;
  averageLapTime: number;
  bestLapTime: number;
  worstLapTime: number;
  warnings: string[];
  laps: LapSimulation[];
};
