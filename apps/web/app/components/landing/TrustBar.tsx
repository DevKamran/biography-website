import { trustBar } from "@/lib/portfolio-data";

export default function TrustBar() {
  return (
    <section
      id="trust"
      className="border-y px-6 py-8 sm:px-12 lg:px-14"
      style={{ borderColor: "var(--color-border-subtle)" }}
    >
      <div className="mx-auto flex max-w-[1728px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <span
            className="font-mono-label text-xs uppercase tracking-widest"
            style={{ color: "var(--color-text-accent)" }}
          >
            {trustBar.currentlyLabel}
          </span>
          <span className="font-accent text-base font-medium sm:text-lg" style={{ color: "var(--color-text-primary)" }}>
            {trustBar.currently}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span
            className="font-mono-label text-xs uppercase tracking-widest"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {trustBar.previouslyLabel}
          </span>
          {trustBar.previously.map((name) => (
            <span key={name} className="font-accent text-sm sm:text-base" style={{ color: "var(--color-text-secondary)" }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
