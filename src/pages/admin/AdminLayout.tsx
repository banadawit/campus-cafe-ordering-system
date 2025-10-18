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
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[8px] sm:text-[10px] rounded-full h-3 w-3 sm:h-4 sm:min-w-4 px-0.5 sm:px-1 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </summary>
        <div className="absolute right-0 mt-2 w-72 sm:w-80 z-20">
          <Card className="p-2 sm:p-3 shadow-lg border bg-popover">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-sm sm:text-base">Notifications</div>
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                <Button size="xs" variant="outline" onClick={markAllRead} className="text-[8px] sm:text-xs px-1 sm:px-2 py-1">Mark all read</Button>
                <Button size="xs" variant="ghost" onClick={clear} className="text-[8px] sm:text-xs px-1 sm:px-2 py-1">Clear</Button>
              </div>
            </div>
            <div className="max-h-60 sm:max-h-80 overflow-auto space-y-2">
              {notifications.length === 0 ? (
                <div className="text-xs sm:text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="text-xs sm:text-sm border rounded p-2 bg-card">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Order #{n.orderId}</div>
                      {!n.read && <span className="text-[8px] sm:text-[10px] text-primary">NEW</span>}
                    </div>
                    <div className="text-muted-foreground text-[10px] sm:text-xs">{n.studentName} • {n.orderType}</div>
                    <div className="text-[8px] sm:text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString()}</div>
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
            <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-6 sticky top-0 z-10">
              <SidebarTrigger className="mr-2 sm:mr-4" />
              <h1 className="text-base sm:text-lg font-semibold truncate">Admin Dashboard</h1>
              <div className="ml-auto flex items-center gap-2 sm:gap-4">
                <BellDropdown />
              </div>
            </header>
            <main className="flex-1 p-3 sm:p-6 bg-background">
              <Outlet />
            </main>
          </div>
        </div>
      </NotificationsProvider>
    </SidebarProvider>
  );
};

export default AdminLayout;
