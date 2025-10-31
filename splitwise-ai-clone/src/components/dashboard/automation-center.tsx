"use client";

import * as React from "react";
import { Activity, Bell, Clock, Mail, Workflow, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore, selectGroupById, selectGroupExpenses } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export function AutomationCenter() {
  const [email, setEmail] = React.useState("finance@splitwiseai.dev");
  const [message, setMessage] = React.useState("Your group is approaching the budget ceiling. Let's review upcoming expenses.");
  const [isSending, setIsSending] = React.useState(false);
  const selectedGroupId = useAppStore((state) => state.selectedGroupId);
  const group = useAppStore((state) => selectGroupById(state, selectedGroupId));
  const alerts = useAppStore((state) => state.alerts);
  const expenses = useAppStore((state) => selectGroupExpenses(state, selectedGroupId));

  const totalSpend = React.useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const handleSendAlert = async () => {
    setIsSending(true);
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          subject: `Budget alert • ${group?.name ?? "Shared group"}`,
          html: `<p>${message}</p><p>Current spend: ${formatCurrency(totalSpend, group?.currency ?? "USD")}</p>`,
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  if (!group) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Workflow className="h-5 w-5 text-primary" />
            Inngest Recipes
          </CardTitle>
          <CardDescription>
            Background jobs orchestrate budget alerts, smart reminders and scheduled AI audits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Budget watchdog</p>
              <Badge variant="warning">Threshold 80%</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Inngest listens for Convex events and dispatches Gemini-powered advice when spend velocity spikes.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4" /> Every 6 hours • Fan-out via Resend + Slack webhook
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Smart reminders</p>
              <Badge variant="secondary">Auto</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Gemini drafts polite nudges when balances stay unsettled. Inngest respects quiet hours per member timezone.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Bell className="h-4 w-4" /> Scheduled 48h before due date
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Report generator</p>
              <Badge variant="success">PDF</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Monthly Gemini summaries rendered to PDF and emailed out with Resend. Attach charts, settlements and AI commentary.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-4 w-4" /> {group.members.length} recipients • {group.monthlyBudget ? formatCurrency(group.monthlyBudget, group.currency) : "Flexible"} budget
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Mail className="h-5 w-5 text-primary" />
            Resend alerts
          </CardTitle>
          <CardDescription>
            Trigger transactional emails whenever Inngest detects risk signals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <label className="text-sm font-medium" htmlFor="email">
              Recipient email
            </label>
            <Input
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="finance@company.com"
            />
          </div>
          <div className="grid gap-3">
            <label className="text-sm font-medium" htmlFor="message">
              Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-[140px]"
            />
          </div>
          <Button className="w-full" onClick={handleSendAlert} disabled={isSending}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSending ? "Sending" : "Send via Resend"}
          </Button>
          <div className="rounded-2xl border border-border/50 bg-background/50 p-4 text-sm text-muted-foreground">
            {alerts.length} active automation triggers. Configure additional thresholds in Convex and propagate to Inngest workflows.
          </div>
          <ScrollArea className="h-[120px] rounded-2xl border border-border/40 bg-background/40 p-4">
            <div className="space-y-3 text-xs text-muted-foreground">
              {alerts.map((alert) => (
                <p key={alert.id}>
                  Trigger <strong>{alert.id}</strong> at {alert.threshold * 100}% budget &mdash; {alert.triggered ? "notified" : "standing by"}
                </p>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
