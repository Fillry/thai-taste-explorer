const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash";

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

    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านอาหารไทย วิเคราะห์รูปอาหารที่ผู้ใช้ส่งมา แล้วเรียกใช้ tool ชื่อ return_dish_analysis พร้อมข้อมูลที่ครบถ้วน

กฎ:
- ถ้ารูปไม่ชัด, ไม่ใช่อาหาร, หรือไม่สามารถระบุได้ ให้ตั้ง unclear=true
- dishName เป็นภาษาอังกฤษ, thaiName เป็นภาษาไทย
- estimatedCalories เป็นตัวเลขประมาณการ (kcal ต่อจาน)
- spicinessLevel เป็นจำนวนเต็ม 1-5 (1=ไม่เผ็ด, 5=เผ็ดมาก)
- allergens และ ingredients เป็นภาษาอังกฤษ
- description เป็นภาษาอังกฤษหนึ่งประโยคสั้นๆ
- confidence 0-100 ตามความมั่นใจในการระบุชนิดอาหาร`;

    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "ระบุอาหารไทยในรูปนี้และส่งคืนผลวิเคราะห์แบบ structured" },
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
                  description: { type: "string", description: "One short sentence in English" },
                },
                required: ["unclear", "dishName", "estimatedCalories", "spicinessLevel", "allergens", "ingredients", "description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_dish_analysis" } },
        max_tokens: 1024,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      const friendly =
        response.status === 429
          ? "ส่งคำขอถี่เกินไป กรุณาลองใหม่อีกสักครู่"
          : response.status === 402
          ? "AI credit หมด กรุณาเติมที่ Settings → Workspace → Usage"
          : "วิเคราะห์รูปไม่สำเร็จ กรุณาลองใหม่";
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
        JSON.stringify({ error: "ไม่สามารถอ่านผลลัพธ์ AI ได้ กรุณาลองรูปที่ชัดกว่านี้" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(argsStr);
    } catch {
      return new Response(
        JSON.stringify({ error: "ไม่สามารถอ่านผลลัพธ์ AI ได้ กรุณาลองรูปที่ชัดกว่านี้" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (parsed?.unclear) {
      return new Response(
        JSON.stringify({ error: "รูปไม่ชัดหรือไม่ใช่อาหาร กรุณาลองใหม่" }),
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
