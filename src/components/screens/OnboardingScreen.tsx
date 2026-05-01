import { motion } from "framer-motion";
import { useState } from "react";
import { Flame, Sparkles, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface OnboardingProps {
  onComplete: () => void;
}

const diets = ["Vegan", "Vegetarian", "Halal", "Pescatarian", "Gluten-Free"];
const allergies = ["Peanuts", "Seafood", "Shellfish", "Egg", "Soy", "Dairy"];
const spiceLabels = ["Mild", "Medium", "Spicy", "Thai-Hot"];

export const OnboardingScreen = ({ onComplete }: OnboardingProps) => {
  const [spice, setSpice] = useState([3]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(["Pescatarian"]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["Peanuts"]);

  const toggle = (val: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  };

  return (
    <div className="relative h-full overflow-y-auto bg-background">
      {/* Hero gradient */}
      <div className="absolute inset-x-0 top-0 h-72 gradient-spice opacity-90" />
      <div className="relative px-5 pb-32 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary-foreground"
        >
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3 w-3" /> AI Profile Setup
          </div>
          <h1 className="text-3xl font-bold leading-tight">Welcome to your<br />Thai Taste</h1>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Tell us your taste — we'll guide you to dishes only locals know.
          </p>
        </motion.div>

        {/* Spice card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-3xl bg-card p-5 shadow-card"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Spice Tolerance</h2>
              <p className="text-xs text-muted-foreground">From mild to "tears-of-joy"</p>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <Flame
                  key={i}
                  className={`h-5 w-5 transition-all ${
                    i <= spice[0] ? "fill-primary text-primary" : "text-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <Slider
            value={spice}
            onValueChange={setSpice}
            min={1}
            max={4}
            step={1}
            className="my-3"
          />
          <div className="mt-2 flex justify-between text-[10px] font-medium text-muted-foreground">
            {spiceLabels.map((l, i) => (
              <span key={l} className={spice[0] === i + 1 ? "text-primary" : ""}>{l}</span>
            ))}
          </div>
        </motion.section>

        {/* Diets */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4 rounded-3xl bg-card p-5 shadow-card"
        >
          <h2 className="text-base font-bold text-foreground">Dietary Preferences</h2>
          <p className="text-xs text-muted-foreground">Pick all that apply</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {diets.map((d) => {
              const selected = selectedDiets.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggle(d, selectedDiets, setSelectedDiets)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-secondary ${
                    selected
                      ? "border-secondary bg-secondary text-secondary-foreground shadow-soft"
                      : "border-border bg-background text-foreground hover:border-secondary/40"
                  }`}
                >
                  {selected && <Check className="mr-1 inline h-3.5 w-3.5" />}
                  {d}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Allergies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 rounded-3xl bg-card p-5 shadow-card"
        >
          <h2 className="text-base font-bold text-foreground">Allergies</h2>
          <p className="text-xs text-muted-foreground">We'll warn you in real-time via AI Lens</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {allergies.map((a) => {
              const selected = selectedAllergies.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => toggle(a, selectedAllergies, setSelectedAllergies)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-destructive ${
                    selected
                      ? "border-destructive bg-destructive text-destructive-foreground shadow-soft"
                      : "border-border bg-background text-foreground hover:border-destructive/40"
                  }`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.97 }}
          onClick={onComplete}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl gradient-passport py-4 text-base font-bold text-accent-foreground shadow-passport transition-shadow hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Sparkles className="h-5 w-5" />
          Generate My Taste Profile
        </motion.button>
      </div>
    </div>
  );
};
