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
      <Footer />
    </>
  );
}
