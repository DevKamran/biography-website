import Image from "next/image";
import { ArrowDownRight } from "lucide-react";
import { profile, heroStats, heroTags } from "@/lib/portfolio-data";

function HeroPortrait() {
  return (
    <div className="relative mx-auto aspect-square w-[280px] sm:w-[340px] hero:w-[380px] hero-lg:w-[440px]">
      <div
        className="absolute inset-[6%] rounded-full blur-2xl"
        style={{ backgroundColor: "var(--additional)", opacity: 0.55 }}
      />
      <Image
        src="/img/profile.jpeg"
        alt={profile.name}
        fill
        priority
        sizes="(min-width: 1600px) 440px, (min-width: 1200px) 380px, (min-width: 640px) 340px, 280px"
        className="relative rounded-full object-cover"
      />
    </div>
  );
}

function StatCard({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border px-5 py-4 backdrop-blur-md ${className}`}
      style={{
        backgroundColor: "var(--neutral-transparent)",
        borderColor: "var(--neutral-transparent)",
        boxShadow: "0px 4px 8px 0px rgba(var(--additional-rgb), 0.3)",
      }}
    >
      <p
        className="font-accent text-[44px] font-medium leading-[0.8] tracking-tight sm:text-[50px]"
        style={{ color: "var(--t-bright)" }}
      >
        {value}
      </p>
      <p
        className="w-[140px] whitespace-pre-line text-sm leading-snug sm:w-40 sm:text-[15px]"
        style={{ color: "var(--t-bright)" }}
      >
        {label}
      </p>
    </div>
  );
}

function OpenToWork() {
  return (
    <div
      className="inline-flex items-center gap-3 self-center rounded-full border px-5 py-3 font-accent text-sm sm:text-base hero:absolute hero:-bottom-4 hero:left-1/2 hero:-translate-x-1/2"
      style={{
        backgroundColor: "var(--neutral-transparent)",
        borderColor: "var(--neutral-transparent)",
        color: "var(--t-bright)",
      }}
    >
      <span className="h-[10px] w-[10px] shrink-0 rounded-full" style={{ backgroundColor: "#a1f21e" }} />
      I&apos;m open to work
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full overflow-hidden pt-[110px] sm:pt-[148px] hero:min-h-screen hero:py-24"
    >
      <div className="mx-auto flex max-w-[1800px] flex-col gap-16 px-6 pb-16 sm:px-12 hero:h-full hero:flex-row hero:items-center hero:justify-between hero:gap-12 hero:px-14">
        {/* headline */}
        <div className="relative z-[2] hero:max-w-[640px] hero-lg:max-w-[780px]">
          <p
            className="mb-9 max-w-[500px] font-accent text-[20px] font-medium leading-tight sm:text-[26px]"
            style={{ color: "var(--t-bright)" }}
          >
            {profile.bio}
          </p>

          <h1
            className="select-none whitespace-nowrap font-accent  text-[2.6rem] font-semibold leading-[0.85] tracking-tight xs:text-[3.4rem] sm:text-[6.5rem] md:text-[8rem] hero:text-[8.5rem] hero-lg:text-[10.5rem]"
            style={{ color: "var(--t-bright)" }}
          >
            {profile.name}
          </h1>

          <div className="mt-10 flex flex-wrap gap-2">
            {heroTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex h-8 items-center rounded-full border px-4 font-accent text-sm transition-colors sm:h-9 sm:text-base"
                style={{ borderColor: "var(--st-bright)", color: "var(--t-bright)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* portrait + floating stats */}
        <div className="relative z-[1] mx-auto flex w-full max-w-[380px] shrink-0 flex-col items-center gap-4 hero:mx-0 hero:block hero:w-auto hero:max-w-none">
          <HeroPortrait />

          <StatCard
            value={heroStats[0].value}
            label={heroStats[0].label}
            className="hero:absolute hero:-right-8 hero:bottom-[22%]"
          />

          <OpenToWork />
        </div>
      </div>

      <a
        href="#projects"
        className="absolute bottom-24 right-14 z-[3] hidden items-center gap-2 font-accent text-lg font-medium transition-opacity hover:opacity-70 hero:inline-flex"
        style={{ color: "var(--t-bright)" }}
      >
        Scroll for more
        <ArrowDownRight size={20} />
      </a>
    </section>
  );
}
