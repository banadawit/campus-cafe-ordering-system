import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Trash2, ArrowLeft, Check } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, orderDetails, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmOrder = async () => {
    if (!orderDetails) {
      toast({
        title: "Error",
        description: "Order details are missing",
        variant: "destructive",
      });
      navigate("/student");
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          student_name: orderDetails.studentName,
          student_id: orderDetails.studentId,
          phone: orderDetails.phone,
          order_type: orderDetails.orderType,
          block_type: orderDetails.orderType === "delivery" ? orderDetails.blockType : null,
          dorm_number: orderDetails.orderType === "delivery" ? orderDetails.dormNumber : null,
          time_slot: orderDetails.timeSlot || null,
          delivery_date: orderDetails.deliveryDate,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with price captured at order time
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        food_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price, // preserve price used at checkout
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems, { returning: "minimal" });

      if (itemsError) throw itemsError;

      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed",
      });

      navigate("/student/success", { state: { orderId: orderData.id } });
      clearCart();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderDetails) {
    navigate("/student");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/student/menu")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-3 rounded-full">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Cart</h1>
              <p className="text-muted-foreground">Review and confirm your order</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{orderDetails.studentName}</span>
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{orderDetails.studentId}</span>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{orderDetails.phone}</span>
                  <span className="text-muted-foreground">Delivery Date:</span>
                  <span className="font-medium">{orderDetails.deliveryDate}</span>
                  <span className="text-muted-foreground">Order Type:</span>
                  <span className="font-medium capitalize">{orderDetails.orderType}</span>
                  {orderDetails.orderType === "delivery" && (
                    <>
                      <span className="text-muted-foreground">Block:</span>
                      <span className="font-medium">{orderDetails.blockType}</span>
                      <span className="text-muted-foreground">Dorm:</span>
                      <span className="font-medium">{orderDetails.dormNumber}</span>
                    </>
                  )}
                  {orderDetails.timeSlot && (
                    <>
                      <span className="text-muted-foreground">Time Slot:</span>
                      <span className="font-medium">{orderDetails.timeSlot}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items ({cart.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Your cart is empty. Add some items from the menu!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ETB {item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            ETB {(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">ETB {getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {cart.length > 0 && (
              <Button
                size="lg"
                className="w-full"
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Confirm Order
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
