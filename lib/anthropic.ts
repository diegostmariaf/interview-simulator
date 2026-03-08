import Anthropic from "@anthropic-ai/sdk";

// Create a single Anthropic client instance reused across all API routes.
// The API key is read from the environment variable ANTHROPIC_API_KEY,
// which you set in your Vercel project settings (or in .env.local locally).
// It is never exposed to the browser — this file only runs on the server.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default anthropic;
