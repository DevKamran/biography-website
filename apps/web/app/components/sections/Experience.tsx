import { experience } from "@/lib/portfolio-data";

export default function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-2xl font-semibold">Experience</h2>
      <div className="mt-6 space-y-6">
        {experience.map((e) => (
          <div key={`${e.company}-${e.role}`} className="border-l border-neutral-800 pl-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{e.dates}</p>
            <h3 className="mt-1 font-medium">
              {e.role} · {e.company}
            </h3>
            <p className="mt-1 text-sm text-neutral-400">{e.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
