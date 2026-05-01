import { motion } from "framer-motion";
import { MapPin, Utensils, Camera, Coffee, Sparkles, Calendar } from "lucide-react";
import { mockItinerary, mockFoods, mockUser } from "@/lib/mockData";

const iconMap = { map: MapPin, utensils: Utensils, camera: Camera, coffee: Coffee };

export const PlanScreen = () => {
  return (
    <div className="h-full overflow-y-auto bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/85 px-5 pb-3 pt-6 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Today · Mon, Mar 18</p>
            <h1 className="text-2xl font-bold text-foreground">Smart Plan</h1>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary">
            <Calendar className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="px-5">
        {/* AI banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-start gap-3 rounded-2xl gradient-passport p-4 text-accent-foreground shadow-passport"
        >
          <div className="rounded-xl bg-primary-foreground/15 p-2">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">AI tuned your day</p>
            <p className="text-xs text-primary-foreground/80">
              3 stops dispersed beyond Bangkok to ease over-tourism — all match your spice & allergy profile.
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative mt-6">
          <div className="absolute bottom-2 left-[27px] top-2 w-px bg-gradient-to-b from-primary via-border to-secondary" />
          <ul className="space-y-4">
            {mockItinerary.map((event, idx) => {
              const Icon = iconMap[event.icon];
              const isAI = event.type === "ai";
              const food = event.linkedFoodId ? mockFoods.find((f) => f.id === event.linkedFoodId) : null;

              return (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="relative flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-muted-foreground">{event.time}</span>
                    <div
                      className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-background ${
                        isAI ? "gradient-spice text-primary-foreground shadow-glow" : "bg-card text-secondary border-2 border-secondary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div
                    className={`flex-1 rounded-2xl p-4 shadow-soft ${
                      isAI ? "border-2 border-primary/20 bg-card" : "bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{event.title}</h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {event.location}
                        </p>
                      </div>
                      {isAI && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <Sparkles className="h-2.5 w-2.5" /> AI
                        </span>
                      )}
                    </div>

                    {isAI && event.reason && (
                      <div className="mt-3 rounded-xl bg-muted/60 p-2.5">
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          <span className="font-semibold text-foreground">Why this? </span>
                          {event.reason}
                        </p>
                      </div>
                    )}

                    {food && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl bg-muted/40 p-2">
                        <img src={food.image} alt={food.engName} className="h-12 w-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">{food.engName}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{food.name}</p>
                        </div>
                        <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold text-secondary">
                          {food.matchScore}%
                        </span>
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
