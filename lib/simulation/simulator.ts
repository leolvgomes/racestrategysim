import { calculateLapTime, getTotalStintLaps } from "./calculations";
import { TYRE_PROFILES } from "./constants";
import type {
  LapSimulation,
  RaceConfig,
  SimulationResult,
  Strategy,
} from "./types";

export function simulateStrategy(
  config: RaceConfig,
  strategy: Strategy,
): SimulationResult {
  const laps: LapSimulation[] = [];
  const warnings: string[] = [];
  let totalTime = 0;
  let currentLap = 1;

  for (const [stintIndex, stint] of strategy.stints.entries()) {
    const tyre = TYRE_PROFILES[stint.compound];

    if (stint.laps > tyre.idealLife * 1.2) {
      warnings.push(
        `${tyre.label} muito longo no stint ${stintIndex + 1}: risco alto de queda de performance.`,
      );
    }

    for (let lapInStint = 1; lapInStint <= stint.laps; lapInStint += 1) {
      if (currentLap > config.laps) {
        break;
      }

      const lap = calculateLapTime(
        config,
        stint.compound,
        currentLap,
        lapInStint,
      );

      totalTime += lap.lapTime;
      laps.push({
        lap: currentLap,
        stintIndex,
        compound: stint.compound,
        lapInStint,
        fuelLoad: lap.fuelLoad,
        lapTime: lap.lapTime,
        tyreWearPenalty: lap.tyreWearPenalty,
      });
      currentLap += 1;
    }

    if (stintIndex < strategy.stints.length - 1) {
      totalTime += config.pitStopLoss;
    }
  }

  const plannedLaps = getTotalStintLaps(strategy.stints);

  if (plannedLaps !== config.laps) {
    warnings.push(
      `Estratégia soma ${plannedLaps} voltas, mas a corrida tem ${config.laps}.`,
    );
  }

  const lapTimes = laps.map((lap) => lap.lapTime);
  const bestLapTime = Math.min(...lapTimes);
  const worstLapTime = Math.max(...lapTimes);

  return {
    strategy,
    totalTime,
    pitStops: Math.max(0, strategy.stints.length - 1),
    averageLapTime: totalTime / config.laps,
    bestLapTime,
    worstLapTime,
    warnings,
    laps,
  };
}

export function simulateStrategies(config: RaceConfig, strategies: Strategy[]) {
  return strategies
    .map((strategy) => simulateStrategy(config, strategy))
    .sort((a, b) => a.totalTime - b.totalTime);
}
