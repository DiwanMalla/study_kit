import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { Plus, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const { userId } = await auth();

  const decks = userId
    ? await db.studyKit.findMany({
        where: {
          userId,
          flashcards: { some: {} },
        },
        include: {
          _count: { select: { flashcards: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Flash Cards</h1>
          <p className="text-muted-foreground">
            Generate and study AI-powered flashcard decks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Back to overview
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/flashcards/new">
              <Plus className="mr-2 h-4 w-4" />
              New Deck
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {decks.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-10 text-center border-dashed">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mb-2">No flashcard decks yet</CardTitle>
            <CardDescription className="max-w-md mb-6">
              Create your first deck from any text content.
            </CardDescription>
            <Button asChild>
              <Link href="/dashboard/flashcards/new">Start Now</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Link
                key={deck.id}
                href={`/dashboard/flashcards/${deck.id}`}
                className="block group"
              >
                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {deck.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {format(new Date(deck.createdAt), "MMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {deck._count.flashcards} cards
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
