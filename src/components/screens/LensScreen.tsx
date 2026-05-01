import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Camera, FileText, AlertTriangle, Leaf, Languages, Sparkles, Upload, Flame, Activity, Loader2, RefreshCw, ImageOff, Tag } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "food" | "menu";

interface FoodAnalysis {
  dishName: string;
  thaiName?: string;
  estimatedCalories: number;
  spicinessLevel: number;
  allergens: string[];
  ingredients: string[];
  confidence?: number;
  description?: string;
}

interface MenuDish {
  originalText?: string;
  englishName: string;
  thaiName?: string;
  description: string;
  priceText?: string;
  spicinessLevel: number;
  tags: string[];
  imageQuery: string;
}

interface MenuAnalysis {
  language?: string;
  dishes: MenuDish[];
}

const unsplashUrl = (query: string) =>
  `https://source.unsplash.com/featured/400x400/?${encodeURIComponent(query + ",food,thai")}`;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const LensScreen = () => {
  const [mode, setMode] = useState<Mode>("food");
  const [scanning, setScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [menuAnalysis, setMenuAnalysis] = useState<MenuAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => fileInputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (mode === "menu") {
      // Keep menu mode as mock for now
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        setShowResult(true);
      }, 1600);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image too large (max 8MB).");
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setPreviewUrl(dataUrl);
    setScanning(true);
    setShowResult(true);

    if (mode === "menu") {
      setMenuAnalysis(null);
      try {
        const { data, error } = await supabase.functions.invoke("scan-menu", {
          body: { imageDataUrl: dataUrl },
        });
        if (error) {
          const msg = (error as any)?.context?.error || error.message || "Scan failed";
          toast.error(typeof msg === "string" ? msg : "Scan failed");
          setScanning(false);
          return;
        }
        if (data?.error) {
          toast.error(data.error);
          setScanning(false);
          return;
        }
        setMenuAnalysis(data.result as MenuAnalysis);
      } catch (err) {
        console.error(err);
        toast.error("Could not analyze menu. Try again.");
      } finally {
        setScanning(false);
      }
      return;
    }

    try {
      setAnalysis(null);
      setScanning(true);
      setShowResult(true);

      const { data, error } = await supabase.functions.invoke("scan-food", {
        body: { imageDataUrl: dataUrl },
      });

      if (error) {
        const msg = (error as any)?.context?.error || error.message || "Scan failed";
        toast.error(typeof msg === "string" ? msg : "Scan failed");
        setScanning(false);
        return;
      }
      if (data?.error) {
        toast.error(data.error);
        setScanning(false);
        return;
      }
      setAnalysis(data.result as FoodAnalysis);
      setScanning(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not analyze image. Try again.");
      setScanning(false);
    }
  };

  const closeSheet = () => {
    setShowResult(false);
    setTimeout(() => {
      setAnalysis(null);
      setMenuAnalysis(null);
      setPreviewUrl(null);
    }, 300);
  };

  return (
    <div className="relative h-full overflow-hidden bg-accent">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {/* Mock viewfinder background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage: previewUrl
            ? `url(${previewUrl})`
            : "url(https://images.unsplash.com/photo-1559314809-0d155014e29e?w=900&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-accent/60 via-accent/10 to-accent/90" />

      {/* Header */}
      <header className="relative z-10 px-5 pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/80">AI Lens</p>
        <h1 className="text-2xl font-bold text-primary-foreground">Point. Scan. Eat safely.</h1>

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

          {!scanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full glass px-3 py-1.5 text-[11px] font-medium text-foreground"
            >
              {mode === "food" ? "Upload a photo of the dish" : "Upload a photo of the menu"}
            </motion.div>
          )}
        </div>
      </div>

      {/* Capture button */}
      <div className="absolute inset-x-0 bottom-32 z-10 flex flex-col items-center gap-2">
        <p className="text-[11px] font-medium text-primary-foreground/80">
          {scanning ? "AI analyzing…" : "Tap to upload & scan"}
        </p>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={triggerUpload}
          disabled={scanning}
          className="relative flex items-center justify-center rounded-full bg-primary-foreground p-1 shadow-glow focus:outline-none focus:ring-4 focus:ring-primary/40 disabled:opacity-70"
          style={{ height: 72, width: 72 }}
        >
          {scanning && (
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary" />
          )}
          <span className="flex h-full w-full items-center justify-center rounded-full gradient-spice">
            {scanning ? (
              <Loader2 className="h-7 w-7 animate-spin text-primary-foreground" />
            ) : (
              <Upload className="h-7 w-7 text-primary-foreground" />
            )}
          </span>
        </motion.button>
        <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">
          Powered by Vision AI
        </p>
      </div>

      {/* Result Sheet */}
      <BottomSheet
        open={showResult}
        onClose={closeSheet}
        title={mode === "food" ? "Scan Result" : "Menu Translation"}
      >
        {mode === "food" ? (
          <FoodResultView
            scanning={scanning}
            analysis={analysis}
            previewUrl={previewUrl}
            onRetry={triggerUpload}
          />
        ) : (
          <MenuResultView
            scanning={scanning}
            analysis={menuAnalysis}
            previewUrl={previewUrl}
            onRetry={triggerUpload}
          />
        )}
      </BottomSheet>
    </div>
  );
};

const FoodResultView = ({
  scanning,
  analysis,
  previewUrl,
  onRetry,
}: {
  scanning: boolean;
  analysis: FoodAnalysis | null;
  previewUrl: string | null;
  onRetry: () => void;
}) => {
  if (scanning) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {previewUrl && (
          <img src={previewUrl} alt="Uploaded dish" className="mb-5 h-32 w-32 rounded-2xl object-cover shadow-card" />
        )}
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm font-semibold text-foreground">Analyzing your dish…</p>
        <p className="mt-1 text-xs text-muted-foreground">Identifying ingredients & allergens</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted-foreground">No result yet.</p>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try another photo
        </button>
      </div>
    );
  }

  const spice = Math.max(1, Math.min(5, Math.round(analysis.spicinessLevel || 1)));

  return (
    <div>
      {previewUrl && (
        <img src={previewUrl} alt={analysis.dishName} className="mb-4 h-44 w-full rounded-2xl object-cover shadow-card" />
      )}

      {typeof analysis.confidence === "number" && (
        <div className="flex items-center gap-2 rounded-xl bg-secondary/10 px-3 py-2">
          <Sparkles className="h-4 w-4 text-secondary" />
          <p className="text-xs font-semibold text-secondary">{Math.round(analysis.confidence)}% identified</p>
        </div>
      )}

      <h3 className="mt-3 text-xl font-bold text-foreground">{analysis.dishName}</h3>
      {analysis.thaiName && <p className="text-sm text-muted-foreground">{analysis.thaiName}</p>}
      {analysis.description && (
        <p className="mt-1 text-xs text-muted-foreground">{analysis.description}</p>
      )}

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted p-3">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-secondary" />
            <p className="text-[10px] uppercase text-muted-foreground">Calories</p>
          </div>
          <p className="mt-1 text-base font-bold text-foreground">{analysis.estimatedCalories} kcal</p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <p className="text-[10px] uppercase text-muted-foreground">Spice</p>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <p className="text-base font-bold text-primary">Lvl {spice}</p>
            <div className="ml-1 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i <= spice ? "bg-primary" : "bg-muted-foreground/20"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Allergens */}
      <div className="mt-4 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-destructive">
          <AlertTriangle className="h-4 w-4" /> Allergy Alerts
        </p>
        {analysis.allergens && analysis.allergens.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {analysis.allergens.map((a) => (
              <span key={a} className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive">
                {a}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-foreground">No common allergens detected.</p>
        )}
      </div>

      {/* Ingredients */}
      <h4 className="mt-5 flex items-center gap-1.5 text-sm font-bold text-foreground">
        <Leaf className="h-4 w-4 text-secondary" /> Key Ingredients
      </h4>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(analysis.ingredients || []).map((i) => (
          <span key={i} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-foreground">
            {i}
          </span>
        ))}
      </div>

      <button
        onClick={onRetry}
        className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98]"
      >
        <RefreshCw className="h-4 w-4" /> Scan another dish
      </button>
    </div>
  );
};
