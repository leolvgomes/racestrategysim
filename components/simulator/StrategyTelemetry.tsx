import { TYRE_PROFILES } from "@/lib/simulation/constants";
import { formatDelta, formatLapTime } from "@/lib/simulation/formatters";
import type { SimulationResult } from "@/lib/simulation/types";

type StrategyTelemetryProps = {
  result: SimulationResult;
  leaderTime: number;
};

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = 28;

export function StrategyTelemetry({ result, leaderTime }: StrategyTelemetryProps) {
  const lapTimes = result.laps.map((lap) => lap.lapTime);
  const minTime = Math.min(...lapTimes);
  const maxTime = Math.max(...lapTimes);
  const paddedMin = minTime - 0.4;
  const paddedMax = maxTime + 0.4;
  const range = Math.max(0.1, paddedMax - paddedMin);
  const usableWidth = WIDTH - PADDING * 2;
  const usableHeight = HEIGHT - PADDING * 2;
  const points = result.laps
    .map((lap, index) => {
      const x =
        PADDING +
        (index / Math.max(1, result.laps.length - 1)) * usableWidth;
      const y =
        PADDING +
        ((paddedMax - lap.lapTime) / range) * usableHeight;

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const finalLap = result.laps[result.laps.length - 1];
  const deltaToLeader = result.totalTime - leaderTime;
  const stintSummaries = result.strategy.stints.map((stint, stintIndex) => {
    const stintLaps = result.laps.filter((lap) => lap.stintIndex === stintIndex);
    const stintLapTimes = stintLaps.map((lap) => lap.lapTime);
    const firstLap = stintLaps[0];
    const lastLap = stintLaps[stintLaps.length - 1];
    const totalLapTime = stintLapTimes.reduce((total, time) => total + time, 0);
    const averageLapTime = totalLapTime / Math.max(1, stintLapTimes.length);
    const tyreWearDelta =
      lastLap && firstLap
        ? lastLap.tyreWearPenalty - firstLap.tyreWearPenalty
        : 0;

    return {
      stint,
      stintIndex,
      averageLapTime,
      bestLapTime: Math.min(...stintLapTimes),
      worstLapTime: Math.max(...stintLapTimes),
      tyreWearDelta,
      fromLap: firstLap?.lap ?? 0,
      toLap: lastLap?.lap ?? 0,
    };
  });

  return (
    <section className="surface-enter rounded-lg border border-zinc-200/80 bg-white p-4 shadow-[0_16px_44px_rgb(24_24_27/7%)] sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
            Telemetry
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Lap time trace
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Estratégia selecionada: {result.strategy.name}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium text-zinc-500">Range</p>
          <p className="mt-1 font-mono text-lg font-semibold text-zinc-950">
            {formatLapTime(minTime)} - {formatLapTime(maxTime)}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-zinc-200 bg-zinc-950 p-3">
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`Grafico de tempo por volta da estrategia ${result.strategy.name}`}
        >
          <g opacity="0.24">
            {[0, 1, 2, 3].map((line) => {
              const y = PADDING + (line / 3) * usableHeight;

              return (
                <line
                  key={line}
                  x1={PADDING}
                  x2={WIDTH - PADDING}
                  y1={y}
                  y2={y}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              );
            })}
          </g>
          <polyline
            fill="none"
            points={points}
            stroke="#ef4444"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          {result.laps.map((lap, index) => {
            const x =
              PADDING +
              (index / Math.max(1, result.laps.length - 1)) * usableWidth;
            const y =
              PADDING +
              ((paddedMax - lap.lapTime) / range) * usableHeight;

            if (index % Math.max(1, Math.floor(result.laps.length / 14)) !== 0) {
              return null;
            }

            return (
              <circle
                key={lap.lap}
                cx={x}
                cy={y}
                fill="#fef2f2"
                r="3.5"
                stroke="#ef4444"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <TelemetryMetric label="Vs best" value={formatDelta(deltaToLeader)} />
        <TelemetryMetric
          label="Final fuel"
          value={`${finalLap?.fuelLoad.toFixed(1) ?? "0.0"} L`}
        />
        <TelemetryMetric
          label="Worst lap"
          value={formatLapTime(result.worstLapTime)}
        />
      </div>

      <div className="mt-3">
        <TelemetryMetric
          label="Stints"
          value={result.strategy.stints
            .map((stint) => TYRE_PROFILES[stint.compound].shortLabel)
            .join(" / ")}
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-zinc-200">
        <div className="grid grid-cols-[1.2fr_0.8fr_1fr_1fr] gap-3 bg-zinc-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
          <span>Stint</span>
          <span>Laps</span>
          <span>Avg</span>
          <span>Wear</span>
        </div>
        <div className="divide-y divide-zinc-100">
          {stintSummaries.map((summary) => {
            const tyre = TYRE_PROFILES[summary.stint.compound];

            return (
              <div
                key={`${summary.stint.compound}-${summary.stintIndex}`}
                className="grid grid-cols-[1.2fr_0.8fr_1fr_1fr] gap-3 px-3 py-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2 font-semibold text-zinc-950">
                  <span className={`block size-2.5 rounded-full ${tyre.colorClass}`} />
                  <span className="truncate">{tyre.label}</span>
                </span>
                <span className="font-mono text-zinc-600">
                  {summary.fromLap}-{summary.toLap}
                </span>
                <span className="font-mono font-semibold text-zinc-950">
                  {formatLapTime(summary.averageLapTime)}
                </span>
                <span className="font-mono text-zinc-600">
                  +{summary.tyreWearDelta.toFixed(2)}s
                </span>
                <span className="col-span-4 text-xs text-zinc-500">
                  Best {formatLapTime(summary.bestLapTime)} / Worst{" "}
                  {formatLapTime(summary.worstLapTime)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TelemetryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold text-zinc-950">
        {value}
      </p>
    </div>
  );
}
