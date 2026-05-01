const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

async function authenticate(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
    });
    if (!res.ok) return false;
    const user = await res.json();
    return !!user?.id;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!(await authenticate(req))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageDataUrl } = await req.json();
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return new Response(JSON.stringify({ error: "imageDataUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (imageDataUrl.length > MAX_PAYLOAD_BYTES) {
      return new Response(JSON.stringify({ error: "Image too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert OCR + Thai food translator. The user uploads a photo of a restaurant menu (often in Thai). Read every legible dish entry and call return_menu_analysis with the structured list.

Rules:
- Extract up to 20 dishes max. Skip section headers, drinks-only sections if not dishes, and prices.
- For each dish provide: original text exactly as printed (originalText), englishName (concise), thaiName if present, a one-sentence English description, an estimated price if visible (priceText, e.g. "120฿") else empty string, spicinessLevel 0-5, and 2-4 short tags (e.g. "spicy","seafood","vegetarian","noodles","soup","grilled","rice","dessert").
- Also produce imageQuery: 2-4 simple English words optimized for an Unsplash photo search of that dish (e.g. "tom yum soup", "pad thai noodles").
- If image is not a menu or unreadable, set unclear=true and return empty dishes array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Read this menu and return the structured analysis." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_menu_analysis",
              description: "Return structured analysis of every dish on the menu image.",
              parameters: {
                type: "object",
                properties: {
                  unclear: { type: "boolean" },
                  language: { type: "string", description: "Detected primary language, e.g. 'th', 'en', 'mixed'" },
                  dishes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        originalText: { type: "string" },
                        englishName: { type: "string" },
                        thaiName: { type: "string" },
                        description: { type: "string" },
                        priceText: { type: "string" },
                        spicinessLevel: { type: "number" },
                        tags: { type: "array", items: { type: "string" } },
                        imageQuery: { type: "string" },
                      },
                      required: ["englishName", "description", "spicinessLevel", "tags", "imageQuery"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["unclear", "language", "dishes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_menu_analysis" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      const friendly =
        response.status === 429
          ? "Too many requests, please try again in a moment."
          : response.status === 402
          ? "AI credits exhausted. Add funds in Settings → Workspace → Usage."
          : "Failed to analyze menu image.";
      return new Response(JSON.stringify({ error: friendly }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const argsStr = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!argsStr) {
      console.error("No tool call:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Could not parse AI response. Try a clearer photo." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(argsStr);
    } catch {
      return new Response(JSON.stringify({ error: "Could not parse AI response. Try a clearer photo." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (parsed?.unclear || !Array.isArray(parsed?.dishes) || parsed.dishes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Couldn't read menu. Try a clearer, well-lit photo." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-menu error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
