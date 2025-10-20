import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, X, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications, NotificationsProvider } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

function BellDropdown() {
  const { notifications, unreadCount, markAllRead, clear, markAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const details = dropdownRef.current.closest('details');
        if (details) {
          details.open = false;
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[8px] sm:text-[10px] min-w-0"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 sm:w-96 max-h-[80vh]"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="text-base font-semibold">Notifications</span>
            <div className="flex gap-1">
              {notifications.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={markAllRead}
                    className="h-7 w-7"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clear}
                    className="h-7 w-7 text-destructive"
                    title="Clear all notifications"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </>
              )}
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <ScrollArea className="h-64 sm:h-72">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">No notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    New orders will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-1">
                  {notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                        notification.read 
                          ? 'bg-muted/50 border-muted' 
                          : 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          notification.read ? 'bg-muted-foreground/50' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate">
                                Order #{notification.orderId}
                              </span>
                              {!notification.read && (
                                <Badge variant="default" className="px-1 py-0 text-[10px]">
                                  New
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                              {formatTime(new Date(notification.createdAt))}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            <span className="font-medium">{notification.studentName}</span>
                            <span className="mx-1">•</span>
                            <span className="capitalize">{notification.orderType}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className="text-xs capitalize px-1.5 py-0"
                            >
                              {notification.orderType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DropdownMenuGroup>
          
          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
                  <span>{unreadCount} unread</span>
                </div>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <NotificationsProvider>
        <div className="min-h-screen flex w-full bg-background">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>
          
          {/* Mobile sidebar will be handled by SidebarTrigger */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <header className="h-14 sm:h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40">
              <div className="flex items-center h-full px-4 sm:px-6">
                {/* Mobile sidebar trigger */}
                <SidebarTrigger className="lg:hidden mr-3" />
                
                {/* Logo/Brand */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Cafe Ordering System
                    </p>
                  </div>
                </div>

                {/* Navigation actions */}
                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                  {/* Notifications */}
                  <BellDropdown />
                  
                  {/* User profile placeholder */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-muted rounded-full flex items-center justify-center border">
                      <span className="text-sm font-medium text-muted-foreground">A</span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">Admin User</p>
                      <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-4 sm:p-6 bg-background">
              <div className="max-w-7xl mx-auto w-full">
                <Outlet />
              </div>
            </main>

            {/* Mobile footer */}
            <footer className="lg:hidden border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky bottom-0 z-30">
              <div className="flex items-center justify-around h-16 px-4">
                <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                  <div className="w-6 h-6 bg-muted rounded" />
                  <span className="text-[10px]">Dashboard</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                  <div className="w-6 h-6 bg-muted rounded" />
                  <span className="text-[10px]">Orders</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                  <div className="w-6 h-6 bg-muted rounded" />
                  <span className="text-[10px]">Menu</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                  <div className="w-6 h-6 bg-muted rounded" />
                  <span className="text-[10px]">Analytics</span>
                </Button>
              </div>
            </footer>
          </div>
        </div>
      </NotificationsProvider>
    </SidebarProvider>
  );
};

export default AdminLayout;