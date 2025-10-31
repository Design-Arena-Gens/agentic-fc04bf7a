"use client";

import * as React from "react";
import { Palette, Languages, ShieldCheck, BellRing } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { useAppStore, selectGroupById } from "@/lib/store";

export function SettingsPanel() {
  const { setTheme, theme } = useTheme();
  const selectedGroupId = useAppStore((state) => state.selectedGroupId);
  const updateGroup = useAppStore((state) => state.updateGroup);
  const group = useAppStore((state) => selectGroupById(state, selectedGroupId));
  const [language, setLanguage] = React.useState(group?.members[0]?.preferredLanguage ?? "en");
  const [currency, setCurrency] = React.useState(group?.currency ?? "USD");

  React.useEffect(() => {
    if (!group) return;
    setLanguage(group.members[0]?.preferredLanguage ?? "en");
    setCurrency(group.currency);
  }, [group]);

  if (!group) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>
            Glassmorphism surfaces adapt to light/dark mode with animated gradients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/40 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Dark mode</p>
              <p className="text-xs text-muted-foreground">
                Persistent preference via next-themes.
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
            UI tokens powered by shadcn/ui components, tuned for glassmorphic cards and neon accents.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            Localization
          </CardTitle>
          <CardDescription>
            Gemini adapts tonal guidance and phrasing to each member&apos;s preferred language.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Default language</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Currency</Label>
            <Input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} />
          </div>
          <Button
            variant="outline"
            onClick={() => updateGroup(group.id, { currency, members: group.members.map((member, index) => ({ ...member, preferredLanguage: index === 0 ? language : member.preferredLanguage })) })}
          >
            Save preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Security & compliance
          </CardTitle>
          <CardDescription>
            Modern stack hardened through Clerk auth, Convex row-level security, and audit trails.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Clerk</p>
            SSO, passkeys and MFA lock down every workspace access.
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Convex</p>
            Realtime database with field-level access control and optimistic UI.
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Inngest + Resend</p>
            Durable workflows and transactional email pipeline with full observability.
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            Alerts & nudges
          </CardTitle>
          <CardDescription>
            Manage AI-generated reminders, budget warnings, and Slack notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/40 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Budget alerts</p>
              <p className="text-xs text-muted-foreground">
                Trigger when groups hit 75% of monthly allocation.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/40 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Slack sync</p>
              <p className="text-xs text-muted-foreground">
                Post Gemini summaries into #finance-ops.
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
