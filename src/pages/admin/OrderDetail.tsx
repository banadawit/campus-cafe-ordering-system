import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OrderItem {
  id: number;
  quantity: number;
  food: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
}

interface OrderDetail {
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
  order_items: OrderItem[];
}

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            food:food_id (
              id,
              name,
              price,
              category
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
      navigate("/admin/orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("receipt-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`order-${order?.id}-receipt.pdf`);

      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Button onClick={() => navigate("/admin/orders")} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  const calculateTotal = () => {
    return order.order_items.reduce((sum, item) => {
      return sum + item.quantity * item.food.price;
    }, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons - Hide on print */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <Card id="receipt-content" className="max-w-3xl mx-auto">
        <CardHeader className="text-center border-b">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">Campus Café</h1>
            <p className="text-sm text-muted-foreground">Lunch Ordering System</p>
          </div>
          <CardTitle className="text-xl">Order Receipt</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-semibold text-lg">#{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={order.status === "completed" ? "secondary" : "default"}
                className={order.status === "pending" ? "bg-yellow-500" : "bg-green-600"}
              >
                {order.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Slot</p>
              <p className="font-medium">{order.time_slot || "ASAP"}</p>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-medium">{order.student_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-medium">{order.student_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Type</p>
                <Badge variant="outline" className="font-medium">
                  {order.order_type}
                </Badge>
              </div>
              {order.order_type === "delivery" && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Block Type</p>
                    <p className="font-medium">{order.block_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dorm Number</p>
                    <p className="font-medium">{order.dorm_number}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.food.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.food.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {item.quantity} × ${item.food.price.toFixed(2)}
                    </p>
                    <p className="text-sm font-semibold">
                      ${(item.quantity * item.food.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
            <p className="text-lg font-semibold">Grand Total</p>
            <p className="text-2xl font-bold text-primary">
              ${calculateTotal().toFixed(2)}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Thank you for your order!</p>
            <p>Campus Café - Serving delicious meals daily</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;
