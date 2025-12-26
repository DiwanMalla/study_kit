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
    const assignment = await db.assignment.findFirst({
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

    return <AssignmentSolution initialAssignment={assignment} />;
}
