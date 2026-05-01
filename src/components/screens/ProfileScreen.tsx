import { motion } from "framer-motion";
import { Flame, Settings, ChevronRight, Globe, Bell, Shield, Heart } from "lucide-react";
import { mockUser } from "@/lib/mockData";

interface ProfileScreenProps {
  onEditProfile: () => void;
}

export const ProfileScreen = ({ onEditProfile }: ProfileScreenProps) => {
  return (
    <div className="h-full overflow-y-auto bg-background pb-32">
      <header className="px-5 pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Account</p>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
      </header>

      <div className="px-5">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-4 rounded-3xl bg-card p-4 shadow-card"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-spice text-2xl font-bold text-primary-foreground shadow-glow">
            🧳
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{mockUser.name}</h2>
            <p className="text-xs text-muted-foreground">Foodie Lv.{mockUser.level} · {mockUser.xp} XP</p>
          </div>
          <button
            onClick={onEditProfile}
            className="rounded-full bg-muted p-2 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Edit"
          >
            <Settings className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Taste profile summary */}
        <section className="mt-6 rounded-3xl bg-card p-5 shadow-soft">
          <h3 className="text-sm font-bold text-foreground">Your Taste Profile</h3>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Spice Tolerance</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <Flame
                  key={i}
                  className={`h-4 w-4 ${
                    i <= mockUser.spiceLevel ? "fill-primary text-primary" : "text-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Diets</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {mockUser.diets.map((d) => (
                <span key={d} className="rounded-full bg-secondary/15 px-3 py-1 text-[11px] font-semibold text-secondary">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Allergies</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {mockUser.allergies.map((a) => (
                <span key={a} className="rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-semibold text-destructive">
                  ⚠ {a}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onEditProfile}
            className="mt-5 w-full rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Re-run AI Profile Setup
          </button>
        </section>

        {/* Settings list */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-card shadow-soft">
          {[
            { icon: Globe, label: "Language", value: "English" },
            { icon: Bell, label: "Notifications", value: "On" },
            { icon: Shield, label: "Privacy", value: "" },
            { icon: Heart, label: "Saved Dishes", value: "1" },
          ].map((item, i, arr) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted focus:outline-none focus:bg-muted ${
                  i < arr.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
        </section>

        <p className="mt-6 text-center text-[10px] text-muted-foreground">
          Thai Taste Passport · v1.0 · Built with ❤️ for ethical travel
        </p>
      </div>
    </div>
  );
};
