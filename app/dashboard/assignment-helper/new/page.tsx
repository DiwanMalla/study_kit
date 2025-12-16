import { AssignmentForm } from "./assignment-form";

export default function NewAssignmentPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">New Assignment</h1>
        <p className="text-muted-foreground">
          Create a new assignment helper session. Upload your files or paste instructions.
        </p>
      </div>
      <AssignmentForm />
    </div>
  );
}
