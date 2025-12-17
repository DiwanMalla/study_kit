import { Sidebar } from "@/components/layout/sidebar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (userId) {
    const user = await currentUser();
    const email =
      user?.emailAddresses[0]?.emailAddress || `user_${userId}@example.com`;

    await db.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        name: user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "Student",
      },
      create: {
        clerkId: userId,
        email,
        name: user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "Student",
      },
    });
  }

  return (
    <div className="flex bg-background">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-6">{children}</main>
    </div>
  );
}
