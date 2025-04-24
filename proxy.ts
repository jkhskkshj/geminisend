import { serve } from "https://deno.land/std@0.223.0/http/server.ts";

async function handler(req: Request): Promise<Response> {
  try {
    console.log(`Received request: ${req.method} ${req.url}`);

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const apiKey = searchParams.get("key") || Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("API key is missing");
      return new Response(JSON.stringify({ error: "API key is required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 构造要发送到自身的请求
    const testUrl = `https://miya-cn-txt.deno.dev/v1/chat/completions?key=${apiKey}`;
    const testPayload = {
      model: "gemini-1.5-flash",
      contents: [
        {
          parts: [
            { text: "Hello" }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7
      }
    };

    console.log("Sending test request to self:", testUrl);
    const testResponse = await fetch(testUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    const testResponseText = await testResponse.text();
    console.log("Test response:", testResponseText);

    // 原有的代理逻辑
    const payload = await req.json();
    const model = payload.model || "gemini-1.5-flash";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    console.log(`Forwarding to Gemini API: ${geminiUrl}`);

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("Gemini API response:", responseText);

    return new Response(responseText, {
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
