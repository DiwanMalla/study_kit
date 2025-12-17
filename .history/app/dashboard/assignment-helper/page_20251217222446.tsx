import { useState } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { format } from "date-fns";
import {
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AssignmentHelperPageWrapper(props: any) {
  // This wrapper is needed to use useState in a server component file
  return <AssignmentHelperPage {...props} />;
}

function AssignmentHelperPage() {
  const [assignments, setAssignments] = useState([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    const res = await fetch("/api/assignments");
    if (res.ok) {
      const data = await res.json();
      setAssignments(data);
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    if (res.status === 204) {
      setAssignments((prev) => prev.filter((a: any) => a.id !== id));
      setShowDialog(false);
      setDeleteId(null);
    } else {
      alert("Failed to delete assignment.");
    }
    setIsDeleting(false);
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Assignment Helper
          </h1>
          <p className="text-muted-foreground">
            Upload your assignments, get AI-powered solutions and explanations.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/assignment-helper/new">
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {assignments.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-10 text-center border-dashed">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mb-2">No assignments yet</CardTitle>
            <CardDescription className="max-w-md mb-6">
              Get help with your first assignment. Upload instructions or
              rubrics and let our AI assist you.
            </CardDescription>
            <Button asChild>
              <Link href="/dashboard/assignment-helper/new">Start Now</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment: any) => (
              <div key={assignment.id} className="relative group">
                <Link
                  href={`/dashboard/assignment-helper/${assignment.id}`}
                  className="block group"
                >
                  <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {assignment.title}
                        </CardTitle>
                        <StatusBadge status={assignment.status} />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {format(new Date(assignment.createdAt), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        {assignment.files.length} file
                        {assignment.files.length !== 1 ? "s" : ""}
                      </div>
                      {assignment.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
                <button
                  className="absolute top-2 right-2 z-10 p-1 rounded hover:bg-red-100"
                  onClick={() => {
                    setDeleteId(assignment.id);
                    setShowDialog(true);
                  }}
                  aria-label="Delete assignment"
                >
                  <Trash className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <Badge
        variant="default"
        className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
      >
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Done
      </Badge>
    );
  }
  if (status === "processing") {
    return (
      <Badge
        variant="secondary"
        className="bg-blue-500/10 text-blue-600 border-blue-500/20"
      >
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Processing
      </Badge>
    );
  }
  return (
    <Badge
      variant="destructive"
      className="bg-red-500/10 text-red-600 border-red-500/20"
    >
      <AlertCircle className="w-3 h-3 mr-1" />
      Error
    </Badge>
  );
}
