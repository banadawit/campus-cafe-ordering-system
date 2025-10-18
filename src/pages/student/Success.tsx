import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home } from "lucide-react";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardContent className="pt-8 sm:pt-12 pb-6 sm:pb-8 space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="flex justify-center">
                <div className="bg-green-500/10 p-4 sm:p-6 rounded-full">
                  <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Order Placed!</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Thank you! Your order has been successfully placed.
                </p>
              </div>

              {orderId && (
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Order ID</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">#{orderId}</p>
                </div>
              )}

              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p>Your order is being prepared.</p>
                <p>You will be notified when it's ready.</p>
              </div>

              <Button
                size="lg"
                className="w-full h-11 sm:h-12"
                onClick={() => navigate("/")}
              >
                <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Back to Home</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Success;
