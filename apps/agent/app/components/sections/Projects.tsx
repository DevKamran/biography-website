import { projects } from "@/lib/portfolio-data";

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-2xl font-semibold">Projects</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <div
            key={p.name}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
          >
            <h3 className="font-medium">{p.name}</h3>
            <p className="mt-2 text-sm text-neutral-400">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tech.map((t) => (
                <span key={t} className="text-xs text-blue-400">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-3 text-sm">
              {p.link && (
                <a href={p.link} className="text-blue-400 hover:underline">
                  Live →
                </a>
              )}
              {p.repo && (
                <a href={p.repo} className="text-neutral-400 hover:underline">
                  Code →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
