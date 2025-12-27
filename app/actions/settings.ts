"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface UserSettings {
  enabledModels?: string[];
}

export async function getUserSettings(): Promise<UserSettings> {
  const { userId } = await auth();
  if (!userId) {
    return {};
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { settings: true },
  });

  return (user?.settings as UserSettings) || {};
}

export async function updateUserSettings(settings: UserSettings) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db.user.update({
    where: { clerkId: userId },
    data: {
      settings: settings as any,
    },
  });

  revalidatePath("/dashboard/settings");
}
