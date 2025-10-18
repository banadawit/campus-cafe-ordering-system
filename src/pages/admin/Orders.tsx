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
import { Clock, User, Phone, MapPin, CheckCircle, Eye, Trash2, Search, Filter } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Order {
  id: number;
  student_name: string;
  student_id: string;
  phone: string;
  order_type: string;
  block_type: string | null;
  dorm_number: string | null;
  time_slot: string | null;
  delivery_date: string | null;
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
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
      const withDates = (data || []).map((o: Record<string, unknown>) => ({
        ...o,
        delivery_date: o.delivery_date ?? null,
      })) as Order[];
      setOrders(withDates);
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

  const availableDates = useMemo(() => {
    const values = Array.from(
      new Set(
        orders
          .map((o) => o.delivery_date ?? new Date().toISOString().slice(0, 10))
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
      if (dateFilter !== "all") {
        const d = (o.delivery_date ?? new Date().toISOString().slice(0, 10)).toString();
        if (d !== dateFilter) return false;
      }
      if (q.length > 0) {
        const name = (o.student_name ?? "").toLowerCase();
        const dorm = (o.dorm_number ?? "").toLowerCase();
        const phone = (o.phone ?? "").toLowerCase();
        const studentId = (o.student_id ?? "").toLowerCase();
        if (!name.includes(q) && !dorm.includes(q) && !phone.includes(q) && !studentId.includes(q)) return false;
      }
      return true;
    });
  }, [orders, searchQuery, statusFilter, blockTypeFilter, timeSlotFilter, dateFilter]);

  // Mobile order card component
  const MobileOrderCard = ({ order }: { order: Order }) => (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => navigate(`/admin/orders/${order.id}`)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">#{order.id}</Badge>
              <Badge variant={order.status === "completed" ? "secondary" : "default"} 
                className={order.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""}>
                {order.status}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              {order.student_name}
            </h3>
            <p className="text-xs text-muted-foreground">ID: {order.student_id}</p>
          </div>
          <Badge variant={order.order_type === "delivery" ? "default" : "secondary"} className="text-xs">
            {order.order_type}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">{order.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">{order.time_slot || "ASAP"}</span>
          </div>
        </div>

        {order.order_type === "delivery" && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">{order.block_type} - {order.dorm_number}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {order.delivery_date ?? new Date(order.created_at).toISOString().slice(0,10)}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/orders/${order.id}`);
              }}
              className="h-8 px-2"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {order.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(order.id, "completed");
                }}
                className="h-8 px-2"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Orders Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">View and manage all lunch orders</p>
      </div>

      {/* Stats and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="grid grid-cols-2 gap-4 flex-1 max-w-md">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingOrders.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedOrders.length}</div>
            </CardContent>
          </Card>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full lg:w-auto">
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Orders
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

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">All Orders</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing</span>
              <Badge variant="secondary">{filteredOrders.length}</Badge>
              <span>of {orders.length} orders</span>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="sm:col-span-2 lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, dorm, phone, or ID..."
                className="pl-10 h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={blockTypeFilter} onValueChange={(v) => setBlockTypeFilter(v)}>
              <SelectTrigger className="h-10">
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
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Time slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All times</SelectItem>
                {availableTimeSlots.map((ts) => (
                  <SelectItem key={ts} value={ts}>{ts}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Delivery date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                {availableDates.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="pl-10 h-10"
              />
            </div>
            
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(statusFilter !== "all" || blockTypeFilter !== "all" || timeSlotFilter !== "all" || dateFilter !== "all") && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader className="text-left">
                  <SheetTitle>Filter Orders</SheetTitle>
                  <SheetDescription>
                    Apply filters to find specific orders
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
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
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Block Type</label>
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
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Slot</label>
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
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Delivery Date</label>
                    <Select value={dateFilter} onValueChange={(v) => setDateFilter(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Delivery date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All dates</SelectItem>
                        {availableDates.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Mobile View - Cards */}
          <div className="lg:hidden space-4 p-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-lg font-medium">No orders found</div>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <MobileOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-lg font-medium">No orders found</div>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Order ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow 
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{order.student_name}</div>
                              <div className="text-sm text-muted-foreground">{order.student_id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {order.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={order.order_type === "delivery" ? "default" : "secondary"}>
                              {order.order_type}
                            </Badge>
                            {order.order_type === "delivery" && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {order.block_type} - {order.dorm_number}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {order.time_slot || "ASAP"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.delivery_date ?? new Date(order.created_at).toISOString().slice(0,10)}
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
                              <Eye className="h-4 w-4" />
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
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;