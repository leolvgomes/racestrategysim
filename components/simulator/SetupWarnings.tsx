import type { ValidationMessage } from "@/lib/simulation/validation";

type SetupWarningsProps = {
  messages: ValidationMessage[];
};

export function SetupWarnings({ messages }: SetupWarningsProps) {
  if (messages.length === 0) {
    return (
      <section className="surface-enter rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-[0_16px_44px_rgb(24_24_27/5%)]">
        <p className="text-sm font-semibold">Setup consistente</p>
        <p className="mt-1 text-sm leading-6 text-emerald-800">
          Combustivel, pit stop e desgaste estao dentro de uma faixa segura para
          comparar estrategias.
        </p>
      </section>
    );
  }

  return (
    <section className="surface-enter rounded-lg border border-amber-200 bg-white p-4 shadow-[0_16px_44px_rgb(24_24_27/7%)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
        Validation
      </p>
      <div className="mt-3 grid gap-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-md border p-3 ${
              message.tone === "danger"
                ? "border-red-200 bg-red-50 text-red-950"
                : "border-amber-200 bg-amber-50 text-amber-950"
            }`}
          >
            <p className="text-sm font-semibold">{message.title}</p>
            <p className="mt-1 text-sm leading-6 opacity-80">
              {message.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
