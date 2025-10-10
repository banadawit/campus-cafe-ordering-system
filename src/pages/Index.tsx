import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, ShoppingBag, Clock, Truck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mb-6">
            <UtensilsCrossed className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Campus Lunch Ordering
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Order delicious meals from our campus café. Fast, easy, and convenient!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="shadow-lg">
              <ShoppingBag className="mr-2" />
              Order Now (Coming Soon)
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Admin Login</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="shadow-card">
            <CardHeader>
              <Clock className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Quick & Easy</CardTitle>
              <CardDescription>
                Order in minutes and skip the line at the cafeteria
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <Truck className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Delivery or Pickup</CardTitle>
              <CardDescription>
                Get your food delivered to your dorm or pick it up at the café
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <UtensilsCrossed className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Fresh Daily</CardTitle>
              <CardDescription>
                All meals prepared fresh daily with quality ingredients
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto shadow-elevated">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Browse Menu</h3>
                  <p className="text-sm text-muted-foreground">
                    Check out our delicious selection of meals and drinks
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Place Your Order</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your items, choose delivery or pickup, and submit
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Enjoy Your Meal</h3>
                  <p className="text-sm text-muted-foreground">
                    Get your food delivered or pick it up when ready
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
