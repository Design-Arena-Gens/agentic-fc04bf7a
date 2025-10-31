"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between rounded-[2rem] border border-border/40 bg-background/70 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <Link href="/" className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 text-base font-semibold text-slate-950 shadow-lg">
          AI
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            Splitwise AI
          </span>
          <span className="text-xs text-muted-foreground">
            Next.js 15 • Convex • Gemini • Inngest
          </span>
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden sm:flex">
          Glassmorphism UI
        </Badge>
        <ThemeToggle />
        {hasClerk ? (
          <>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">Sign in</Button>
              </SignInButton>
            </SignedOut>
          </>
        ) : (
          <Badge variant="outline">Auth disabled</Badge>
        )}
      </div>
    </header>
  );
}
