import Link from "next/link";
import { BookOpen, BookText, MessageCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Langex</h1>
        <p className="text-xl text-muted-foreground">
          Your personal Turkish language learning platform
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/grammar">
          <Card className="h-full hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Grammar Cards</CardTitle>
              <CardDescription>
                Learn Turkish grammar with structured cards covering topics like
                asking questions, describing things, and building sentences.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dictionary">
          <Card className="h-full hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Dictionary</CardTitle>
              <CardDescription>
                Build your personal vocabulary with auto-translation from
                English or Russian, including morphology breakdowns.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/ask">
          <Card className="h-full hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Ask AI</CardTitle>
              <CardDescription>
                Ask &quot;How do I say X in Turkish?&quot; and get instant
                translations with detailed explanations, auto-saved to your
                dictionary.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
