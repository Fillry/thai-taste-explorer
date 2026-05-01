const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageDataUrl } = await req.json();
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return new Response(JSON.stringify({ error: "imageDataUrl is required" }), {
        status: 400,
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

    const systemPrompt = `You are a Thai food expert. Analyze the dish in the image and call the return_dish_analysis tool with the structured data. If the image is unclear or not food, set "unclear" to true.`;

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
              { type: "text", text: "Identify this Thai dish and return structured analysis." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_dish_analysis",
              description: "Return structured analysis of the dish in the image.",
              parameters: {
                type: "object",
                properties: {
                  unclear: { type: "boolean", description: "True if image is unclear or not food" },
                  dishName: { type: "string" },
                  thaiName: { type: "string" },
                  estimatedCalories: { type: "number" },
                  spicinessLevel: { type: "number", description: "1-5 integer" },
                  allergens: { type: "array", items: { type: "string" } },
                  ingredients: { type: "array", items: { type: "string" } },
                  confidence: { type: "number", description: "0-100" },
                  description: { type: "string", description: "One short sentence" },
                },
                required: ["unclear", "dishName", "estimatedCalories", "spicinessLevel", "allergens", "ingredients", "description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_dish_analysis" } },
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
          : "Failed to analyze image.";
      return new Response(JSON.stringify({ error: friendly }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;

    if (!argsStr) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Could not parse AI response. Try a clearer photo." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(argsStr);
    } catch {
      return new Response(
        JSON.stringify({ error: "Could not parse AI response. Try a clearer photo." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (parsed?.unclear) {
      return new Response(
        JSON.stringify({ error: "Image is unclear or not a recognizable dish. Try again." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-food error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
