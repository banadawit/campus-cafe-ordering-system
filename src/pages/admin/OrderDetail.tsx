import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, Phone, MapPin, Clock, CheckCircle, Trash2, Download, Printer, ArrowRight } from "lucide-react";
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
    window.print();
  };

  const loadHtml2Pdf = async (): Promise<any> => {
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
      const el = receiptRef.current as HTMLDivElement;
      const prevClass = el.className;
      const prevStyle = el.getAttribute("style") || "";
      
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

      await document.fonts.ready.catch(() => undefined);
      const images = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
      await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); })));

      await html2pdf().from(el).set(opt).save();

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
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6 print:space-y-0 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/admin/orders")} 
            className="h-9 w-9 p-0 sm:h-auto sm:w-auto sm:p-2"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back to Orders</span>
          </Button>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Order #{order.id}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString()} • {order.status}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={printReceipt}
            className="flex-1 sm:flex-none"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            size="sm"
            onClick={downloadPdf}
            className="flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div ref={receiptRef} className="grid gap-6 lg:grid-cols-2 print:grid-cols-1">
        {/* Order Information Card */}
        <Card className="print:border-0 print:shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg print:hidden">Order Information</CardTitle>
            <div className="print:block hidden text-center">
              <div className="text-lg font-bold">Order #{order.id}</div>
              <div className="text-sm text-muted-foreground">Campus Cafe</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-between items-center print:justify-center">
              <Badge 
                variant={order.status === "completed" ? "secondary" : "default"}
                className={`text-sm ${order.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""}`}
              >
                {order.status}
              </Badge>
              <Badge variant="outline" className="print:hidden">
                {order.order_type}
              </Badge>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground print:text-xs">CUSTOMER</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{order.student_name}</div>
                      <div className="text-xs text-muted-foreground">ID: {order.student_id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{order.phone}</div>
                      <div className="text-xs text-muted-foreground">Contact</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded-lg">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{order.time_slot || "ASAP"}</div>
                      <div className="text-xs text-muted-foreground">Time Slot</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded-lg">
                      <MapPin className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {order.delivery_date ?? new Date(order.created_at).toISOString().slice(0,10)}
                      </div>
                      <div className="text-xs text-muted-foreground">Delivery Date</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            {order.order_type === "delivery" && order.block_type && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground print:text-xs">DELIVERY LOCATION</h3>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.block_type}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Room {order.dorm_number}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 print:hidden">
              {order.status === "pending" && (
                <Button 
                  onClick={markCompleted}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Completed
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Order #{order.id}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the order and all associated items. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={deleteOrder}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Order Items Card */}
        <Card className="print:border-0 print:shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg print:hidden">Order Items</CardTitle>
            <div className="print:block hidden text-center">
              <div className="text-lg font-bold">Order Summary</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-lg">No items found</div>
                <p className="text-sm mt-2">This order doesn't contain any items</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {item.food?.name ?? `Item #${item.food_id}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ETB {Number(item.price_at_time).toFixed(2)} each
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="font-semibold text-sm">
                          ETB {(Number(item.price_at_time) * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Section */}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">ETB {total.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center print:text-left">
                    {items.length} item{items.length !== 1 ? 's' : ''} • Ordered on {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Printable Receipt */}
      <div className="print:block hidden">
        <div className="max-w-2xl mx-auto p-6 text-sm space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                CC
              </div>
              <div className="text-lg font-bold">Campus Cafe</div>
            </div>
            <div className="text-xs text-muted-foreground">Order Receipt • #{order.id}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString()}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-2">Customer</div>
              <div>{order.student_name}</div>
              <div className="text-muted-foreground">ID: {order.student_id}</div>
              <div className="text-muted-foreground">{order.phone}</div>
            </div>
            <div>
              <div className="font-semibold mb-2">Order Info</div>
              <div className="capitalize">{order.order_type}</div>
              <div className="text-muted-foreground">{order.time_slot || "ASAP"}</div>
              {order.order_type === "delivery" && (
                <div className="text-muted-foreground">{order.block_type} - {order.dorm_number}</div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="font-semibold mb-3 border-b pb-1">Items</div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{item.food?.name ?? `Item #${item.food_id}`}</div>
                    <div className="text-xs text-muted-foreground">
                      ETB {Number(item.price_at_time).toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-medium text-right">
                    ETB {(Number(item.price_at_time) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>ETB {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <div>Thank you for your order!</div>
            <div className="mt-1">Campus Cafe Ordering System</div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.5in;
            size: auto;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetail;