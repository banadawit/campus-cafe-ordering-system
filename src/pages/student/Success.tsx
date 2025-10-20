import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, UtensilsCrossed } from "lucide-react";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-background to-green-100/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-8 sm:pt-12 pb-6 sm:pb-8 space-y-6 sm:space-y-8 px-6 sm:px-8">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="bg-green-500/20 p-4 sm:p-5 rounded-full">
                  <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <div className="bg-green-100 border-2 border-white rounded-full p-1">
                    <UtensilsCrossed className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Order Confirmed!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Thank you for your order! We're preparing your food with care.
              </p>
            </div>

            {/* Order ID */}
            {orderId && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-green-700 font-medium mb-2">
                  Your Order Number
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-green-800">
                  #{orderId}
                </p>
              </div>
            )}

            {/* Additional Information */}
            <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <p className="font-medium">What's next?</p>
              <div className="space-y-1">
                <p>• Your order is being prepared fresh</p>
                <p>• You'll receive updates on your order status</p>
                <p>• Estimated ready time: 15-20 minutes</p>
              </div>
            </div>

            {/* Action Button */}
            <Button
              size="lg"
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-lg"
              onClick={() => navigate("/")}
            >
              <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Return to Homepage
            </Button>

            {/* Quick Tip */}
            <p className="text-xs text-muted-foreground">
              Hungry for more? Come back anytime!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Success;