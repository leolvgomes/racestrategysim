"use client";

import { DEFAULT_RACE_CONFIG } from "@/lib/simulation/constants";
import type { RaceConfig } from "@/lib/simulation/types";

type StrategyFormProps = {
  config: RaceConfig;
  onChange: (config: RaceConfig) => void;
};

type NumberField = {
  key: keyof RaceConfig;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
};

const FIELDS: NumberField[] = [
  {
    key: "laps",
    label: "Voltas",
    description: "Distancia total da prova",
    min: 5,
    max: 100,
    step: 1,
    suffix: "laps",
  },
  {
    key: "baseLapTime",
    label: "Tempo base",
    description: "Volta limpa com tanque leve",
    min: 45,
    max: 150,
    step: 0.1,
    suffix: "s",
  },
  {
    key: "fuelCapacity",
    label: "Tanque",
    description: "Limite de combustivel disponivel",
    min: 20,
    max: 130,
    step: 1,
    suffix: "L",
  },
  {
    key: "fuelConsumptionPerLap",
    label: "Consumo",
    description: "Quanto o carro queima por volta",
    min: 0.5,
    max: 5,
    step: 0.01,
    suffix: "L/lap",
  },
  {
    key: "fuelTimePenaltyPerLiter",
    label: "Peso do combustível",
    description: "Custo de tempo por litro carregado",
    min: 0,
    max: 0.08,
    step: 0.001,
    suffix: "s/L",
  },
  {
    key: "tyreWearAggression",
    label: "Desgaste",
    description: "Agressividade da pista nos pneus",
    min: 0.2,
    max: 2.5,
    step: 0.05,
    suffix: "x",
  },
  {
    key: "pitStopLoss",
    label: "Pit stop",
    description: "Tempo perdido no box",
    min: 10,
    max: 40,
    step: 0.1,
    suffix: "s",
  },
];

export function StrategyForm({ config, onChange }: StrategyFormProps) {
  function updateField(key: keyof RaceConfig, value: number) {
    onChange({
      ...config,
      [key]: value,
    });
  }

  return (
    <section className="surface-enter rounded-lg border border-zinc-200/80 bg-white p-4 shadow-[0_16px_44px_rgb(24_24_27/7%)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
            Race setup
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Parametros
          </h2>
        </div>

        <button
          className="pressable rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700"
          type="button"
          onClick={() => onChange(DEFAULT_RACE_CONFIG)}
        >
          Reset
        </button>
      </div>

      <div className="mt-6 grid gap-5">
        {FIELDS.map((field) => (
          <label key={field.key} className="grid gap-3">
            <span className="grid gap-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-zinc-800">
                  {field.label}
                </span>
                <span className="font-mono text-sm font-semibold text-zinc-950">
                  {config[field.key]} {field.suffix}
                </span>
              </span>
              <span className="text-sm leading-5 text-zinc-500">
                {field.description}
              </span>
            </span>
            <input
              className="range-control h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={config[field.key]}
              onChange={(event) =>
                updateField(field.key, Number(event.target.value))
              }
            />
          </label>
        ))}
      </div>
    </section>
  );
}
