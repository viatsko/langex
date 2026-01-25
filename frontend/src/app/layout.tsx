import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BookOpen, BookText, MessageCircle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Langex - Learn Turkish",
  description: "Your personal Turkish language learning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-card">
            <div className="px-6 py-4">
              <nav className="flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-primary">
                  Langex
                </Link>
                <div className="flex items-center gap-6">
                  <Link
                    href="/grammar"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    Grammar
                  </Link>
                  <Link
                    href="/dictionary"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <BookText className="h-4 w-4" />
                    Dictionary
                  </Link>
                  <Link
                    href="/ask"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask AI
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          <main className="flex-1 px-6 py-6 overflow-hidden">{children}</main>
          <footer className="border-t bg-card py-4">
            <div className="px-6 text-center text-sm text-muted-foreground">
              Langex - Learn Turkish with AI
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
