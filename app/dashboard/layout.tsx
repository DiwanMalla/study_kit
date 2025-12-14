import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-6">{children}</main>
    </div>
  );
}
