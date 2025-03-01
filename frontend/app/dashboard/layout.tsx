import DashboardNavigation from "./nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background text-text">
      <DashboardNavigation />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
