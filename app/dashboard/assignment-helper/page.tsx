import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { AssignmentList } from "@/components/dashboard/assignment-list";

export default async function AssignmentHelperPage() {
  const { userId } = await auth();

  const assignments = userId
    ? await db.assignment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { files: true },
      })
    : [];

  return <AssignmentList initialAssignments={assignments} />;
}
