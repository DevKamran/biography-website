export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="js-tag inline-flex h-8 items-center rounded-full border px-4 font-mono-label text-xs tracking-wide transition-colors duration-150 sm:h-9 sm:text-sm"
      style={{
        borderColor: "var(--color-border-default)",
        color: "var(--color-text-secondary)",
      }}
    >
      {children}
    </span>
  );
}
