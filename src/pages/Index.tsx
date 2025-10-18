import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, ShoppingBag, Clock, Truck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-accent rounded-full mb-4 sm:mb-6">
            <UtensilsCrossed className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
            Campus Lunch Ordering
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
            Order delicious meals from our campus café. Fast, easy, and convenient!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button size="lg" className="shadow-lg w-full sm:w-auto" asChild>
              <Link to="/student">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Order Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link to="/auth">Admin Login</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <Card className="shadow-card">
            <CardHeader className="text-center sm:text-left">
              <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-2 mx-auto sm:mx-0" />
              <CardTitle className="text-lg sm:text-xl">Quick & Easy</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Order in minutes and skip the line at the cafeteria
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="text-center sm:text-left">
              <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-2 mx-auto sm:mx-0" />
              <CardTitle className="text-lg sm:text-xl">Delivery or Pickup</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Get your food delivered to your dorm or pick it up at the café
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center sm:text-left">
              <UtensilsCrossed className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-2 mx-auto sm:mx-0" />
              <CardTitle className="text-lg sm:text-xl">Fresh Daily</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                All meals prepared fresh daily with quality ingredients
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12 sm:mt-16 text-center">
          <Card className="max-w-2xl mx-auto shadow-elevated">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 text-left px-4 sm:px-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 text-sm sm:text-base">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-base sm:text-lg">Browse Menu</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Check out our delicious selection of meals and drinks
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 text-sm sm:text-base">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-base sm:text-lg">Place Your Order</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Select your items, choose delivery or pickup, and submit
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 text-sm sm:text-base">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-base sm:text-lg">Enjoy Your Meal</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
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
