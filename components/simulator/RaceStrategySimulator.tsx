"use client";

import { useMemo, useState } from "react";
import { DEFAULT_RACE_CONFIG } from "@/lib/simulation/constants";
import { generateStrategies } from "@/lib/simulation/strategy-generator";
import { simulateStrategies } from "@/lib/simulation/simulator";
import type { RaceConfig, Stint, Strategy } from "@/lib/simulation/types";
import { formatDelta, formatDuration } from "@/lib/simulation/formatters";
import { CustomStrategyBuilder } from "./CustomStrategyBuilder";
import { StrategyForm } from "./StrategyForm";
import { StrategyResults } from "./StrategyResults";
import { StrategyTelemetry } from "./StrategyTelemetry";

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

export function RaceStrategySimulator() {
  const [config, setConfig] = useState<RaceConfig>(DEFAULT_RACE_CONFIG);
  const [customStints, setCustomStints] = useState<Stint[]>(() =>
    createBalancedStints(DEFAULT_RACE_CONFIG.laps),
  );

  const results = useMemo(() => {
    const customStrategy = createCustomStrategy(customStints, config.laps);
    const strategies = customStrategy
      ? [customStrategy, ...generateStrategies(config)]
      : generateStrategies(config);

    return simulateStrategies(config, strategies);
  }, [config, customStints]);

  const leader = results[0];
  const closestChaser = results[1];

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
            <StrategyForm config={config} onChange={setConfig} />
            <CustomStrategyBuilder
              config={config}
              stints={customStints}
              onChange={setCustomStints}
            />
          </div>
          <div className="grid gap-5">
            {leader ? <StrategyTelemetry result={leader} /> : null}
            <StrategyResults results={results} />
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
