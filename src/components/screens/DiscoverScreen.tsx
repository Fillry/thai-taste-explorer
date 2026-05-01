import { motion } from "framer-motion";
import { Heart, MapPin, BookOpen, Flame, Sparkles, Search } from "lucide-react";
import { useState } from "react";
import { mockFoods, FoodItem } from "@/lib/mockData";
import { BottomSheet } from "@/components/BottomSheet";

export const DiscoverScreen = () => {
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
        <p className="text-xs font-medium uppercase tracking-wider text-secondary">Hidden Gems · Off-Trail</p>
        <h1 className="text-2xl font-bold text-foreground">Discover</h1>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-soft focus-within:ring-2 focus-within:ring-primary">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search dishes, provinces…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </header>

      <div className="px-5 pt-2">
        {/* Insight */}
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

                  {/* Match badge */}
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[11px] font-bold text-foreground shadow-soft">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {food.matchScore}% Match
                  </div>

                  {/* Save */}
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

                  {/* Title overlay */}
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
                      onClick={() => setRecipeFood(food)}
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
