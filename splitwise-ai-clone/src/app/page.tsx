"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/layout/site-header";
import { HeroBanner } from "@/components/dashboard/hero";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { GroupsBoard } from "@/components/dashboard/groups-board";
import { AiCommandCenter } from "@/components/dashboard/ai-command-center";
import { AutomationCenter } from "@/components/dashboard/automation-center";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const [tab, setTab] = React.useState("dashboard");
  const groups = useAppStore((state) => state.groups);
  const selectGroup = useAppStore((state) => state.selectGroup);
  const selectedGroupId = useAppStore((state) => state.selectedGroupId);

  React.useEffect(() => {
    if (!selectedGroupId && groups[0]) {
      selectGroup(groups[0].id);
    }
  }, [groups, selectGroup, selectedGroupId]);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_55%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.25),transparent_60%)] px-4 pb-16 pt-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <SiteHeader />
        <HeroBanner />
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="ai">AI Studio</TabsTrigger>
            <TabsTrigger value="automation">Automations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <DashboardOverview />
            </motion.div>
          </TabsContent>
          <TabsContent value="groups">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <GroupsBoard />
            </motion.div>
          </TabsContent>
          <TabsContent value="ai">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <AiCommandCenter />
            </motion.div>
          </TabsContent>
          <TabsContent value="automation">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <AutomationCenter />
            </motion.div>
          </TabsContent>
          <TabsContent value="settings">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <SettingsPanel />
            </motion.div>
          </TabsContent>
        </Tabs>
        <footer className="mt-8 rounded-[2rem] border border-border/30 bg-background/70 px-6 py-4 text-sm text-muted-foreground">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>Built with Next.js 15, Convex realtime sync, Clerk auth, Inngest automations, Gemini AI, and Resend mailers.</p>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <a href="https://vercel.com" target="_blank" rel="noreferrer">
                  Deploy to Vercel
                </a>
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
