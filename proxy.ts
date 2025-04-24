import { serve } from "https://deno.land/std@0.223.0/http/server.ts";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";

async function handler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const apiKey = searchParams.get("key") || Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 假设客户端发送到 /v1/chat/completions，转换为 Gemini 的 generateContent 端点
    const payload = await req.json();
    const model = payload.model || "gemini-1.5-flash";
    const geminiUrl = `${GEMINI_API_URL}/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

serve(handler, { port: 8000 });
console.log("Proxy server running on http://localhost:8000");
