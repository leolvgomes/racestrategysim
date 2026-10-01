import { TYRE_PROFILES } from "./constants";
import type { RaceConfig, Stint, TyreCompound } from "./types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateFuelLoad(config: RaceConfig, lap: number) {
  const startingFuel = Math.min(
    config.fuelCapacity,
    config.laps * config.fuelConsumptionPerLap,
  );

  return Math.max(0, startingFuel - (lap - 1) * config.fuelConsumptionPerLap);
}

export function calculateTyreWearPenalty(
  compound: TyreCompound,
  lapInStint: number,
  config: RaceConfig,
) {
  const tyre = TYRE_PROFILES[compound];
  const lifeRatio = lapInStint / tyre.idealLife;
  const linearWear = lapInStint * tyre.wearRate * config.tyreWearAggression;
  const cliffPenalty =
    lifeRatio > 1 ? (lifeRatio - 1) ** 2 * 7.5 * config.tyreWearAggression : 0;

  return linearWear + cliffPenalty;
}

export function calculateLapTime(
  config: RaceConfig,
  compound: TyreCompound,
  lap: number,
  lapInStint: number,
) {
  const tyre = TYRE_PROFILES[compound];
  const fuelLoad = calculateFuelLoad(config, lap);
  const fuelPenalty = fuelLoad * config.fuelTimePenaltyPerLiter;
  const tyreWearPenalty = calculateTyreWearPenalty(
    compound,
    lapInStint,
    config,
  );

  return {
    fuelLoad,
    tyreWearPenalty,
    lapTime:
      config.baseLapTime + tyre.paceModifier + fuelPenalty + tyreWearPenalty,
  };
}

export function getTotalStintLaps(stints: Stint[]) {
  return stints.reduce((total, stint) => total + stint.laps, 0);
}
