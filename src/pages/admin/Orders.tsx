import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { Clock, User, Phone, MapPin, CheckCircle, Eye, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: number;
  student_name: string;
  student_id: string;
  phone: string;
  order_type: string;
  block_type: string | null;
  dorm_number: string | null;
  time_slot: string | null;
  status: string;
  created_at: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [blockTypeFilter, setBlockTypeFilter] = useState<string>("all");
  const [timeSlotFilter, setTimeSlotFilter] = useState<string>("all");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const { add } = useNotifications();

  const playNotification = () => {
    try {
      if (!audioCtxRef.current) {
        const AnyWindow = window as unknown as { webkitAudioContext?: typeof AudioContext };
        audioCtxRef.current = new (window.AudioContext || AnyWindow.webkitAudioContext!)();
      }
      const ctx = audioCtxRef.current!;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880; // A5
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      // quick attack/decay
      g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      o.stop(ctx.currentTime + 0.3);
    } catch {
      // ignore sound errors (e.g., autoplay policies)
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload: unknown) => {
          // Refresh list on any change
          fetchOrders();

          const p = payload as { eventType?: string; new?: Partial<Order> };
          if (p && p.eventType === "INSERT" && p.new) {
            const newOrder = p.new;
            // Show toast with details
            toast({
              title: "New Order Received",
              description: `#${newOrder.id} • ${newOrder.student_name} • ${String(newOrder.order_type)}`,
            });
            // Add to notifications store
            if (typeof newOrder.id === "number" && newOrder.student_name && newOrder.order_type) {
              add({ orderId: newOrder.id, studentName: newOrder.student_name, orderType: String(newOrder.order_type) });
            }
            // Play chime
            playNotification();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [add]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: "pending" | "completed") => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order marked as ${newStatus}`,
      });

      fetchOrders();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update order status";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const resetAllOrders = async () => {
    try {
      const { error } = await supabase.rpc("reset_orders");
      if (error) throw error;

      toast({ title: "Orders Reset", description: "All orders cleared and IDs restarted." });
      fetchOrders();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to reset orders";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  // Deletion is handled on the detail page to keep the list simple

  // Derive filter option lists from loaded data
  const availableBlockTypes = useMemo(() => {
    const values = Array.from(
      new Set(
        orders
          .map((o) => o.block_type)
          .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));
    return values;
  }, [orders]);

  const availableTimeSlots = useMemo(() => {
    const values = Array.from(
      new Set(
        orders
          .map((o) => o.time_slot ?? "ASAP")
          .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));
    return values;
  }, [orders]);

  // Compose client-side filtering and search
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (blockTypeFilter !== "all") {
        const bt = (o.block_type ?? "").toString();
        if (bt !== blockTypeFilter) return false;
      }
      if (timeSlotFilter !== "all") {
        const ts = (o.time_slot ?? "ASAP").toString();
        if (ts !== timeSlotFilter) return false;
      }
      if (q.length > 0) {
        const name = (o.student_name ?? "").toLowerCase();
        const dorm = (o.dorm_number ?? "").toLowerCase();
        if (!name.includes(q) && !dorm.includes(q)) return false;
      }
      return true;
    });
  }, [orders, searchQuery, statusFilter, blockTypeFilter, timeSlotFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">View and manage all lunch orders</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="grid gap-4 md:grid-cols-2 w-full md:w-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{pendingOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{completedOrders.length}</div>
          </CardContent>
        </Card>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4 md:mt-0">
              <Trash2 className="h-4 w-4 mr-2" /> Reset Orders
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all orders?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete ALL orders and items and restart IDs from 1. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={resetAllOrders}>Confirm Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>All Orders</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name or dorm number"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={blockTypeFilter} onValueChange={(v) => setBlockTypeFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Block type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All blocks</SelectItem>
                  {availableBlockTypes.map((bt) => (
                    <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeSlotFilter} onValueChange={(v) => setTimeSlotFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All times</SelectItem>
                  {availableTimeSlots.map((ts) => (
                    <SelectItem key={ts} value={ts}>{ts}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matching orders.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow 
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{order.student_name}</div>
                          <div className="text-xs text-muted-foreground">{order.student_id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {order.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.order_type === "delivery" ? "default" : "secondary"}>
                        {order.order_type}
                      </Badge>
                      {order.order_type === "delivery" && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {order.block_type} - {order.dorm_number}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {order.time_slot || "ASAP"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={order.status === "completed" ? "secondary" : "default"}
                        className={order.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/orders/${order.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, "completed");
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
