import type { RaceConfig, Strategy, TyreCompound } from "./types";

const COMPOUND_LABEL: Record<TyreCompound, string> = {
  soft: "Soft",
  medium: "Medium",
  hard: "Hard",
};

function splitLaps(totalLaps: number, parts: number) {
  const base = Math.floor(totalLaps / parts);
  const remainder = totalLaps % parts;

  return Array.from({ length: parts }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}

function createStrategy(
  id: string,
  compounds: TyreCompound[],
  laps: number,
): Strategy {
  const stintLaps = splitLaps(laps, compounds.length);

  return {
    id,
    name: compounds.map((compound) => COMPOUND_LABEL[compound]).join(" -> "),
    stints: compounds.map((compound, index) => ({
      compound,
      laps: stintLaps[index],
    })),
  };
}

export function generateStrategies(config: RaceConfig): Strategy[] {
  const templates: TyreCompound[][] = [
    ["medium"],
    ["hard"],
    ["soft", "medium"],
    ["soft", "hard"],
    ["medium", "hard"],
    ["soft", "medium", "soft"],
    ["medium", "hard", "soft"],
    ["soft", "medium", "hard"],
  ];

  return templates.map((compounds, index) =>
    createStrategy(`strategy-${index + 1}`, compounds, config.laps),
  );
}
