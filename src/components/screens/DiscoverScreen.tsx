import { motion } from "framer-motion";
import { Heart, MapPin, BookOpen, Flame, Sparkles, Search, Compass, BookMarked, Trophy, Lock, Star } from "lucide-react";
import { useState } from "react";
import { mockFoods, FoodItem, mockUser, mockQuests, mockBadges } from "@/lib/mockData";
import { BottomSheet } from "@/components/BottomSheet";
import { cn } from "@/lib/utils";

type DiscoverTab = "explore" | "passport";

export const DiscoverScreen = () => {
  const [tab, setTab] = useState<DiscoverTab>("explore");
  const [saved, setSaved] = useState<Set<string>>(new Set(["1"]));
  const [recipeFood, setRecipeFood] = useState<FoodItem | null>(null);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/85 px-5 pb-3 pt-6 backdrop-blur-lg">
        <p className="text-xs font-medium uppercase tracking-wider text-secondary">
          {tab === "explore" ? "Hidden Gems · Off-Trail" : "Your Thai Taste Journey"}
        </p>
        <h1 className="text-2xl font-bold text-foreground">Discover</h1>

        {/* Tabs */}
        <div className="mt-3 inline-flex w-full rounded-full bg-muted p-1">
          {([
            { id: "explore", label: "Explore", icon: Compass },
            { id: "passport", label: "Passport", icon: BookMarked },
          ] as { id: DiscoverTab; label: string; icon: typeof Compass }[]).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all focus:outline-none",
                  active
                    ? "bg-background text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "explore" && (
          <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-soft focus-within:ring-2 focus-within:ring-primary">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search dishes, provinces…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        )}
      </header>

      {tab === "explore" ? (
        <ExploreTab
          saved={saved}
          toggleSave={toggleSave}
          onOpenRecipe={setRecipeFood}
        />
      ) : (
        <PassportTab />
      )}

      <BottomSheet open={!!recipeFood} onClose={() => setRecipeFood(null)} title={recipeFood?.engName}>
        {recipeFood && (
          <div>
            <img src={recipeFood.image} alt={recipeFood.engName} className="h-44 w-full rounded-2xl object-cover" />
            <p className="mt-3 text-sm text-muted-foreground">{recipeFood.description}</p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-muted p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Time</p>
                <p className="text-sm font-bold text-foreground">{recipeFood.recipe.time}</p>
              </div>
              <div className="rounded-xl bg-muted p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Level</p>
                <p className="text-sm font-bold text-foreground">{recipeFood.recipe.difficulty}</p>
              </div>
              <div className="rounded-xl bg-muted p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Spice</p>
                <p className="flex justify-center text-sm font-bold text-primary">
                  {Array.from({ length: recipeFood.spiceLevel }).map((_, i) => (
                    <Flame key={i} className="h-4 w-4 fill-current" />
                  ))}
                </p>
              </div>
            </div>

            <h4 className="mt-5 text-sm font-bold text-foreground">Ingredients</h4>
            <ul className="mt-2 grid grid-cols-2 gap-1.5">
              {recipeFood.recipe.ingredients.map((ing) => (
                <li key={ing} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> {ing}
                </li>
              ))}
            </ul>

            <h4 className="mt-5 text-sm font-bold text-foreground">Steps</h4>
            <ol className="mt-2 space-y-2">
              {recipeFood.recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-muted/50 p-3 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

const ExploreTab = ({
  saved,
  toggleSave,
  onOpenRecipe,
}: {
  saved: Set<string>;
  toggleSave: (id: string) => void;
  onOpenRecipe: (f: FoodItem) => void;
}) => (
  <div className="px-5 pt-2">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex items-center gap-2 rounded-2xl bg-secondary/10 p-3 text-secondary"
    >
      <Sparkles className="h-4 w-4 shrink-0" />
      <p className="text-xs">
        <span className="font-bold">5 dishes</span> from secondary provinces curated for you today.
      </p>
    </motion.div>

    <div className="space-y-4">
      {mockFoods.map((food, idx) => {
        const isSaved = saved.has(food.id);
        return (
          <motion.article
            key={food.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="overflow-hidden rounded-3xl bg-card shadow-card"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={food.image}
                alt={food.engName}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-accent/70 via-transparent to-transparent" />

              <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[11px] font-bold text-foreground shadow-soft">
                <Sparkles className="h-3 w-3 text-primary" />
                {food.matchScore}% Match
              </div>

              <button
                onClick={() => toggleSave(food.id)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full glass transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={isSaved ? "Unsave" : "Save"}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isSaved ? "fill-destructive text-destructive" : "text-foreground"
                  }`}
                />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground">
                <p className="text-sm font-medium opacity-90">{food.name}</p>
                <h3 className="text-xl font-bold leading-tight">{food.engName}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs opacity-90">
                  <MapPin className="h-3 w-3" /> {food.location}
                </p>
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm text-muted-foreground">{food.description}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {food.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
                <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  {Array.from({ length: food.spiceLevel }).map((_, i) => (
                    <Flame key={i} className="h-2.5 w-2.5" />
                  ))}
                </span>
              </div>

              {isSaved && (
                <button
                  onClick={() => onOpenRecipe(food)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <BookOpen className="h-4 w-4" /> View Recipe
                </button>
              )}
            </div>
          </motion.article>
        );
      })}
    </div>
  </div>
);

const PassportTab = () => {
  const xpPercent = (mockUser.xp / mockUser.xpToNext) * 100;

  return (
    <div>
      <div className="relative mx-5 mt-2 overflow-hidden rounded-3xl gradient-passport px-5 pb-7 pt-7 text-accent-foreground">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-secondary/30 blur-3xl" />

        <div className="relative">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] opacity-80">
            <Star className="h-3 w-3" /> Thai Taste Passport
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Hello, {mockUser.name}</h2>
              <p className="mt-1 text-sm opacity-80">Foodie Level {mockUser.level} · Adventurer</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur">
              <Trophy className="h-7 w-7 text-primary-glow" />
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium opacity-80">
              <span>{mockUser.xp} XP</span>
              <span>Lv {mockUser.level + 1} at {mockUser.xpToNext}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-primary-foreground/15">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full gradient-spice shadow-glow"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Dishes", value: 18 },
              { label: "Provinces", value: 5 },
              { label: "Streaks", value: "3d" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-primary-foreground/10 p-2.5 text-center backdrop-blur">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] uppercase opacity-75">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5">
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Active Quests</h2>
            <span className="text-[11px] font-medium text-primary">3 active</span>
          </div>
          <div className="space-y-3">
            {mockQuests.map((q, idx) => {
              const pct = (q.progress / q.total) * 100;
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl bg-card p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-foreground">{q.title}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {q.description}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                      <Flame className="h-3 w-3" /> +{q.reward} XP
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[10px] font-semibold text-muted-foreground">
                      <span>{q.progress} / {q.total}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full rounded-full gradient-fresh"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Collection Badges</h2>
            <span className="text-[11px] font-medium text-muted-foreground">
              {mockBadges.filter((b) => b.unlocked).length} / {mockBadges.length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {mockBadges.map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                className={`group relative aspect-square rounded-2xl p-2 text-center transition-transform hover:-translate-y-0.5 ${
                  badge.unlocked ? "bg-card shadow-soft" : "bg-muted/60"
                }`}
                title={badge.description}
              >
                <div
                  className={`flex h-full flex-col items-center justify-center gap-1 ${
                    badge.unlocked ? "" : "opacity-40 grayscale"
                  }`}
                >
                  <span className="text-3xl">{badge.emoji}</span>
                  <p className="text-[9px] font-semibold leading-tight text-foreground">{badge.name}</p>
                </div>
                {!badge.unlocked && (
                  <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/80 text-background">
                    <Lock className="h-2.5 w-2.5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
