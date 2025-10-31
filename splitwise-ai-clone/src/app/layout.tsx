import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Splitwise AI",
  description:
    "AI-first expense management with real-time collaboration, predictive insights, and automated settlement flows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const ClerkWrapper = publishableKey
    ? ({ children: clerkChildren }: { children: React.ReactNode }) => (
        <ClerkProvider
          publishableKey={publishableKey}
          afterSignInUrl="/"
          afterSignUpUrl="/"
        >
          {clerkChildren}
        </ClerkProvider>
      )
    : ({ children: clerkChildren }: { children: React.ReactNode }) => (
        <>{clerkChildren}</>
      );
  return (
    <ClerkWrapper>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkWrapper>
  );
}
