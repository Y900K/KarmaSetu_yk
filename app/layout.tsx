import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/layout/LayoutShell";
import { LanguageProvider } from "@/context/LanguageContext";
import { ChatbotProvider } from "@/context/ChatbotContext";
import { ToastProvider } from "@/components/admin/shared/Toast";
import { GlobalStatsProvider } from "@/context/GlobalStatsContext";

export const metadata: Metadata = {
  title: "KarmaSetu — AI-Integrated Industrial Training Platform",
  description:
    "Train smarter, work safer. AI-powered industrial safety training with smart quizzes, digital certificates, and 24/7 AI assistant for India's workforce.",
  keywords: [
    "industrial safety training",
    "AI training platform",
    "KarmaSetu",
    "safety certification",
    "industrial training India",
    "AI-powered learning",
  ],
  openGraph: {
    title: "KarmaSetu — AI-Integrated Industrial Training Platform",
    description:
      "Train smarter, work safer. AI-powered industrial safety training with smart quizzes, digital certificates, and 24/7 AI assistant for India's workforce.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased font-inter bg-[#020817] text-white" suppressHydrationWarning>
        <LanguageProvider>
          <ChatbotProvider>
            <ToastProvider>
              <GlobalStatsProvider>
                <LayoutShell>{children}</LayoutShell>
              </GlobalStatsProvider>
            </ToastProvider>
          </ChatbotProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
