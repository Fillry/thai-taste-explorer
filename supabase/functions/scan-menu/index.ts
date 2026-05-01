const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TYPHOON_ENDPOINT = "https://api.opentyphoon.ai/v1/chat/completions";
const TYPHOON_MODEL = "typhoon-ocr-v1.5";

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
อ่านทุกรายการอาหารที่อ่านออก แล้ว**ตอบกลับเป็น JSON เท่านั้น** ห้ามมีข้อความอื่นนอก JSON ห้ามใช้ markdown code fence

โครงสร้าง JSON ที่ต้องส่งกลับ:
{
  "unclear": boolean,
  "language": "th" | "en" | "mixed",
  "dishes": [
    {
      "originalText": string,
      "englishName": string,
      "thaiName": string,
      "description": string (1 ประโยคภาษาอังกฤษ),
      "priceText": string (เช่น "120฿" หรือ ""),
      "spicinessLevel": number (0-5),
      "tags": string[] (2-4 คำ เช่น "spicy","seafood","vegetarian","noodles","soup","grilled","rice","dessert"),
      "imageQuery": string (2-4 คำอังกฤษค้น Unsplash เช่น "tom yum soup")
    }
  ]
}

กฎ:
- ดึงเมนูได้สูงสุด 20 รายการ ข้ามหัวข้อหมวดหมู่ และเครื่องดื่มที่ไม่ใช่อาหารจานหลัก
- ถ้ารูปไม่ใช่เมนู หรืออ่านไม่ออกเลย ให้ตั้ง unclear=true และส่ง dishes เป็น array ว่าง
- ตอบเป็น JSON object เดียวเท่านั้น`;

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
              { type: "text", text: "อ่านเมนูในรูปนี้แล้วตอบกลับเป็น JSON ตามโครงสร้างที่กำหนด" },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
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
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error("No content in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "ไม่สามารถอ่านผลลัพธ์ AI ได้ กรุณาลองรูปที่ชัดกว่านี้" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Strip markdown fences if model wraps JSON despite instructions
    const cleaned = content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Find first { and last } to extract JSON object even if model adds prose
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const jsonStr = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parse failed. Raw content:", content);
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
