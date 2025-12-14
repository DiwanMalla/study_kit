import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new NextResponse("No file provided", { status: 400 });
  }

  try {
    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    });

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

    // Save file to database
    const dbFile = await db.file.create({
      data: {
        userId,
        name: file.name,
        url: blob.url,
        type: file.type,
        size: file.size,
        status: "uploaded",
      },
    });

    return NextResponse.json(dbFile);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
