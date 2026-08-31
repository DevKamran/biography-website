"use client";

import { useEffect } from "react";
import { ensureGsapRegistered } from "./ui/gsap";

import Header from "./Header";
import Hero from "./Hero";
import TrustBar from "./TrustBar";
import Metrics from "./Metrics";
import SelectedWork from "./SelectedWork";
import Capabilities from "./Capabilities";
import TechStack from "./TechStack";
import ExperienceSection from "./ExperienceSection";
import About from "./About";
import CTA from "./CTA";
import Footer from "./Footer";

/**
 * Single parent component for the whole portfolio landing page — every
 * section below is a child, composed in document order. Scroll/GSAP
 * animations are registered once here and driven per-section by the
 * `ui/gsap.ts` hooks (useScrollReveal, useCountUp).
 */
export default function PortfolioLanding() {
  useEffect(() => {
    ensureGsapRegistered();
  }, []);

  return (
    <>
      <Header />
      <Hero />
      <TrustBar />
      <Metrics />
      <SelectedWork />
      <Capabilities />
      <TechStack />
      <ExperienceSection />
      <About />
      <CTA />
      <Footer />
    </>
  );
}
