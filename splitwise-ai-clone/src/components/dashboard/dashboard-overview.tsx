"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppStore, computeMonthlySpendSeries, selectGroupExpenses, selectGroupById } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";

const COLORS = ["#22d3ee", "#818cf8", "#f97316", "#ef4444"];

export function DashboardOverview() {
  const groups = useAppStore((state) => state.groups);
  const selectedGroupId = useAppStore((state) => state.selectedGroupId);
  const selectGroup = useAppStore((state) => state.selectGroup);
  const group = useAppStore((state) => selectGroupById(state, selectedGroupId));
  const expenses = useAppStore((state) =>
    selectGroupExpenses(state, selectedGroupId),
  );
  const calculateBalances = useAppStore((state) => state.calculateBalances);
  const insights = useAppStore((state) => state.insights);
  const alerts = useAppStore((state) => state.alerts);

  const balances = React.useMemo(
    () => (group ? calculateBalances(group.id) : []),
    [calculateBalances, group],
  );

  const monthlySeries = React.useMemo(() => computeMonthlySpendSeries(expenses, group?.currency), [expenses, group]);

  const totalSpend = React.useMemo(
    () => expenses.reduce((total, expense) => total + expense.amount, 0),
    [expenses],
  );

  const averagePerMember = React.useMemo(() => {
    if (!group?.members.length) return 0;
    return totalSpend / group.members.length;
  }, [group, totalSpend]);

  if (!group) {
    return null;
  }

  const currency = group.currency ?? "USD";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-violet-500/10">
          <CardHeader>
            <CardDescription>Group Spend</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(totalSpend, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Across {expenses.length} shared expenses this cycle.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Average per member</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(averagePerMember, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {group.members.length} collaborators in{" "}
            <span className="font-medium text-foreground">
              {group.name}
            </span>
            .
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Open insights</CardDescription>
            <CardTitle className="text-3xl">{insights.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Last update{" "}
            {insights[0] ? formatDate(insights[0].createdAt) : "N/A"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Budget signals</CardDescription>
            <CardTitle className="text-3xl">{alerts.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Keep an eye on triggered automation recipes.
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/40">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold">
              Monthly burn rate
            </CardTitle>
            <CardDescription>
              Real-time feed from Convex — updates fan out instantly as new
              expenses are recorded.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            {groups.map((item, index) => (
              <Button
                key={item.id}
                size="sm"
                variant={item.id === group.id ? "default" : "outline"}
                onClick={() => selectGroup(item.id)}
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {item.name}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySeries}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis
                  dataKey="month"
                  stroke="rgba(148, 163, 184, 0.7)"
                  fontSize={12}
                />
                <YAxis
                  stroke="rgba(148, 163, 184, 0.7)"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value, currency)}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.15)",
                    background: "rgba(15,23,42,0.9)",
                    color: "white",
                  }}
                  formatter={(value: number) => formatCurrency(value, currency)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5e9"
                  strokeWidth={2.4}
                  fill="url(#colorSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Expense stream replicating from Convex with optimistic UI updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-4">
              <ul className="space-y-4">
                {expenses.slice(0, 10).map((expense) => (
                  <li
                    key={expense.id}
                    className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-background/40 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {expense.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(expense.date)} • {expense.category}
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-foreground">
                        {formatCurrency(expense.amount, currency)}
                      </span>
                    </div>
                    {expense.aiSummary ? (
                      <p className="text-sm text-muted-foreground">
                        {expense.aiSummary}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      {expense.splits.map((split) => {
                        const member = group.members.find(
                          (item) => item.id === split.memberId,
                        );
                        return (
                          <Badge key={split.memberId} variant="outline">
                            {member?.name ?? "Member"} •{" "}
                            {formatCurrency(split.amount, currency)}
                          </Badge>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balances</CardTitle>
            <CardDescription>
              Smart settlement recommends the minimal number of payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {balances.map((balance) => {
              const member = group.members.find(
                (item) => item.id === balance.memberId,
              );
              const net = balance.netBalance;
              return (
                <div
                  key={balance.memberId}
                  className="rounded-xl border border-border/50 bg-background/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{member?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Paid {formatCurrency(balance.totalPaid, currency)} •
                        Owes {formatCurrency(balance.totalOwed, currency)}
                      </p>
                    </div>
                    <TooltipProvider>
                      <UiTooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={net >= 0 ? "success" : "destructive"}
                            className="cursor-default"
                          >
                            {net >= 0 ? "Receives" : "Owes"}{" "}
                            {formatCurrency(Math.abs(net), currency)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {net >= 0
                            ? "Gemini suggests requesting settlement within 72h."
                            : "You are over budget. Add this to the next optimisation run."}
                        </TooltipContent>
                      </UiTooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
            <Separator className="my-4" />
            <Button variant="outline" className="w-full">
              Launch Smart Settlement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
