import type { RaceConfig, TyreProfile } from "./types";

export const DEFAULT_RACE_CONFIG: RaceConfig = {
  laps: 58,
  baseLapTime: 92.4,
  fuelCapacity: 105,
  fuelConsumptionPerLap: 1.72,
  fuelTimePenaltyPerLiter: 0.018,
  tyreWearAggression: 1,
  pitStopLoss: 22,
};

export const TYRE_PROFILES: Record<TyreProfile["compound"], TyreProfile> = {
  soft: {
    compound: "soft",
    label: "Soft",
    shortLabel: "S",
    colorClass: "bg-red-500",
    paceModifier: -0.65,
    wearRate: 0.095,
    idealLife: 18,
  },
  medium: {
    compound: "medium",
    label: "Medium",
    shortLabel: "M",
    colorClass: "bg-amber-400",
    paceModifier: 0,
    wearRate: 0.058,
    idealLife: 28,
  },
  hard: {
    compound: "hard",
    label: "Hard",
    shortLabel: "H",
    colorClass: "bg-zinc-100",
    paceModifier: 0.48,
    wearRate: 0.036,
    idealLife: 40,
  },
};
