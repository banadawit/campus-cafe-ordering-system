import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { useNotifications, NotificationsProvider } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function BellDropdown() {
  const { notifications, unreadCount, markAllRead, clear } = useNotifications();
  return (
    <div className="relative">
      <details className="group">
        <summary className="list-none cursor-pointer">
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </summary>
        <div className="absolute right-0 mt-2 w-80 z-20">
          <Card className="p-3 shadow-lg border bg-popover">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Notifications</div>
              <div className="flex gap-2">
                <Button size="xs" variant="outline" onClick={markAllRead}>Mark all read</Button>
                <Button size="xs" variant="ghost" onClick={clear}>Clear</Button>
              </div>
            </div>
            <div className="max-h-80 overflow-auto space-y-2">
              {notifications.length === 0 ? (
                <div className="text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="text-sm border rounded p-2 bg-card">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Order #{n.orderId}</div>
                      {!n.read && <span className="text-[10px] text-primary">NEW</span>}
                    </div>
                    <div className="text-muted-foreground">{n.studentName} • {n.orderType}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </details>
    </div>
  );
}

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <NotificationsProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b border-border bg-card flex items-center px-6 sticky top-0 z-10">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <div className="ml-auto flex items-center gap-4">
                <BellDropdown />
              </div>
            </header>
            <main className="flex-1 p-6 bg-background">
              <Outlet />
            </main>
          </div>
        </div>
      </NotificationsProvider>
    </SidebarProvider>
  );
};

export default AdminLayout;
