
# เปลี่ยน scan-food และ scan-menu ไปใช้ Typhoon Vision

## สรุปการตัดสินใจ
- เรียก Typhoon API ตรงๆ ผ่าน `fetch` (ไม่ใช้ LangChain)
- เพิ่ม secret ใหม่: `TYPHOON_API_KEY`
- ใช้ `typhoon-v2-vision` ทั้ง scan-food และ scan-menu

## ขั้นตอน

### 1. ขอ secret จากผู้ใช้
ขอ `TYPHOON_API_KEY` ผ่าน secret form  
ผู้ใช้ไปที่ https://playground.opentyphoon.ai/ → Settings → API Keys → Create new key

### 2. แก้ `supabase/functions/scan-food/index.ts`
- เปลี่ยน endpoint: `https://ai.gateway.lovable.dev/v1/chat/completions` → `https://api.opentyphoon.ai/v1/chat/completions`
- เปลี่ยน env: `LOVABLE_API_KEY` → `TYPHOON_API_KEY`
- เปลี่ยน model: `google/gemini-2.5-flash` → `typhoon-v2-vision`
- ปรับ system prompt เป็นภาษาไทย (Typhoon ทำงานดีกว่ามากเมื่อ prompt เป็นไทย)
- คง schema tool calling เดิมไว้ (`return_dish_analysis`) — Typhoon รองรับ OpenAI tool calling
- ปรับข้อความ error 402/429 ให้ชี้ไปที่ Typhoon Playground

### 3. แก้ `supabase/functions/scan-menu/index.ts`
- เปลี่ยนเหมือนข้อ 2 ทุกอย่าง
- system prompt ภาษาไทยเน้นการ OCR เมนูและแปล/อธิบายเป็นอังกฤษ
- คง schema `return_menu_analysis` เดิม

### 4. Deploy + ทดสอบ
- Deploy ทั้ง 2 functions
- ทดสอบด้วยรูปจริงจาก UI (LensScreen)
- ดู logs ถ้ามี error

## Fallback ถ้า Typhoon vision ไม่เสถียร
ถ้าผลทดสอบออกมาไม่ดี (เช่น tool calling ไม่ทำงาน, accuracy ต่ำ) ผมจะแจ้งและเสนอทางเลือก เช่นกลับไป Gemini สำหรับ scan-food

## ที่ไม่เปลี่ยน
- Frontend (`LensScreen.tsx`) — ไม่ต้องแก้ เพราะยังเรียกผ่าน `supabase.functions.invoke()` เหมือนเดิม
- `LOVABLE_API_KEY` ยังคงอยู่ใน secrets เผื่อใช้ในอนาคต
