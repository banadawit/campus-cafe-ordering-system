import { useEffect, useMemo, useRef, useState } from "react";
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
  delivery_date: string | null;
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
  const receiptRef = useRef<HTMLDivElement | null>(null);

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

  const printReceipt = () => {
    // Hide non-receipt elements using print utilities
    window.print();
  };

  const loadHtml2Pdf = async (): Promise<any> => {
    // Load html2pdf lazily from CDN to keep bundle light
    const existing = (window as any).html2pdf;
    if (existing) return existing;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load html2pdf.js"));
      document.body.appendChild(script);
    });
    return (window as any).html2pdf;
  };

  const downloadPdf = async () => {
    try {
      if (!receiptRef.current) return;
      const html2pdf = await loadHtml2Pdf();
      const filename = `order-${order?.id ?? "receipt"}.pdf`;
      // Use the actual visible element to preserve styles and avoid blank renders
      const el = receiptRef.current as HTMLDivElement;
      const prevClass = el.className;
      const prevStyle = el.getAttribute("style") || "";
      // Force single column layout and set a white background/width temporarily
      el.className = `${prevClass.replace(/md:grid-cols-2/g, "")} grid grid-cols-1 gap-6`;
      el.setAttribute("style", `${prevStyle};background:#ffffff;max-width:800px;margin:0 auto;padding:16px;`);

      const opt = {
        margin: [10, 10, 10, 10],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      } as const;

      // Ensure fonts and images are ready
      await document.fonts.ready.catch(() => undefined);
      const images = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
      await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); })));

      await html2pdf().from(el).set(opt).save();

      // Restore element
      el.className = prevClass;
      if (prevStyle) {
        el.setAttribute("style", prevStyle);
      } else {
        el.removeAttribute("style");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate PDF";
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
    <div className="space-y-6 print:space-y-0">
      <Button variant="ghost" onClick={() => navigate("/admin/orders")} className="print:hidden"> 
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <div className="flex items-center justify-between print:hidden">
        <div className="text-xl font-semibold">Order #{order.id}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printReceipt}>Print Receipt</Button>
          <Button onClick={downloadPdf}>Download PDF</Button>
        </div>
      </div>

      <div ref={receiptRef} className="grid gap-6 md:grid-cols-2 print:grid-cols-1">
        <Card className="print:border-0 print:shadow-none">
          <CardHeader>
            <CardTitle className="print:hidden">Order Details</CardTitle>
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
              <span className="text-muted-foreground">Delivery Date:</span>
              <span className="font-medium">{order.delivery_date ?? new Date(order.created_at).toISOString().slice(0,10)}</span>
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

        <Card className="print:border-0 print:shadow-none">
          <CardHeader>
            <CardTitle className="print:hidden">Items</CardTitle>
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
                        ETB {Number(it.price_at_time).toFixed(2)} × {it.quantity}
                      </div>
                    </div>
                    <div className="font-semibold">ETB {(Number(it.price_at_time) * it.quantity).toFixed(2)}</div>
                  </div>
                ))}

                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">ETB {total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Printable Receipt (used only for Ctrl+P printing) */}
      <div className="print:block hidden">
        <div className="max-w-2xl mx-auto p-6 text-sm">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3">
              <img src="/favicon.ico" alt="Cafe Logo" className="h-8 w-8" />
              <div className="text-lg font-bold">Campus Cafe Ordering System</div>
            </div>
            <div className="text-xs text-muted-foreground">Receipt • Order #{order.id}</div>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student</span>
              <span className="font-medium">{order.student_name} ({order.student_id})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{order.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{order.order_type}</span>
            </div>
            {order.order_type === "delivery" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{order.block_type} - {order.dorm_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{order.time_slot || "ASAP"}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="font-semibold mb-2">Items</div>
            <div className="divide-y">
              {items.map((it) => (
                <div key={it.id} className="py-2 flex justify-between">
                  <div>
                    <div className="font-medium">{it.food?.name ?? `Item #${it.food_id}`}</div>
                    <div className="text-xs text-muted-foreground">ETB {Number(it.price_at_time).toFixed(2)} × {it.quantity}</div>
                  </div>
                  <div className="font-medium">ETB {(Number(it.price_at_time) * it.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>ETB {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Thank you for ordering with us!
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;


