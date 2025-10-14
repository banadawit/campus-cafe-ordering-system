import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, Phone, MapPin, Clock, CheckCircle, Trash2 } from "lucide-react";
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

interface OrderRow {
  id: number;
  student_name: string;
  student_id: string;
  phone: string;
  order_type: string;
  block_type: string | null;
  dorm_number: string | null;
  time_slot: string | null;
  status: "pending" | "completed";
  created_at: string;
}

interface OrderItemRow {
  id: number;
  food_id: number;
  order_id: number;
  quantity: number;
  price_at_time: number;
  food?: { name: string };
}

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    void fetchOrder(+id);
  }, [id]);

  const fetchOrder = async (orderId: number) => {
    try {
      const [{ data: orderData, error: orderError }, { data: itemsData, error: itemsError }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase
          .from("order_items")
          .select("id, food_id, order_id, quantity, price_at_time, food(name)")
          .eq("order_id", orderId),
      ]);

      if (orderError) throw orderError;
      if (itemsError) throw itemsError;

      setOrder(orderData as OrderRow);
      setItems((itemsData as any) || []);
    } catch (error: any) {
      toast({ title: "Not Found", description: "Order could not be loaded", variant: "destructive" });
      navigate("/admin/orders");
    } finally {
      setIsLoading(false);
    }
  };

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum += Number(it.price_at_time) * it.quantity, 0);
  }, [items]);

  const markCompleted = async () => {
    if (!order) return;
    try {
      const { error } = await supabase.from("orders").update({ status: "completed" }).eq("id", order.id);
      if (error) throw error;
      setOrder({ ...order, status: "completed" });
      toast({ title: "Success", description: "Order marked as completed" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update order";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const deleteOrder = async () => {
    if (!order) return;
    try {
      const { error } = await supabase.from("orders").delete().eq("id", order.id);
      if (error) throw error;
      toast({ title: "Order Deleted", description: `Order #${order.id} removed.` });
      navigate("/admin/orders");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete order";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/admin/orders")}> 
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order #{order.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.student_name}</span>
              <span className="text-muted-foreground">({order.student_id})</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" /> {order.phone}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> {order.time_slot || "ASAP"}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={order.order_type === "delivery" ? "default" : "secondary"}>{order.order_type}</Badge>
              {order.order_type === "delivery" && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {order.block_type} - {order.dorm_number}
                </span>
              )}
            </div>
            <div>
              <Badge variant={order.status === "completed" ? "secondary" : "default"}>{order.status}</Badge>
            </div>
            <div className="flex gap-2 mt-2">
              {order.status === "pending" && (
                <Button onClick={markCompleted}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Mark as completed
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete order #{order.id}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the order and its items. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteOrder}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <div className="text-muted-foreground">No items found.</div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.food?.name ?? `Item #${it.food_id}`}</div>
                      <div className="text-sm text-muted-foreground">
                        ${Number(it.price_at_time).toFixed(2)} × {it.quantity}
                      </div>
                    </div>
                    <div className="font-semibold">${(Number(it.price_at_time) * it.quantity).toFixed(2)}</div>
                  </div>
                ))}

                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;


