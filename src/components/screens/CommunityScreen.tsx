import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Plus, Star, Flame, Candy, Sparkles, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { communityStore, useCommunityReviews } from "@/lib/communityStore";
import { CreateReviewSheet } from "@/components/CreateReviewSheet";

const MetricBar = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Flame;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex items-center gap-2">
    <Icon className={cn("h-3.5 w-3.5", color)} strokeWidth={2.4} />
    <span className="w-20 text-[11px] font-medium text-muted-foreground">{label}</span>
    <div className="flex flex-1 gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            i < value ? color.replace("text-", "bg-") : "bg-muted"
          )}
        />
      ))}
    </div>
  </div>
);

export const CommunityScreen = () => {
  const reviews = useCommunityReviews();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="relative h-full overflow-y-auto bg-background pb-28 scrollbar-hide">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/85 px-5 pb-3 pt-6 backdrop-blur-md">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Community</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Tasted by Travelers
            </h1>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-full gradient-spice px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} />
            Post
          </button>
        </div>
      </header>

      <div className="space-y-4 px-4">
        {reviews.map((r, idx) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="overflow-hidden rounded-3xl bg-card shadow-card"
          >
            {/* Author row */}
            <div className="flex items-center gap-3 px-4 pt-4">
              <img
                src={r.authorAvatar}
                alt={r.author}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{r.author}</p>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{r.restaurantName}</span>
                  <span>•</span>
                  <span>{r.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-xs font-bold text-primary">{r.rating}.0</span>
              </div>
            </div>

            {/* Image */}
            <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden">
              <img src={r.image} alt={r.dishName} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute bottom-3 left-3 rounded-full bg-accent/85 px-3 py-1 text-xs font-bold text-accent-foreground backdrop-blur">
                {r.dishName}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-3 px-4 py-4">
              <p className="text-sm leading-relaxed text-foreground">{r.description}</p>

              <div className="space-y-1.5 rounded-2xl bg-muted/60 p-3">
                <MetricBar icon={Flame} label="Spicy" value={r.spicy} color="text-destructive" />
                <MetricBar icon={Candy} label="Sweetness" value={r.sweetness} color="text-primary" />
                <MetricBar icon={Sparkles} label="Hygiene" value={r.hygiene} color="text-secondary" />
                <MetricBar icon={Globe2} label="Tourist-friendly" value={r.tourismFriendly} color="text-accent" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => communityStore.toggleLike(r.id)}
                  className={cn(
                    "group flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                    r.liked
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  )}
                  aria-label="Like review"
                >
                  <motion.span
                    key={String(r.liked)}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 600, damping: 18 }}
                  >
                    <Heart
                      className={cn("h-4 w-4", r.liked && "fill-destructive")}
                      strokeWidth={2.4}
                    />
                  </motion.span>
                  {r.likes}
                </button>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Helpful for {r.tourismFriendly >= 4 ? "first-timers" : "seasoned eaters"}
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <CreateReviewSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
};
