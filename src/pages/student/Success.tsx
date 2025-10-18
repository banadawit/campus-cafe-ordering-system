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
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8 space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-500/10 p-6 rounded-full">
                  <CheckCircle className="h-20 w-20 text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Order Placed!</h1>
                <p className="text-muted-foreground">
                  Thank you! Your order has been successfully placed.
                </p>
              </div>

              {orderId && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                  <p className="text-2xl font-bold text-primary">#{orderId}</p>
                </div>
              )}

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Your order is being prepared.</p>
                <p>You will be notified when it's ready.</p>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate("/")}
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Success;
