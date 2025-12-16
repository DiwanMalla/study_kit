import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const files = formData.getAll("files") as File[];

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Ensure user exists in database
    const user = await currentUser();
    const email =
      user?.emailAddresses[0]?.emailAddress || `user_${userId}@example.com`;

    await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: email,
        name: user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "Student",
      },
    });

    const assignment = await db.assignment.create({
      data: {
        userId,
        title,
        description,
        status: "processing",
      },
    });

    if (files && files.length > 0) {
      for (const file of files) {
        const blob = await put(file.name, file, {
          access: "public",
          addRandomSuffix: true,
        });

        await db.file.create({
          data: {
            userId,
            assignmentId: assignment.id,
            name: file.name,
            url: blob.url,
            type: file.type,
            size: file.size,
            status: "uploaded",
          },
        });
      }
    }

    // Trigger solving as a best-effort background request.
    // This prevents assignments from getting stuck in "processing" if the client
    // navigates away before it can call the solve endpoint.
    try {
      const cookieHeader = request.headers.get("cookie") || "";
      const origin = new URL(request.url).origin;
      void fetch(`${origin}/api/assignments/${assignment.id}/solve`, {
        method: "POST",
        headers: {
          cookie: cookieHeader,
        },
      }).catch((e) => console.error("Failed to trigger assignment solve", e));
    } catch (e) {
      console.error("Failed to schedule assignment solve", e);
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENTS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const assignments = await db.assignment.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        files: true,
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("[ASSIGNMENTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
