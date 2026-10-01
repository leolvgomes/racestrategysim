import { TYRE_PROFILES } from "./constants";
import type { RaceConfig, Stint } from "./types";

export type ValidationMessage = {
  id: string;
  tone: "warning" | "danger";
  title: string;
  description: string;
};

export function getRequiredFuel(config: RaceConfig) {
  return config.laps * config.fuelConsumptionPerLap;
}

export function getRaceConfigWarnings(config: RaceConfig): ValidationMessage[] {
  const requiredFuel = getRequiredFuel(config);
  const messages: ValidationMessage[] = [];

  if (requiredFuel > config.fuelCapacity) {
    messages.push({
      id: "fuel-capacity",
      tone: "danger",
      title: "Combustivel insuficiente",
      description: `A corrida pede ${requiredFuel.toFixed(1)} L, mas o tanque tem ${config.fuelCapacity.toFixed(1)} L.`,
    });
  }

  if (config.pitStopLoss < 14) {
    messages.push({
      id: "pit-loss-low",
      tone: "warning",
      title: "Pit stop muito otimista",
      description:
        "Tempos abaixo de 14s podem deixar estrategias com muitas paradas artificialmente fortes.",
    });
  }

  if (config.tyreWearAggression > 1.8) {
    messages.push({
      id: "high-wear",
      tone: "warning",
      title: "Desgaste alto",
      description:
        "Pistas muito abrasivas deixam stints longos instaveis; confira a tabela de stints.",
    });
  }

  return messages;
}

export function getStintWarnings(stints: Stint[]) {
  return stints.flatMap((stint, index) => {
    const tyre = TYRE_PROFILES[stint.compound];

    if (stint.laps <= tyre.idealLife) {
      return [];
    }

    return [
      {
        id: `${stint.compound}-${index}-life`,
        tone: stint.laps > tyre.idealLife * 1.2 ? "danger" : "warning",
        title: `${tyre.label} acima da vida ideal`,
        description: `Stint ${index + 1} tem ${stint.laps} voltas; vida ideal estimada: ${tyre.idealLife}.`,
      },
    ] satisfies ValidationMessage[];
  });
}
