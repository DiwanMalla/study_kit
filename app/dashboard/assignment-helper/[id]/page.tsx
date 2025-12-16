import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { AssignmentSolution } from "./assignment-solution";

export default async function AssignmentPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const { id } = await params;
    const assignment = await db.assignment.findUnique({
        where: {
            id,
            userId,
        },
        include: {
            files: true,
        },
    });

    if (!assignment) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <AssignmentSolution initialAssignment={assignment} />
        </div>
    );
}
