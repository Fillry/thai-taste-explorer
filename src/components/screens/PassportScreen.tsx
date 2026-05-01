import { motion } from "framer-motion";
import { Trophy, Lock, Flame, MapPin, Star } from "lucide-react";
import { mockUser, mockQuests, mockBadges } from "@/lib/mockData";

export const PassportScreen = () => {
  const xpPercent = (mockUser.xp / mockUser.xpToNext) * 100;

  return (
    <div className="h-full overflow-y-auto bg-background pb-32">
      {/* Passport hero */}
      <div className="relative overflow-hidden gradient-passport px-5 pb-8 pt-8 text-accent-foreground">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-secondary/30 blur-3xl" />

        <div className="relative">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] opacity-80">
            <Star className="h-3 w-3" /> Thai Taste Passport
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hello, {mockUser.name}</h1>
              <p className="mt-1 text-sm opacity-80">Foodie Level {mockUser.level} · Adventurer</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur">
              <Trophy className="h-8 w-8 text-primary-glow" />
            </div>
          </div>

          {/* XP bar */}
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
        {/* Quests */}
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

        {/* Badges */}
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
                  badge.unlocked
                    ? "bg-card shadow-soft"
                    : "bg-muted/60"
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
