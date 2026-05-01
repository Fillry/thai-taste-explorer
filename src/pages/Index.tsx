import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav, TabId } from "@/components/BottomNav";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { PlanScreen } from "@/components/screens/PlanScreen";
import { DiscoverScreen } from "@/components/screens/DiscoverScreen";
import { LensScreen } from "@/components/screens/LensScreen";
import { PassportScreen } from "@/components/screens/PassportScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";

const Index = () => {
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState<TabId>("plan");

  const renderTab = () => {
    switch (tab) {
      case "plan": return <PlanScreen />;
      case "discover": return <DiscoverScreen />;
      case "lens": return <LensScreen />;
      case "passport": return <PassportScreen />;
      case "profile": return <ProfileScreen onEditProfile={() => setOnboarded(false)} />;
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-muted via-background to-muted p-0 sm:p-6">
      {/* Phone frame */}
      <div className="relative h-screen w-full overflow-hidden bg-background shadow-card sm:h-[860px] sm:max-h-[92vh] sm:w-[420px] sm:rounded-[2.5rem] sm:ring-8 sm:ring-accent/90">
        <AnimatePresence mode="wait">
          {!onboarded ? (
            <motion.div
              key="onboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <OnboardingScreen onComplete={() => setOnboarded(true)} />
            </motion.div>
          ) : (
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {renderTab()}
            </motion.div>
          )}
        </AnimatePresence>

        {onboarded && <BottomNav active={tab} onChange={setTab} />}
      </div>
    </main>
  );
};

export default Index;
