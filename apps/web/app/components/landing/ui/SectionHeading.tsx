export default function SectionHeading({
  eyebrow,
  heading,
  subtitle,
  light = false,
}: {
  eyebrow: string;
  heading: string;
  subtitle?: string;
  light?: boolean;
}) {
  const primary = light ? "var(--color-text-inverse)" : "var(--color-text-primary)";
  const secondary = light ? "color-mix(in srgb, var(--color-text-inverse) 65%, transparent)" : "var(--color-text-secondary)";

  return (
    <div data-reveal className="max-w-2xl">
      <p
        className="mb-3 font-mono-label text-xs uppercase tracking-[0.2em]"
        style={{ color: "var(--color-text-accent)" }}
      >
        {eyebrow}
      </p>
      <h2
        className="font-accent text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
        style={{ color: primary }}
      >
        {heading}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-xl font-sans text-base sm:text-lg" style={{ color: secondary }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
