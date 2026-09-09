import PortfolioLanding from "./components/landing/PortfolioLanding";
import Preloader from "./components/landing/Preloader";
import ChatWidget from "./components/chat/ChatWidget";
import { ChatWidgetProvider } from "./components/chat/ChatWidgetProvider";

export default function Home() {
  return (
    <ChatWidgetProvider>
      <Preloader />
      <main>
        <PortfolioLanding />
        <ChatWidget />
      </main>
    </ChatWidgetProvider>
  );
}
