"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, Wand2, Sparkles, Calendar, Languages } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore, selectGroupById, selectGroupExpenses } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SplitMethod } from "@/lib/types";

const expenseSchema = z.object({
  groupId: z.string(),
  title: z.string().min(2),
  amount: z.coerce.number().min(0.5),
  category: z.string(),
  date: z.string(),
  notes: z.string().optional(),
  splitMethod: z.enum(["equal", "percentage", "exact"]),
  splits: z
    .array(
      z.object({
        memberId: z.string(),
        amount: z.coerce.number(),
        percentage: z.coerce.number().optional(),
      }),
    )
    .min(1),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const categories = [
  "Dining",
  "Transport",
  "Groceries",
  "Experiences",
  "Lodging",
  "Subscriptions",
  "Utilities",
  "Other",
];

export function GroupsBoard() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isScanningReceipt, setIsScanningReceipt] = React.useState(false);
  const [splitMethod, setSplitMethod] = React.useState<SplitMethod>("equal");
  const selectedGroupId = useAppStore((state) => state.selectedGroupId);
  const addExpense = useAppStore((state) => state.addExpense);
  const addInsight = useAppStore((state) => state.addInsight);
  const group = useAppStore((state) => selectGroupById(state, selectedGroupId));
  const expenses = useAppStore((state) => selectGroupExpenses(state, selectedGroupId));

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as Resolver<ExpenseFormValues>,
    defaultValues: {
      groupId: group?.id ?? "",
      title: "",
      amount: 0,
      category: "Dining",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      splitMethod: "equal",
      splits:
        group?.members.map((member) => ({
          memberId: member.id,
          amount: 0,
          percentage: Number((100 / (group.members.length || 1)).toFixed(2)),
        })) ?? [],
    },
  });

  React.useEffect(() => {
    if (!group) return;
    form.reset({
      groupId: group.id,
      title: "",
      amount: 0,
      category: "Dining",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      splitMethod: splitMethod,
      splits: group.members.map((member) => ({
        memberId: member.id,
        amount: 0,
        percentage: Number((100 / group.members.length).toFixed(2)),
      })),
    });
  }, [form, group, splitMethod]);

  const onSubmit = async (values: ExpenseFormValues) => {
    if (!group) return;
    setIsSubmitting(true);
    try {
      const expenseId = addExpense({
        ...values,
        createdBy: group.members[0]?.id ?? "system",
        description: values.notes,
        splitMethod,
      });

      addInsight({
        title: "Expense synced",
        detail: `Captured ${values.title} for ${formatCurrency(values.amount, group.currency)}. Gemini will refresh recommendations shortly.`,
        severity: "info",
      });

      form.reset();
      return expenseId;
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !group) return;
    setIsScanningReceipt(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/ai/receipt", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.receipt) {
        form.setValue("title", data.receipt.merchant ?? "Receipt expense");
        form.setValue("amount", Number(data.receipt.total ?? 0));
        form.setValue("category", data.receipt.category ?? "Other");
        form.setValue("date", data.receipt.date ?? new Date().toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanningReceipt(false);
    }
  };

  if (!group) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add expense</CardTitle>
            <CardDescription>
              Sync shared spending into Convex. Gemini enriches every entry with notes, context and potential savings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Sunset rooftop dinner" {...form.register("title")}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" step="0.01" min="0" {...form.register("amount", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(value) => form.setValue("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" {...form.register("date")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Dinner overlooking the river, partial reimbursement by company." {...form.register("notes")} />
              </div>

              <Tabs
                value={splitMethod}
                onValueChange={(value) => setSplitMethod(value as SplitMethod)}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="equal">Equal split</TabsTrigger>
                  <TabsTrigger value="percentage">By percentage</TabsTrigger>
                  <TabsTrigger value="exact">Exact amounts</TabsTrigger>
                </TabsList>
                <TabsContent value="equal" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Gemini recommends equal split for shared experiences. Adjust percentages in the AI assistant if someone is subsidised.
                  </p>
                </TabsContent>
                <TabsContent value="percentage" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Allocate custom percentages. Must sum to 100%.
                  </p>
                </TabsContent>
                <TabsContent value="exact" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Assign the precise amount each member owes. Use this for reimbursements or company-expensed receipts.
                  </p>
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                {group.members.map((member, index) => (
                  <div
                    key={member.id}
                    className="grid gap-4 rounded-2xl border border-border/60 bg-background/40 p-4 lg:grid-cols-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      disabled={splitMethod === "percentage"}
                      value={form.watch(`splits.${index}.amount`) ?? 0}
                      onChange={(event) =>
                        form.setValue(`splits.${index}.amount`, Number(event.target.value))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="1"
                        placeholder="%"
                        disabled={splitMethod === "exact"}
                        value={form.watch(`splits.${index}.percentage`) ?? 0}
                        onChange={(event) =>
                          form.setValue(`splits.${index}.percentage`, Number(event.target.value))
                        }
                      />
                      <span className="text-xs text-muted-foreground">%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-3 text-sm font-medium">
                  <Switch disabled={isScanningReceipt} />
                  Reimbursable by company
                </label>
                <div className="flex items-center gap-3">
                  <Label className="cursor-pointer text-sm font-medium text-primary">
                    <div className="flex items-center gap-2 rounded-full border border-dashed border-primary/40 px-4 py-2">
                      <Upload className="h-4 w-4" />
                      Upload receipt
                    </div>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleReceiptUpload}
                    />
                  </Label>
                  <Button type="button" variant="ghost" size="sm" disabled>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Auto fill
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Syncing with Convex…" : "Add expense"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receipts & documents</CardTitle>
            <CardDescription>
              OCR + Gemini Vision extracts merchants, categories and tips automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <Badge variant="outline">JPEG</Badge>
              <Badge variant="outline">PNG</Badge>
              <Badge variant="outline">PDF</Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Drop invoices here or share forwarded emails to ingest them with Resend. Gemini will attach structured metadata after each run.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Group snapshot</CardTitle>
            <CardDescription>
              Glassmorphism UI keeps everyone aligned on the latest plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Members</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.members.map((member) => (
                  <Badge key={member.id} variant="outline">
                    {member.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Budget</p>
              <p className="text-sm text-muted-foreground">
                {group.monthlyBudget
                  ? `${formatCurrency(group.monthlyBudget, group.currency)} monthly`
                  : "No budget set"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-background/40 p-4">
              <p className="text-sm font-semibold text-foreground">AI summary</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {group.aiSummary ?? "Gemini will craft your first summary after the initial sync."}
              </p>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" /> Instant RAG search on every document.
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" /> Auto scheduled audits with Inngest.
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Languages className="h-4 w-4 text-primary" /> Gemini replies in each member&apos;s preferred language.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent expenses</CardTitle>
            <CardDescription>
              Split equally, by percentage or exact amount. Real-time updates across the team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {expenses.slice(0, 8).map((expense) => (
                  <div key={expense.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{expense.title}</p>
                      <span className="text-sm text-muted-foreground">{formatCurrency(expense.amount, group.currency)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(expense.date)} • {expense.category}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {expense.splits.map((split) => {
                        const member = group.members.find((item) => item.id === split.memberId);
                        if (!member) return null;
                        return (
                          <Badge key={split.memberId} variant="outline">
                            {member.name.split(" ")[0]} • {formatCurrency(split.amount, group.currency)}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
