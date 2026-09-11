import PortfolioLanding from "./components/landing/PortfolioLanding";
import Preloader from "./components/landing/Preloader";
import ChatWidget from "./components/chat/ChatWidget";
import { ChatWidgetProvider } from "./components/chat/ChatWidgetProvider";

export default function Home() {
  return (
    <ChatWidgetProvider>
      <Preloader />
      <main>
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[500px] overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(to bottom, var(--color-bg-raised), transparent)",
              maskImage: "linear-gradient(to bottom, black 0%, black 38%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 38%, transparent 100%)",
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
        <PortfolioLanding />
        <ChatWidget />
      </main>
    </ChatWidgetProvider>
  );
}
