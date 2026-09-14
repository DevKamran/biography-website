import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[500px] overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(to bottom, var(--color-bg-raised), transparent)",
            maskImage: "linear-gradient(to bottom, black 0%, black 38%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 38%, transparent 100%)",
          }}
        />
        <div className="hero-breathe-layer-a absolute inset-0 opacity-40" />
        <div className="hero-breathe-layer-b absolute inset-0 opacity-30" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-border-strong) 60%, transparent) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>
      <Header />
      <main className="relative z-[1] mx-auto min-h-[60vh] max-w-[1100px] px-5 pb-16 pt-32 sm:px-10 sm:pt-40 lg:px-14">
        {children}
      </main>
      <Footer />
    </>
  );
}
