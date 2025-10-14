import { createContext, useContext, useMemo, useState } from "react";

export interface AdminNotification {
  id: string; // unique key
  createdAt: number;
  orderId: number;
  studentName: string;
  orderType: string;
  read: boolean;
}

interface NotificationsContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  add: (n: Omit<AdminNotification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  clear: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const add: NotificationsContextType["add"] = (n) => {
    setNotifications((prev) => {
      const next: AdminNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: Date.now(),
        orderId: n.orderId,
        studentName: n.studentName,
        orderType: n.orderType,
        read: false,
      };
      // Keep only last 20
      return [next, ...prev].slice(0, 20);
    });
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clear = () => setNotifications([]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, add, markAllRead, clear }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}


