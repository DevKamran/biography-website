"use client";

import { useEffect } from "react";
import { ensureGsapRegistered } from "./ui/gsap";
import type { BlogPostSummary } from "@/lib/blog-api";

import Header from "./Header";
import Hero from "./Hero";
import ChatAgentFeature from "./ChatAgentFeature";
import TrustBar from "./TrustBar";
import Metrics from "./Metrics";
import SelectedWork from "./SelectedWork";
import RoleMarquee from "./RoleMarquee";
import Capabilities from "./Capabilities";
import TechStack from "./TechStack";
import ExperienceSection from "./ExperienceSection";
import BlogPreview from "./BlogPreview";
import About from "./About";
import CTA from "./CTA";
import Footer from "./Footer";

/**
 * Single parent component for the whole portfolio landing page — every
 * section below is a child, composed in document order. Scroll/GSAP
 * animations are registered once here and driven per-section by the
 * `ui/gsap.ts` hooks (useScrollReveal, useCountUp).
 */
export default function PortfolioLanding({ blogPosts = [] }: { blogPosts?: BlogPostSummary[] }) {
  useEffect(() => {
    ensureGsapRegistered();
  }, []);

  return (
    <>
      <Header />
      {/* Header and Footer sit outside <main> so landmarks are banner / main /
          contentinfo; the skip link in Header targets #main-content (2.4.1). */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <Hero />
      <TrustBar />
      <ChatAgentFeature />
      {/* <Metrics /> */}
      <SelectedWork />
      <RoleMarquee />
      <Capabilities />
      <TechStack />
      <ExperienceSection />
      <BlogPreview posts={blogPosts} />
      <About />
      <CTA />
      </main>
      <Footer />
    </>
  );
}
