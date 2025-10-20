import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Trash2, ArrowLeft, Check, MapPin, Clock, User, Phone, Calendar } from "lucide-react";

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

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/menu")}
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 sm:p-2"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Order Review</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Review your order before confirming
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <Badge variant="secondary" className="h-6 px-2 text-xs">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Order Details Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="px-4 sm:px-6 pb-3">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Student Name</div>
                        <div className="font-medium">{orderDetails.studentName}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Phone Number</div>
                        <div className="font-medium">{orderDetails.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Delivery Date</div>
                        <div className="font-medium">{orderDetails.deliveryDate}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Student ID</div>
                      <div className="font-medium">{orderDetails.studentId}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={orderDetails.orderType === "delivery" ? "default" : "secondary"}>
                        {orderDetails.orderType === "delivery" ? "🚚 Delivery" : "🏢 Cafeteria"}
                      </Badge>
                    </div>

                    {orderDetails.timeSlot && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Preferred Time</div>
                          <div className="font-medium">{orderDetails.timeSlot}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {orderDetails.orderType === "delivery" && (
                  <div className="p-3 sm:p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Delivery Address</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Block Type</div>
                        <div className="font-medium">{orderDetails.blockType}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Dorm Number</div>
                        <div className="font-medium">{orderDetails.dormNumber}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cart Items Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="px-4 sm:px-6 pb-3">
                <CardTitle className="text-lg sm:text-xl">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground font-medium">
                      Your cart is empty
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Add some delicious items from our menu
                    </p>
                    <Button 
                      onClick={() => navigate("/student/menu")} 
                      className="mt-4"
                    >
                      Browse Menu
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {cart.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              ETB {item.price.toFixed(2)} each
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className="font-bold text-sm sm:text-base text-primary">
                            ETB {(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>ETB {getTotalPrice().toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-lg sm:text-xl font-bold">
                        <span>Total Amount</span>
                        <span className="text-primary">ETB {getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confirm Order Button */}
            {cart.length > 0 && (
              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-background mr-2" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Confirm Order • ETB {getTotalPrice().toFixed(2)}
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  By confirming, you agree to our terms and conditions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;