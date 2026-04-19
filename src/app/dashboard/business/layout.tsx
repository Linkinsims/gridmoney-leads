import { Sidebar } from "@/components/dashboard/Sidebar";

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="business" />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
