import DashboardNav from '@/components/dashboard/DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-12">{children}</main>
    </div>
  );
}
