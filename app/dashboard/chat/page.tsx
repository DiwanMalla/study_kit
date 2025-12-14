import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat with AI Helper</h1>
        <p className="text-muted-foreground">Get instant help with your studies.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">AI Chat Interface</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground ml-auto" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <p className="font-medium">Coming Soon</p>
            <p className="text-sm">The AI chat interface is currently under development.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
