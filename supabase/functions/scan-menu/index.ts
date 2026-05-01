const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TYPHOON_ENDPOINT = "https://api.opentyphoon.ai/v1/chat/completions";
const TYPHOON_MODEL = "typhoon-v2-vision";

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

    const TYPHOON_API_KEY = Deno.env.get("TYPHOON_API_KEY");
    if (!TYPHOON_API_KEY) {
      return new Response(JSON.stringify({ error: "TYPHOON_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้าน OCR และล่ามอาหารไทย ผู้ใช้ส่งรูปเมนูร้านอาหาร (ส่วนใหญ่เป็นภาษาไทย) มาให้
อ่านทุกรายการอาหารที่อ่านออก แล้วเรียก tool return_menu_analysis พร้อมข้อมูลแบบ structured

กฎ:
- ดึงเมนูได้สูงสุด 20 รายการ ข้ามหัวข้อหมวดหมู่ และเครื่องดื่มที่ไม่ใช่อาหารจานหลัก
- แต่ละรายการต้องมี:
  - originalText: ข้อความต้นฉบับตามที่พิมพ์บนเมนู
  - englishName: ชื่ออังกฤษกระชับ
  - thaiName: ชื่อไทย (ถ้ามี)
  - description: คำอธิบายภาษาอังกฤษ 1 ประโยค
  - priceText: ราคา (เช่น "120฿") หรือ string ว่างถ้าไม่เห็น
  - spicinessLevel: 0-5
  - tags: 2-4 คำ (เช่น "spicy","seafood","vegetarian","noodles","soup","grilled","rice","dessert")
  - imageQuery: 2-4 คำภาษาอังกฤษเหมาะกับค้นรูปบน Unsplash (เช่น "tom yum soup", "pad thai noodles")
- ถ้ารูปไม่ใช่เมนู หรืออ่านไม่ออกเลย ให้ตั้ง unclear=true และส่ง dishes เป็น array ว่าง`;

    const response = await fetch(TYPHOON_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TYPHOON_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TYPHOON_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "อ่านเมนูในรูปนี้แล้วส่งผลวิเคราะห์แบบ structured" },
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
        max_tokens: 4096,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Typhoon API error:", response.status, errText);
      const friendly =
        response.status === 429
          ? "ส่งคำขอถี่เกินไป กรุณาลองใหม่อีกสักครู่"
          : response.status === 401
          ? "Typhoon API key ไม่ถูกต้องหรือหมดอายุ"
          : response.status === 402
          ? "Typhoon credit หมด กรุณาเติมที่ playground.opentyphoon.ai"
          : "วิเคราะห์เมนูไม่สำเร็จ กรุณาลองใหม่";
      return new Response(JSON.stringify({ error: friendly }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const argsStr = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!argsStr) {
      console.error("No tool call:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "ไม่สามารถอ่านผลลัพธ์ AI ได้ กรุณาลองรูปที่ชัดกว่านี้" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(argsStr);
    } catch {
      return new Response(JSON.stringify({ error: "ไม่สามารถอ่านผลลัพธ์ AI ได้ กรุณาลองรูปที่ชัดกว่านี้" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (parsed?.unclear || !Array.isArray(parsed?.dishes) || parsed.dishes.length === 0) {
      return new Response(
        JSON.stringify({ error: "อ่านเมนูไม่ออก กรุณาถ่ายใหม่ให้ชัดและมีแสงเพียงพอ" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-menu error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
