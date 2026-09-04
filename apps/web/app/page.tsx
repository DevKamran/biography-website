import PortfolioLanding from "./components/landing/PortfolioLanding";
import ChatWidget from "./components/chat/ChatWidget";
import { ChatWidgetProvider } from "./components/chat/ChatWidgetProvider";

export default function Home() {
  return (
    <ChatWidgetProvider>
      <main>
        <PortfolioLanding />
        <ChatWidget />
      </main>
    </ChatWidgetProvider>
  );
}
