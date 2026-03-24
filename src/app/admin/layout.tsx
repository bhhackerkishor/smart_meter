import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
      <AdminSidebar />
      <div className="pl-64">
        {children}
      </div>
    </div>
  );
}
