import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Camera, FileText, Zap, AlertTriangle, Leaf, Languages } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";

type Mode = "food" | "menu";

const foodResult = {
  name: "Pad Krapow Moo",
  thaiName: "ผัดกะเพราหมู",
  confidence: 96,
  calories: 540,
  ingredients: ["Minced pork", "Holy basil", "Garlic", "Bird's eye chili", "Fish sauce", "Soy sauce", "Oyster sauce"],
  warnings: ["Contains soy", "Possible peanut oil — confirm with vendor"],
  spice: 3,
};

const menuResult = [
  { thai: "ต้มยำกุ้ง", eng: "Tom Yum Goong", desc: "Spicy & sour shrimp soup with lemongrass." },
  { thai: "ส้มตำไทย", eng: "Som Tam Thai", desc: "Green papaya salad with peanuts, lime, dried shrimp." },
  { thai: "ข้าวผัดปู", eng: "Khao Pad Pu", desc: "Crab fried rice, mild." },
];

export const LensScreen = () => {
  const [mode, setMode] = useState<Mode>("food");
  const [scanning, setScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const startScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setShowResult(true);
    }, 2200);
  };

  return (
    <div className="relative h-full overflow-hidden bg-accent">
      {/* Mock viewfinder background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1559314809-0d155014e29e?w=900&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-accent/60 via-accent/10 to-accent/90" />

      {/* Header */}
      <header className="relative z-10 px-5 pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/80">AI Lens</p>
        <h1 className="text-2xl font-bold text-primary-foreground">Point. Scan. Eat safely.</h1>

        {/* Mode toggle */}
        <div className="mt-4 inline-flex rounded-full glass-dark p-1">
          {(["food", "menu"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all focus:outline-none ${
                mode === m
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              {m === "food" ? <Camera className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              {m === "food" ? "Food Scan" : "Menu Scan"}
            </button>
          ))}
        </div>
      </header>

      {/* Viewfinder frame */}
      <div className="absolute inset-x-8 top-44 bottom-44 z-10">
        <div className="relative h-full w-full">
          {[
            "top-0 left-0 border-l-4 border-t-4 rounded-tl-2xl",
            "top-0 right-0 border-r-4 border-t-4 rounded-tr-2xl",
            "bottom-0 left-0 border-l-4 border-b-4 rounded-bl-2xl",
            "bottom-0 right-0 border-r-4 border-b-4 rounded-br-2xl",
          ].map((c, i) => (
            <div key={i} className={`absolute h-10 w-10 border-primary ${c}`} />
          ))}

          {/* Scan line */}
          <AnimatePresence>
            {scanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 overflow-hidden rounded-2xl"
              >
                <motion.div
                  initial={{ y: "-100%" }}
                  animate={{ y: "100%" }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-glow"
                />
                <div className="absolute inset-0 bg-primary/10" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center hint */}
          {!scanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full glass px-3 py-1.5 text-[11px] font-medium text-foreground"
            >
              {mode === "food" ? "Frame the dish" : "Frame the menu text"}
            </motion.div>
          )}
        </div>
      </div>

      {/* Capture button */}
      <div className="absolute inset-x-0 bottom-32 z-10 flex flex-col items-center gap-2">
        <p className="text-[11px] font-medium text-primary-foreground/80">
          {scanning ? "AI analyzing…" : "Tap to scan"}
        </p>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={startScan}
          disabled={scanning}
          className="relative flex h-18 w-18 items-center justify-center rounded-full bg-primary-foreground p-1 shadow-glow focus:outline-none focus:ring-4 focus:ring-primary/40 disabled:opacity-70"
          style={{ height: 72, width: 72 }}
        >
          {scanning && (
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary" />
          )}
          <span className="flex h-full w-full items-center justify-center rounded-full gradient-spice">
            <Zap className="h-7 w-7 text-primary-foreground" fill="currentColor" />
          </span>
        </motion.button>
        <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">
          Powered by Vision AI
        </p>
      </div>

      {/* Result Sheet */}
      <BottomSheet
        open={showResult}
        onClose={() => setShowResult(false)}
        title={mode === "food" ? "Scan Result" : "Menu Translation"}
      >
        {mode === "food" ? (
          <div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/10 px-3 py-2">
              <Sparkles_local /> 
              <p className="text-xs font-semibold text-secondary">
                {foodResult.confidence}% identified
              </p>
            </div>
            <h3 className="mt-3 text-xl font-bold text-foreground">{foodResult.name}</h3>
            <p className="text-sm text-muted-foreground">{foodResult.thaiName}</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-muted p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Calories</p>
                <p className="text-base font-bold text-foreground">{foodResult.calories} kcal</p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Spice</p>
                <p className="text-base font-bold text-primary">Level {foodResult.spice}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                <AlertTriangle className="h-4 w-4" /> Allergy Alerts
              </p>
              <ul className="mt-1.5 space-y-1">
                {foodResult.warnings.map((w) => (
                  <li key={w} className="text-xs text-foreground">• {w}</li>
                ))}
              </ul>
            </div>

            <h4 className="mt-5 flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Leaf className="h-4 w-4 text-secondary" /> Ingredients
            </h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {foodResult.ingredients.map((i) => (
                <span key={i} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-foreground">
                  {i}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/10 px-3 py-2">
              <Languages className="h-4 w-4 text-secondary" />
              <p className="text-xs font-semibold text-secondary">3 dishes detected · TH → EN</p>
            </div>
            <ul className="mt-4 space-y-3">
              {menuResult.map((m, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-muted/50 p-3">
                  <img
                    src={`https://images.unsplash.com/photo-${
                      ["1569718212165-3a8278d5f624", "1455619452474-d2be8b1e70cd", "1626804475297-41608ea09aeb"][i]
                    }?w=200&q=80`}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{m.thai}</p>
                    <h4 className="text-sm font-bold text-foreground">{m.eng}</h4>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{m.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

// tiny helper to avoid import collision in same file
import { Sparkles } from "lucide-react";
const Sparkles_local = () => <Sparkles className="h-4 w-4 text-secondary" />;
