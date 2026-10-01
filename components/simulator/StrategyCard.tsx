import type { CSSProperties } from "react";
import { TYRE_PROFILES } from "@/lib/simulation/constants";
import {
  formatDelta,
  formatDuration,
  formatLapTime,
} from "@/lib/simulation/formatters";
import type { SimulationResult } from "@/lib/simulation/types";

type StrategyCardProps = {
  result: SimulationResult;
  leaderTime: number;
  rank: number;
};

export function StrategyCard({ result, leaderTime, rank }: StrategyCardProps) {
  const delta = result.totalTime - leaderTime;
  const totalStintLaps = result.strategy.stints.reduce(
    (total, stint) => total + stint.laps,
    0,
  );

  return (
    <article
      className="strategy-card rounded-lg border border-zinc-200/80 bg-white p-4 shadow-[0_14px_38px_rgb(24_24_27/6%)] sm:p-5"
      style={{ "--card-index": rank - 1 } as CSSProperties}
    >
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-md bg-zinc-950 font-mono text-sm font-semibold text-white">
              {rank}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Strategy
              </p>
              <h3 className="mt-1 truncate text-xl font-semibold text-zinc-950">
                {result.strategy.name}
              </h3>
            </div>
          </div>
        </div>

        <div className="md:text-right">
          <p className="text-sm font-medium text-zinc-500">Estimated time</p>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-tight text-zinc-950">
            {formatDuration(result.totalTime)}
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-700">
            {formatDelta(delta)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-y border-zinc-100 py-4 sm:grid-cols-3">
        <Metric label="Pit stops" value={String(result.pitStops)} />
        <Metric label="Best lap" value={formatLapTime(result.bestLapTime)} />
        <Metric label="Avg lap" value={formatLapTime(result.averageLapTime)} />
      </div>

      <div className="mt-5 flex overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
        {result.strategy.stints.map((stint, index) => {
          const tyre = TYRE_PROFILES[stint.compound];
          const width = `${(stint.laps / totalStintLaps) * 100}%`;

          return (
            <div
              key={`${result.strategy.id}-${index}`}
              className="min-w-16 border-r border-black/10 px-3 py-2 last:border-r-0"
              style={{ width }}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                <span
                  className={`block size-2.5 rounded-full ${tyre.colorClass}`}
                />
                {tyre.shortLabel}
              </span>
              <span className="mt-1 block text-xs font-medium text-zinc-500">
                {stint.laps} laps
              </span>
            </div>
          );
        })}
      </div>

      {result.warnings.length > 0 ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {result.warnings[0]}
        </div>
      ) : null}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold text-zinc-950">
        {value}
      </p>
    </div>
  );
}
