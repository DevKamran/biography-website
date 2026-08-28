import { profile } from "@/lib/portfolio-data";

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-2xl font-semibold">Get in touch</h2>
      <p className="mt-3 text-neutral-400">
        Or just ask my chat assistant in the bottom-right corner — it knows my
        background and can point you to the right links.
      </p>
      <div className="mt-6 flex gap-5 text-sm">
        <a href={`mailto:${profile.email}`} className="text-blue-400 hover:underline">
          {profile.email}
        </a>
        <a href={profile.links.github} className="text-neutral-400 hover:underline">
          GitHub
        </a>
        <a href={profile.links.linkedin} className="text-neutral-400 hover:underline">
          LinkedIn
        </a>
      </div>
    </section>
  );
}
