import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Clock, Brain, FileText } from "lucide-react";
import { currentUser, auth } from "@clerk/nextjs/server";
import { FileUpload } from "@/components/file-upload";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();
  const { userId } = await auth();

  // Fetch user's study kits
  const studyKits = userId ? await db.studyKit.findMany({
    where: { userId },
    include: {
      file: true,
      flashcards: true,
      quizzes: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  }) : [];

  const totalFlashcards = studyKits.reduce((acc, kit) => acc + kit.flashcards.length, 0);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName || "Student"}!</h1>
          <p className="text-muted-foreground">Ready to ace your next exam?</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Kits</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyKits.length}</div>
            <p className="text-xs text-muted-foreground">
              {studyKits.length === 0 ? "Start by uploading a file" : "Keep learning!"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlashcards}</div>
            <p className="text-xs text-muted-foreground">Cards to review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Take a quiz to track progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Your Study Kits</CardTitle>
            <CardDescription>
              Your recently generated study materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studyKits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No study kits yet.</p>
                <p className="text-sm">Upload a file to create your first study kit!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studyKits.map((kit) => (
                  <Link 
                    key={kit.id} 
                    href={`/study-kit/${kit.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{kit.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {kit.flashcards.length} flashcards • {kit.quizzes.length} quiz
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(kit.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Create Study Kit</CardTitle>
            <CardDescription>
              Upload your study materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
