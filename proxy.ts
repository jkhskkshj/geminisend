import { serve } from "https://deno.land/std/http/server.ts";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const API_KEY = Deno.env.get("GEMINI_API_KEY") || "your-api-key-here";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  const geminiUrl = `${GEMINI_API_URL}${path}?key=${API_KEY}`;

  const response = await fetch(geminiUrl, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

serve(handler, { port: 8000 });
console.log("Proxy server running on http://localhost:8000");