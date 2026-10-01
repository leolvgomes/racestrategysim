import type { SimulationResult } from "@/lib/simulation/types";
import { StrategyCard } from "./StrategyCard";

type StrategyResultsProps = {
  results: SimulationResult[];
  selectedStrategyId: string | null;
  onSelectStrategy: (strategyId: string) => void;
};

export function StrategyResults({
  results,
  selectedStrategyId,
  onSelectStrategy,
}: StrategyResultsProps) {
  const leaderTime = results[0]?.totalTime ?? 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
            Simulation output
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Ranked strategies
          </h2>
        </div>
        <p className="text-sm font-medium text-zinc-500">
          {results.length} estrategias simuladas
        </p>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <StrategyCard
            key={result.strategy.id}
            result={result}
            leaderTime={leaderTime}
            rank={index + 1}
            isSelected={result.strategy.id === selectedStrategyId}
            isLeader={index === 0}
            onSelect={() => onSelectStrategy(result.strategy.id)}
          />
        ))}
      </div>
    </section>
  );
}
