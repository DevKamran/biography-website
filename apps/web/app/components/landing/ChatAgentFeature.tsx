"use client";

import Image from "next/image";
import { createRef, useEffect, useRef } from "react";
import gsap from "gsap";
import { Database, FileDown, Mail, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import { profile } from "@/lib/portfolio-data";
import { useChatWidget } from "../chat/ChatWidgetProvider";
import { ensureGsapRegistered, useFloatAnimation, useScrollReveal } from "./ui/gsap";
import SectionHeading from "./ui/SectionHeading";

const features = [
  {
    icon: Database,
    title: "Retrieval-augmented, not improvised",
    description:
      "Every answer is retrieved live from my real resume — chunked and searched section by section (Experience, Education, Skills), then synthesised, never guessed.",
  },
  {
    icon: ShieldCheck,
    title: "Grounded, no hallucinated claims",
    description:
      "A strict guardrail: if the answer isn't in my resume, the assistant says so instead of inventing experience I don't have.",
  },
  {
    icon: Wrench,
    title: "Tool-calling, not just talking",
    description:
      "The assistant can call real functions mid-conversation — not limited to text replies, it can take action on your request.",
  },
  {
    icon: Mail,
    title: "Ask it to email you my resume",
    description: "Say the word and it emails my resume straight to your inbox — no forms, no back-and-forth.",
  },
  {
    icon: FileDown,
    title: "Or grab it as a PDF on the spot",
    description: "Ask for a portfolio or resume PDF and it hands you a download link right in the chat.",
  },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" style={{ backgroundColor: "var(--color-text-tertiary)" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" style={{ backgroundColor: "var(--color-text-tertiary)" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ backgroundColor: "var(--color-text-tertiary)" }} />
    </div>
  );
}

const scenarios = [
  {
    question: "Can you email me your resume?",
    tool: "🔧 calling a tool — emailing resume",
    answer: "Done — sent it straight to your inbox. Anything else you'd like to know about my work?",
  },
  {
    question: "Can I grab your resume as a PDF?",
    tool: "🔧 calling a tool — generating resume PDF",
    answer: "Here's your PDF, ready to download. Want a quick walkthrough of my recent projects too?",
  },
];

function ConversationSlide({
  scenario,
  slideRef,
  userRef,
  typingRef,
  toolRef,
  agentRef,
}: {
  scenario: (typeof scenarios)[number];
  slideRef: React.RefObject<HTMLDivElement>;
  userRef: React.RefObject<HTMLDivElement>;
  typingRef: React.RefObject<HTMLDivElement>;
  toolRef: React.RefObject<HTMLDivElement>;
  agentRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={slideRef} className="absolute inset-4 flex flex-col justify-center gap-3">
      <div ref={userRef} className="flex justify-end">
        <div
          className="max-w-[85%] rounded-xl px-3 py-2 text-sm"
          style={{ backgroundColor: "var(--color-bg-accent)", color: "var(--color-text-on-accent)" }}
        >
          {scenario.question}
        </div>
      </div>

      <div ref={typingRef} className="flex justify-start">
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--color-bg-sunken)" }}>
          <TypingDots />
        </div>
      </div>

      <div ref={toolRef} className="flex justify-start">
        <div
          className="w-fit rounded-full px-3 py-1 font-mono-label text-[11px]"
          style={{ backgroundColor: "var(--color-bg-accent-subtle)", color: "var(--color-text-accent)" }}
        >
          {scenario.tool}
        </div>
      </div>

      <div ref={agentRef} className="flex justify-start">
        <div
          className="max-w-[85%] rounded-xl px-3 py-2 text-sm"
          style={{ backgroundColor: "var(--color-bg-sunken)", color: "var(--color-text-primary)" }}
        >
          {scenario.answer}
        </div>
      </div>
    </div>
  );
}

function MockChatPanel() {
  const floatRef = useFloatAnimation<HTMLDivElement>({ distance: 10, duration: 3 });
  const dotRefs = useRef(scenarios.map(() => createRef<HTMLSpanElement>()));
  const slides = useRef(
    scenarios.map(() => ({
      slide: createRef<HTMLDivElement>(),
      user: createRef<HTMLDivElement>(),
      typing: createRef<HTMLDivElement>(),
      tool: createRef<HTMLDivElement>(),
      agent: createRef<HTMLDivElement>(),
    }))
  );

  useEffect(() => {
    ensureGsapRegistered();
    const refs = slides.current;
    const dots = dotRefs.current.map((d) => d.current);
    if (refs.some((r) => !r.user.current || !r.typing.current || !r.tool.current || !r.agent.current)) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const first = refs[0];
      gsap.set([first.user.current, first.tool.current, first.agent.current], { opacity: 1, y: 0, scale: 1 });
      gsap.set(first.typing.current, { opacity: 0 });
      refs.slice(1).forEach((r) => gsap.set(r.slide.current, { opacity: 0 }));
      return;
    }

    const ctx = gsap.context(() => {
      refs.forEach((r) => {
        gsap.set([r.user.current, r.tool.current, r.agent.current], { opacity: 0, y: 10 });
        gsap.set(r.typing.current, { opacity: 0 });
      });

      const tl = gsap.timeline({ repeat: -1 });

      refs.forEach((r, i) => {
        const { user, typing, tool, agent } = r;
        tl.to(dots[i] ?? {}, { backgroundColor: "var(--color-text-accent)", duration: 0.2 })
          .to(user.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "<")
          .to(typing.current, { opacity: 1, duration: 0.25 }, "+=0.3")
          .to(typing.current, { opacity: 0, duration: 0.2 }, "+=0.7")
          .to(tool.current, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.6)" }, "<")
          .to(typing.current, { opacity: 1, duration: 0.25 }, "+=0.9")
          .to(typing.current, { opacity: 0, duration: 0.2 }, "+=0.6")
          .to(agent.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "<")
          .to(dots[i] ?? {}, { backgroundColor: "var(--color-border-default)", duration: 0.2 }, "+=1.6")
          .to([user.current, tool.current, agent.current, typing.current], { opacity: 0, duration: 0.3 }, "+=0.2");
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={floatRef} className="w-full max-w-md">
      <div
        className="js-card flex flex-col overflow-hidden rounded-2xl border shadow-2xl transition-colors duration-300"
        style={{ backgroundColor: "var(--color-bg-raised)", borderColor: "var(--color-border-default)" }}
      >
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          <span
            className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border"
            style={{ borderColor: "var(--color-border-default)" }}
          >
            <Image src="/img/logo.png" alt={profile.name} fill className="object-cover" />
          </span>
          <div>
            <p className="font-accent text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {profile.name}
            </p>
            <p className="flex items-center gap-1.5 font-mono-label text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
              </span>
              AI assistant · Online
            </p>
          </div>
        </div>

        <div className="relative h-[220px]">
          {scenarios.map((scenario, i) => (
            <ConversationSlide
              key={scenario.question}
              scenario={scenario}
              slideRef={slides.current[i].slide}
              userRef={slides.current[i].user}
              typingRef={slides.current[i].typing}
              toolRef={slides.current[i].tool}
              agentRef={slides.current[i].agent}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 border-t px-4 py-3" style={{ borderColor: "var(--color-border-subtle)" }}>
          {scenarios.map((scenario, i) => (
            <span
              key={scenario.question}
              ref={dotRefs.current[i]}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--color-border-default)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: (typeof features)[number] }) {
  const Icon = feature.icon;
  return (
    <div
      data-reveal
      className="js-card group flex gap-4 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--color-border-subtle)" }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
        style={{ backgroundColor: "var(--color-bg-accent-subtle)", color: "var(--color-text-accent)" }}
      >
        <Icon size={18} />
      </span>
      <div>
        <h3 className="font-accent text-base font-semibold sm:text-lg" style={{ color: "var(--color-text-primary)" }}>
          {feature.title}
        </h3>
        <p className="mt-1 font-sans text-sm leading-relaxed sm:text-base" style={{ color: "var(--color-text-secondary)" }}>
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export default function ChatAgentFeature() {
  const containerRef = useScrollReveal<HTMLDivElement>("[data-reveal]", { stagger: 0.08, y: 32 });
  const { setOpen } = useChatWidget();

  return (
    <section id="ai-assistant" className="px-6 py-24 sm:px-12 lg:px-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
      <div ref={containerRef} className="mx-auto grid max-w-[1728px] grid-cols-1 items-start gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="AI Assistant / RAG + Tool-Calling"
            heading="Talk to my AI, not just my resume"
            subtitle="A retrieval-augmented chat agent trained on my real experience — grounded in fact, and able to act on what you ask for."
          />

          <div className="flex flex-col gap-3">
            {features.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>

          <button
            onClick={() => setOpen(true)}
            data-reveal
            className="js-btn group inline-flex w-fit items-center gap-2.5 rounded-full border px-6 py-3 font-accent text-sm font-semibold shadow-lg transition-all duration-150 hover:scale-[1.03]"
            data-variant="primary"
            style={{
              backgroundColor: "var(--color-bg-accent)",
              color: "var(--color-text-on-accent)",
              borderColor: "var(--color-bg-accent)",
            }}
          >
            <MessageCircle size={16} className="transition-transform duration-200 group-hover:-rotate-12" />
            Try it — ask my AI something
          </button>
        </div>

        <div data-reveal className="flex justify-center lg:sticky lg:top-28 lg:justify-end">
          <div className="w-full max-w-md">
            <MockChatPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
