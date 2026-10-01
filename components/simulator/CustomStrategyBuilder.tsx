"use client";

import { TYRE_PROFILES } from "@/lib/simulation/constants";
import type { RaceConfig, Stint, TyreCompound } from "@/lib/simulation/types";

type CustomStrategyBuilderProps = {
  config: RaceConfig;
  stints: Stint[];
  onChange: (stints: Stint[]) => void;
};

const COMPOUNDS: TyreCompound[] = ["soft", "medium", "hard"];

export function CustomStrategyBuilder({
  config,
  stints,
  onChange,
}: CustomStrategyBuilderProps) {
  const plannedLaps = stints.reduce((total, stint) => total + stint.laps, 0);
  const remainingLaps = config.laps - plannedLaps;
  const isValid = remainingLaps === 0;

  function updateStint(index: number, patch: Partial<Stint>) {
    onChange(
      stints.map((stint, stintIndex) =>
        stintIndex === index ? { ...stint, ...patch } : stint,
      ),
    );
  }

  function addStint() {
    if (stints.length >= 4) {
      return;
    }

    onChange([...stints, { compound: "medium", laps: Math.max(1, remainingLaps) }]);
  }

  function removeStint(index: number) {
    if (stints.length <= 1) {
      return;
    }

    onChange(stints.filter((_, stintIndex) => stintIndex !== index));
  }

  function fitToRace() {
    const base = Math.floor(config.laps / stints.length);
    const remainder = config.laps % stints.length;

    onChange(
      stints.map((stint, index) => ({
        ...stint,
        laps: base + (index < remainder ? 1 : 0),
      })),
    );
  }

  return (
    <section className="surface-enter rounded-lg border border-zinc-200/80 bg-white p-4 shadow-[0_16px_44px_rgb(24_24_27/7%)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
            Custom strategy
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Stints
          </h2>
        </div>

        <span
          className={`rounded-md px-3 py-2 text-sm font-semibold ${
            isValid
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {isValid ? "Pronta" : `${remainingLaps} laps`}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {stints.map((stint, index) => {
          const tyre = TYRE_PROFILES[stint.compound];

          return (
            <div
              key={`${stint.compound}-${index}`}
              className="grid gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <span className={`block size-3 rounded-full ${tyre.colorClass}`} />
                  Stint {index + 1}
                </span>
                <button
                  className="pressable rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
                  type="button"
                  onClick={() => removeStint(index)}
                  disabled={stints.length <= 1}
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_92px]">
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    Pneu
                  </span>
                  <select
                    className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition-colors focus:border-red-500"
                    value={stint.compound}
                    onChange={(event) =>
                      updateStint(index, {
                        compound: event.target.value as TyreCompound,
                      })
                    }
                  >
                    {COMPOUNDS.map((compound) => (
                      <option key={compound} value={compound}>
                        {TYRE_PROFILES[compound].label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    Voltas
                  </span>
                  <input
                    className="h-11 rounded-md border border-zinc-200 bg-white px-3 font-mono text-sm font-semibold text-zinc-900 outline-none transition-colors focus:border-red-500"
                    type="number"
                    min={1}
                    max={config.laps}
                    inputMode="numeric"
                    value={stint.laps}
                    onChange={(event) =>
                      updateStint(index, {
                        laps: Math.max(1, Number(event.target.value)),
                      })
                    }
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          className="pressable rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          onClick={addStint}
          disabled={stints.length >= 4}
        >
          Add stint
        </button>
        <button
          className="pressable rounded-md border border-zinc-950 bg-zinc-950 px-3 py-2.5 text-sm font-semibold text-white"
          type="button"
          onClick={fitToRace}
        >
          Fit laps
        </button>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-500">
        A estratégia customizada aparece no ranking quando a soma dos stints
        fecha exatamente {config.laps} voltas.
      </p>
    </section>
  );
}
