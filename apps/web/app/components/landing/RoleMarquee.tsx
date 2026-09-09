import { roleMarquee } from "@/lib/portfolio-data";

function MarqueeGroup({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {roleMarquee.map((role, i) => (
        <span key={i} className="flex shrink-0 items-center whitespace-nowrap pr-8 sm:pr-12">
          <span
            className="font-accent text-5xl font-semibold capitalize opacity-50 tracking-tight sm:text-7xl lg:text-[9rem]"
            style={{ color: "var(--color-text-primary)", opacity: 0.6 }}
          >
            {role}
          </span>
          <span
            aria-hidden
            className="pl-8 font-accent text-5xl font-semibold sm:pl-12 sm:text-7xl lg:text-8xl"
            style={{ color: "var(--color-text-accent)" ,opacity: 0.6 }}
          >
            +
          </span>
        </span>
      ))}
    </div>
  );
}

export default function RoleMarquee() {
  return (
    <section
      className="js-marquee overflow-hidden py-10 sm:py-14"
      style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-bg-surface)" }}
    >
      <div className="js-marquee-track js-marquee-track--reverse flex w-max">
        <MarqueeGroup />
        <MarqueeGroup ariaHidden />
      </div>
    </section>
  );
}
