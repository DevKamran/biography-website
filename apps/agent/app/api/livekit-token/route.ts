import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

// Must match the `agent_name` the Python worker registers with (see apps/agent/agent.py)
const AGENT_NAME = "portfolio-agent";

// Visitors get a random identity per session so we don't need accounts.
function randomIdentity() {
  return "visitor-" + Math.random().toString(36).slice(2, 10);
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return NextResponse.json(
      { error: "LiveKit environment variables are not configured on the server." },
      { status: 500 }
    );
  }

  const identity = randomIdentity();
  // A dedicated room per visitor session keeps conversations isolated.
  const room = `portfolio-chat-${identity}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: "1h",
  });

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();

  // Explicitly dispatch the agent into this visitor's room so it joins
  // and starts listening for chat messages right away.
  try {
    const dispatchClient = new AgentDispatchClient(
      livekitUrl.replace("wss://", "https://").replace("ws://", "http://"),
      apiKey,
      apiSecret
    );
    await dispatchClient.createDispatch(room, AGENT_NAME, {});
  } catch (err) {
    console.error("Failed to dispatch agent:", err);
    // Non-fatal: the room/token is still returned so the UI can show an error state.
  }

  return NextResponse.json({
    token,
    url: livekitUrl,
    room,
    identity,
  });
}
