export default function StatusBadge({ label, live = true }: { label: string; live?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono-label text-xs uppercase tracking-wider"
      style={{
        borderColor: "var(--color-border-default)",
        color: "var(--color-text-secondary)",
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: live ? "var(--color-status-live)" : "var(--color-text-tertiary)",
          boxShadow: live ? "0 0 0 3px color-mix(in srgb, var(--color-status-live) 25%, transparent)" : "none",
        }}
      />
      {label}
    </span>
  );
}
