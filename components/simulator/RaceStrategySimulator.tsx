"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_RACE_CONFIG } from "@/lib/simulation/constants";
import { generateStrategies } from "@/lib/simulation/strategy-generator";
import { simulateStrategies } from "@/lib/simulation/simulator";
import type { RaceConfig, Stint, Strategy } from "@/lib/simulation/types";
import { getRaceConfigWarnings } from "@/lib/simulation/validation";
import { formatDelta, formatDuration } from "@/lib/simulation/formatters";
import { CustomStrategyBuilder } from "./CustomStrategyBuilder";
import { SetupWarnings } from "./SetupWarnings";
import { StrategyForm } from "./StrategyForm";
import { StrategyResults } from "./StrategyResults";
import { StrategyTelemetry } from "./StrategyTelemetry";

const STORAGE_KEY = "race-strategy-simulator:v1";

type PersistedSimulatorState = {
  config: RaceConfig;
  customStints: Stint[];
  selectedStrategyId: string | null;
};

function createBalancedStints(laps: number): Stint[] {
  const firstStint = Math.max(1, Math.round(laps * 0.3));
  const secondStint = Math.max(1, Math.round(laps * 0.38));
  const thirdStint = Math.max(1, laps - firstStint - secondStint);

  return [
    { compound: "soft", laps: firstStint },
    { compound: "medium", laps: secondStint },
    { compound: "hard", laps: thirdStint },
  ];
}

function createCustomStrategy(stints: Stint[], raceLaps: number) {
  const plannedLaps = stints.reduce((total, stint) => total + stint.laps, 0);

  if (plannedLaps !== raceLaps) {
    return null;
  }

  return {
    id: "custom-strategy",
    name: `Custom: ${stints
      .map((stint) => stint.compound[0].toUpperCase() + stint.compound.slice(1))
      .join(" -> ")}`,
    stints,
  } satisfies Strategy;
}

function isRaceConfig(value: unknown): value is RaceConfig {
  if (!value || typeof value !== "object") {
    return false;
  }

  const config = value as Record<keyof RaceConfig, unknown>;

  return (
    typeof config.laps === "number" &&
    typeof config.baseLapTime === "number" &&
    typeof config.fuelCapacity === "number" &&
    typeof config.fuelConsumptionPerLap === "number" &&
    typeof config.fuelTimePenaltyPerLiter === "number" &&
    typeof config.tyreWearAggression === "number" &&
    typeof config.pitStopLoss === "number"
  );
}

function isStintList(value: unknown): value is Stint[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(
    (stint) =>
      stint &&
      typeof stint === "object" &&
      ["soft", "medium", "hard"].includes(
        (stint as Record<string, unknown>).compound as string,
      ) &&
      typeof (stint as Record<string, unknown>).laps === "number",
  );
}

function readPersistedState(): PersistedSimulatorState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<PersistedSimulatorState>;

    if (!isRaceConfig(parsed.config) || !isStintList(parsed.customStints)) {
      return null;
    }

    return {
      config: parsed.config,
      customStints: parsed.customStints,
      selectedStrategyId:
        typeof parsed.selectedStrategyId === "string"
          ? parsed.selectedStrategyId
          : null,
    };
  } catch {
    return null;
  }
}

function createDefaultSimulatorState(): PersistedSimulatorState {
  return {
    config: DEFAULT_RACE_CONFIG,
    customStints: createBalancedStints(DEFAULT_RACE_CONFIG.laps),
    selectedStrategyId: null,
  };
}

export function RaceStrategySimulator() {
  const [simulatorState, setSimulatorState] = useState<PersistedSimulatorState>(
    () => readPersistedState() ?? createDefaultSimulatorState(),
  );
  const { config, customStints, selectedStrategyId } = simulatorState;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(simulatorState));
  }, [simulatorState]);

  const results = useMemo(() => {
    const customStrategy = createCustomStrategy(customStints, config.laps);
    const strategies = customStrategy
      ? [customStrategy, ...generateStrategies(config)]
      : generateStrategies(config);

    return simulateStrategies(config, strategies);
  }, [config, customStints]);
  const setupWarnings = useMemo(() => getRaceConfigWarnings(config), [config]);

  const leader = results[0];
  const closestChaser = results[1];
  const selectedResult =
    results.find((result) => result.strategy.id === selectedStrategyId) ??
    leader;

  return (
    <main className="app-shell bg-[#f3f1ed] text-zinc-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <header className="surface-enter overflow-hidden rounded-lg bg-[#111111] text-white shadow-[0_24px_80px_rgb(17_17_17/18%)]">
          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1fr_390px] lg:p-8">
            <div className="flex min-h-[300px] flex-col justify-between gap-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-400">
                  Automobilismo
                </p>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-none text-white sm:text-6xl">
                  Race Strategy Simulator
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
                  Ajuste corrida, pneus, consumo e pit stop para comparar o
                  tempo estimado de cada estratégia em segundos.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricPill label="Race length" value={`${config.laps} laps`} />
                <MetricPill
                  label="Fuel burn"
                  value={`${config.fuelConsumptionPerLap} L/lap`}
                />
                <MetricPill label="Pit loss" value={`${config.pitStopLoss}s`} />
              </div>
            </div>

            {leader ? (
              <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  Melhor leitura
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  {leader.strategy.name}
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  {leader.pitStops} pit stops em {config.laps} voltas.
                </p>

                <div className="mt-8">
                  <p className="text-sm text-zinc-400">Tempo estimado</p>
                  <p className="mt-2 font-mono text-5xl font-semibold tracking-tight text-white">
                    {formatDuration(leader.totalTime)}
                  </p>
                </div>

                <div className="mt-8 rounded-md bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-zinc-400">
                      Proxima estrategia
                    </span>
                    <span className="font-mono text-sm font-semibold text-red-300">
                      {closestChaser
                        ? formatDelta(closestChaser.totalTime - leader.totalTime)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[390px_1fr] lg:items-start">
          <div className="grid gap-5 lg:sticky lg:top-6">
            <StrategyForm
              config={config}
              onChange={(nextConfig) =>
                setSimulatorState((currentState) => ({
                  ...currentState,
                  config: nextConfig,
                }))
              }
            />
            <SetupWarnings messages={setupWarnings} />
            <CustomStrategyBuilder
              config={config}
              stints={customStints}
              onChange={(nextStints) =>
                setSimulatorState((currentState) => ({
                  ...currentState,
                  customStints: nextStints,
                }))
              }
            />
          </div>
          <div className="grid gap-5">
            {selectedResult ? (
              <StrategyTelemetry
                result={selectedResult}
                leaderTime={leader?.totalTime ?? selectedResult.totalTime}
              />
            ) : null}
            <StrategyResults
              results={results}
              selectedStrategyId={selectedResult?.strategy.id ?? null}
              onSelectStrategy={(nextStrategyId) =>
                setSimulatorState((currentState) => ({
                  ...currentState,
                  selectedStrategyId: nextStrategyId,
                }))
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-mono text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
