import { skills } from "@/lib/portfolio-data";

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-2xl font-semibold">Skills</h2>
      <div className="mt-6 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
