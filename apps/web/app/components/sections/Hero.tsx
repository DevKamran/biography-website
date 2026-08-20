import { profile } from "@/lib/portfolio-data";

export default function Hero() {
  return (
    <section id="home" className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center px-6">
      <p className="text-sm uppercase tracking-widest text-blue-400">{profile.location}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">
        {profile.name}
      </h1>
      <p className="mt-2 text-xl text-neutral-400">{profile.title}</p>
      <p className="mt-6 max-w-xl text-neutral-300">{profile.bio}</p>
      <div className="mt-8 flex gap-4">
        <a
          href="#projects"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-500"
        >
          View projects
        </a>
        <a
          href={profile.links.resume}
          className="rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-medium hover:border-neutral-500"
        >
          Resume
        </a>
      </div>
    </section>
  );
}
