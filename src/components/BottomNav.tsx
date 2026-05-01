import { motion } from "framer-motion";
import { Compass, Sparkles, ScanLine, BookMarked, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabId = "passport" | "plan" | "lens" | "discover" | "profile";

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof Compass }[] = [
  { id: "plan", label: "Plan", icon: Sparkles },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "lens", label: "Lens", icon: ScanLine },
  { id: "passport", label: "Passport", icon: BookMarked },
  { id: "profile", label: "Me", icon: User },
];

export const BottomNav = ({ active, onChange }: BottomNavProps) => {
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2">
      <div className="glass mx-auto flex max-w-md items-center justify-between rounded-full px-2 py-2 shadow-card">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          const isCenter = tab.id === "lens";

          if (isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full gradient-spice text-primary-foreground shadow-glow transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={tab.label}
              >
                {isActive && (
                  <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-primary/40" />
                )}
                <Icon className="h-6 w-6" strokeWidth={2.4} />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-medium transition-colors focus:outline-none",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={tab.label}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-primary/10"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
