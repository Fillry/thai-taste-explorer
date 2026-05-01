import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, Sparkles, Star, Flame, Candy, Globe2 } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { communityStore } from "@/lib/communityStore";
import { mockRestaurants } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=900&q=80";

const AI_DISH_POOL = [
  "Pad Kra Pao",
  "Som Tum",
  "Tom Yum Goong",
  "Massaman Curry",
  "Pad See Ew",
  "Mango Sticky Rice",
  "Boat Noodles",
  "Hoy Tod",
];

const MetricSlider = ({
  icon: Icon,
  label,
  value,
  onChange,
  color,
}: {
  icon: typeof Flame;
  label: string;
  value: number;
  onChange: (n: number) => void;
  color: string;
}) => (
  <div>
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color)} strokeWidth={2.4} />
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <span className="text-xs font-bold text-muted-foreground">{value}/5</span>
    </div>
    <Slider value={[value]} max={5} min={0} step={1} onValueChange={(v) => onChange(v[0])} />
  </div>
);

export const CreateReviewSheet = ({ open, onClose }: Props) => {
  const [image, setImage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [dish, setDish] = useState("");
  const [restaurantId, setRestaurantId] = useState(mockRestaurants[0].id);
  const [spicy, setSpicy] = useState(2);
  const [sweetness, setSweetness] = useState(2);
  const [hygiene, setHygiene] = useState(4);
  const [tourismFriendly, setTourismFriendly] = useState(3);
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setImage(null);
    setDish("");
    setRestaurantId(mockRestaurants[0].id);
    setSpicy(2); setSweetness(2); setHygiene(4); setTourismFriendly(3);
    setRating(0); setDescription("");
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImage(url);
      runAiIdentification();
    };
    reader.readAsDataURL(file);
  };

  const runAiIdentification = () => {
    setAiLoading(true);
    setDish("");
    setTimeout(() => {
      const guess = AI_DISH_POOL[Math.floor(Math.random() * AI_DISH_POOL.length)];
      setDish(guess);
      setAiLoading(false);
    }, 1400);
  };

  const canSubmit = !!dish && rating > 0 && description.trim().length > 5;

  const handleSubmit = () => {
    const restaurant = mockRestaurants.find((r) => r.id === restaurantId)!;
    communityStore.add({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      dishName: dish,
      author: "You",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80",
      image: image ?? FALLBACK_IMG,
      description: description.trim(),
      spicy, sweetness, hygiene, tourismFriendly,
      rating,
    });
    toast({ title: "Review posted 🎉", description: "Thanks for sharing your taste with the community." });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Share a dish">
      <div className="space-y-5 pt-2">
        {/* Image upload */}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {image ? (
              <>
                <img src={image} alt="Dish" className="h-full w-full object-cover" />
                <div className="absolute bottom-2 right-2 rounded-full bg-accent/85 px-3 py-1 text-[11px] font-semibold text-accent-foreground backdrop-blur">
                  Tap to change
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Camera className="h-8 w-8" />
                <span className="text-sm font-medium">Upload a photo of your dish</span>
                <span className="text-[11px]">AI will identify it for you</span>
              </div>
            )}
          </button>
        </div>

        {/* AI dish identification */}
        <div className="rounded-2xl bg-primary/5 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              AI Dish Identification
            </span>
          </div>
          {aiLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your photo…
            </div>
          ) : (
            <Input
              value={dish}
              onChange={(e) => setDish(e.target.value)}
              placeholder={image ? "Suggested dish name" : "Upload a photo to auto-detect"}
              className="bg-card"
            />
          )}
        </div>

        {/* Restaurant */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Restaurant
          </label>
          <select
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {mockRestaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.area}
              </option>
            ))}
          </select>
        </div>

        {/* Metrics */}
        <div className="space-y-4 rounded-2xl bg-muted/50 p-4">
          <MetricSlider icon={Flame} label="Spicy" value={spicy} onChange={setSpicy} color="text-destructive" />
          <MetricSlider icon={Candy} label="Sweetness" value={sweetness} onChange={setSweetness} color="text-primary" />
          <MetricSlider icon={Sparkles} label="Hygiene" value={hygiene} onChange={setHygiene} color="text-secondary" />
          <MetricSlider icon={Globe2} label="Tourist-friendly" value={tourismFriendly} onChange={setTourismFriendly} color="text-accent" />
        </div>

        {/* Star rating */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Overall Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setRating(n)}
                className="focus:outline-none"
                aria-label={`${n} stars`}
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    n <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"
                  )}
                  strokeWidth={2}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Your experience
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What made this dish memorable? Any tips for fellow travelers?"
            rows={4}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-full rounded-full py-3.5 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            canSubmit
              ? "gradient-spice text-primary-foreground shadow-glow active:scale-[0.98]"
              : "bg-muted text-muted-foreground"
          )}
        >
          Post Review
        </button>
      </div>
    </BottomSheet>
  );
};
