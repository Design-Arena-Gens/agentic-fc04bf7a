"use client";

import * as React from "react";
import { useDebounceValue } from "usehooks-ts";
import { Mic, MicOff, Send, Bot, Sparkles, Globe2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore, selectGroupById, selectGroupExpenses } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "hi", label: "Hindi" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

type MinimalSpeechRecognitionEvent = {
  results: Array<{
    0: {
      transcript: string;
    };
  }>;
};

type BrowserSpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onresult: ((event: MinimalSpeechRecognitionEvent) => void) | null;
  start: () => void;
};

type BrowserSpeechRecognition = new () => BrowserSpeechRecognitionInstance;

declare global {
  interface Window {
    webkitSpeechRecognition?: BrowserSpeechRecognition;
    SpeechRecognition?: BrowserSpeechRecognition;
  }
}

export function AiCommandCenter() {
  const [isOptimising, setIsOptimising] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [language, setLanguage] = React.useState("en");
  const [chatInput, setChatInput] = React.useState("");
  const [debouncedChatInput] = useDebounceValue(chatInput, 200);

  const selectedGroupId = useAppStore((state) => state.selectedGroupId);
  const group = useAppStore((state) => selectGroupById(state, selectedGroupId));
  const expenses = useAppStore((state) => selectGroupExpenses(state, selectedGroupId));
  const addInsight = useAppStore((state) => state.addInsight);
  const insights = useAppStore((state) => state.insights);
  const calculateBalances = useAppStore((state) => state.calculateBalances);
  const chatHistory = useAppStore((state) => state.chatHistory);
  const addChatMessage = useAppStore((state) => state.addChatMessage);

  const balances = React.useMemo(() => (group ? calculateBalances(group.id) : []), [group, calculateBalances]);

  const handleGenerateInsights = async () => {
    if (!group) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group, expenses }),
      });
      const data = await response.json();
      for (const insight of data.insights ?? []) {
        addInsight(insight);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimiseSettlement = async () => {
    if (!group) return;
    setIsOptimising(true);
    try {
      const response = await fetch("/api/ai/settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balances, currency: group.currency }),
      });
      const data = await response.json();
      addChatMessage({
        role: "assistant",
        content: data.plan,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsOptimising(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    addChatMessage({ role: "user", content: userMessage, language });
    try {
      const history = [...chatHistory.map((item) => item.content), userMessage];
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, language }),
      });
      const data = await response.json();
      addChatMessage({ role: "assistant", content: data.reply ?? "No response" });
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const message = chatHistory.at(-1);
    if (message && message.role === "assistant") {
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.lang = language;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [chatHistory, language]);

  const startVoiceCapture = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ");
      setChatInput(transcript);
    };

    recognition.start();
  };

  if (!group) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <Card>
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Gemini Insights
              </CardTitle>
              <CardDescription>
                AI analyses every new expense, surfaces anomalies and proposes smart nudges.
              </CardDescription>
            </div>
            <Button onClick={handleGenerateInsights} disabled={isGenerating}>
              {isGenerating ? "Generating" : "Run analysis"}
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="rounded-2xl border border-border/50 bg-background/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {insight.title}
                      </p>
                      <Badge
                        variant={
                          insight.severity === "critical"
                            ? "destructive"
                            : insight.severity === "warning"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {insight.detail}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/80">
                      {formatDate(insight.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Smart settlement</CardTitle>
              <CardDescription>
                Simulate minimal cash movement with Gemini optimisation + Convex writes.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleOptimiseSettlement} disabled={isOptimising}>
              {isOptimising ? "Optimising" : "Optimise"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {balances.map((balance) => (
              <div key={balance.memberId} className="rounded-2xl border border-border/40 bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{balance.memberId.split("_")[1]}</p>
                  <span className="text-sm text-muted-foreground">
                    Net {formatCurrency(balance.netBalance, group.currency)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Paid {formatCurrency(balance.totalPaid, group.currency)} • owes {formatCurrency(balance.totalOwed, group.currency)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Chat Ops
            </CardTitle>
            <CardDescription>
              Conversational agent with RAG across group spend, budgets and policy docs.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-4">
            <ScrollArea className="h-[220px] flex-1 rounded-2xl border border-border/40 bg-background/40 p-4">
              <div className="space-y-4">
                {chatHistory.map((message) => (
                  <div key={message.id} className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {message.role === "assistant" ? "Gemini" : "You"}
                    </span>
                    <p className="rounded-2xl border border-border/40 bg-background/60 p-3 text-sm text-foreground">
                      {message.content}
                    </p>
                  </div>
                ))}
                {!chatHistory.length && (
                  <p className="text-sm text-muted-foreground">
                    Ask “Who owes the most this month?” or “Draft a reimbursement reminder for Alex”.
                  </p>
                )}
              </div>
            </ScrollArea>
            <div className="rounded-2xl border border-border/40 bg-background/60 p-4">
              <Label className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                Voice capture
                <Badge variant={isListening ? "success" : "outline"}>
                  {isListening ? "Listening" : "Idle"}
                </Badge>
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "destructive" : "ghost"}
                  onClick={startVoiceCapture}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask Gemini to summarise yesterday’s spend, or record a new expense by voice."
                />
                <Button type="button" onClick={handleSendChat} disabled={!debouncedChatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Language
                  </p>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-9 w-40 text-sm">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Tabs defaultValue="insights" className="flex-1">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="insights" className="text-xs text-muted-foreground">
                  Gemini tailors every response to each member’s preferred language. Mix English, Spanish and Hindi in the same group.
                </TabsContent>
                <TabsContent value="reports" className="text-xs text-muted-foreground">
                  Generate PDF reports, share via Resend, and trigger scheduled summaries through Inngest workflows.
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
