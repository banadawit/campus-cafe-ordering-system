import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { UtensilsCrossed, Coffee, ShoppingCart, Plus, Minus, Star, TrendingUp } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FoodItem {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  available: boolean;
  category: string;
}

interface PopularItem extends FoodItem {
  orderCount: number;
}

const Menu = () => {
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, orderDetails } = useCart();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const POPULAR_MIN_COUNT = 2;

  useEffect(() => {
    if (!orderDetails) {
      navigate("/student");
      return;
    }
    fetchFoodItems();
    fetchPopularItems();
  }, [orderDetails, navigate]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchPopularItems();
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from("food")
        .select("*")
        .eq("available", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setFoodItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPopularItems = async () => {
    try {
      const { data: orderItems, error: oiErr } = await supabase
        .from("order_items")
        .select("food_id")
        .limit(2000);

      if (oiErr) throw oiErr;

      const countMap = new Map<number, number>();
      (orderItems || []).forEach((row: { food_id: number }) => {
        const fid = Number(row.food_id);
        if (!fid) return;
        countMap.set(fid, (countMap.get(fid) || 0) + 1);
      });

      if (countMap.size === 0) {
        setPopularItems([]);
        return;
      }

      const topIds = Array.from(countMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      const { data: foods, error: foodErr } = await supabase
        .from("food")
        .select("id, name, image, price, available, category, description")
        .in("id", topIds);

      if (foodErr) throw foodErr;

      const foodById = new Map<number, FoodItem>();
      (foods || []).forEach((f: any) => {
        foodById.set(Number(f.id), {
          id: Number(f.id),
          name: String(f.name ?? `Item ${f.id}`),
          price: Number(f.price ?? 0),
          description: f.description ?? null,
          image: f.image ?? null,
          available: Boolean(f.available ?? true),
          category: String(f.category ?? "food"),
        });
      });

      const withCounts: PopularItem[] = topIds
        .map((id) => {
          const food = foodById.get(id);
          if (!food) return null;
          return { ...food, orderCount: countMap.get(id) || 0 } as PopularItem;
        })
        .filter((x): x is PopularItem => Boolean(x))
        .filter((x) => x.orderCount >= POPULAR_MIN_COUNT)
        .slice(0, 5);

      setPopularItems(withCounts);
    } catch (error: any) {
      console.error("Failed to load popular items", error?.message ?? error);
    }
  };

  const getItemQuantity = (id: number) => {
    const item = cart.find((i) => i.id === id);
    return item?.quantity || 0;
  };

  const handleAddToCart = (item: FoodItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
    });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const foodCategoryItems = foodItems.filter((item) => item.category === "food");
  const drinkCategoryItems = foodItems.filter((item) => item.category === "drink");
  const [activeTab, setActiveTab] = useState<"all" | "food" | "drink">("all");
  const visibleItems = useMemo(() => {
    if (activeTab === "food") return foodCategoryItems;
    if (activeTab === "drink") return drinkCategoryItems;
    return foodItems;
  }, [activeTab, foodCategoryItems, drinkCategoryItems, foodItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Food Item Card Component for consistent styling
  const FoodItemCard = ({ item, showPopularBadge = false, orderCount = 0 }: { item: FoodItem; showPopularBadge?: boolean; orderCount?: number }) => {
    const quantity = getItemQuantity(item.id);
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <span className="truncate">{item.name}</span>
                {showPopularBadge && (
                  <Badge variant="default" className="bg-orange-500 text-white px-2 py-0 text-xs whitespace-nowrap">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </CardTitle>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                ETB {item.price.toFixed(2)}
              </p>
            </div>
            <Badge 
              variant={item.category === "drink" ? "secondary" : "default"}
              className="flex-shrink-0"
            >
              {item.category === "drink" ? "Drink" : "Food"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {item.image && (
            <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden border">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = "none";
                }}
                loading="lazy"
              />
            </AspectRatio>
          )}
          
          {item.description && (
            <CardDescription className="text-sm sm:text-base leading-relaxed">
              {item.description}
            </CardDescription>
          )}

          {showPopularBadge && orderCount > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Ordered {orderCount} times today</span>
              <Star className="h-3 w-3 text-orange-500 fill-orange-500" />
            </div>
          )}

          {quantity === 0 ? (
            <Button 
              onClick={() => handleAddToCart(item)} 
              className="w-full h-11 font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleUpdateQuantity(item.id, quantity - 1)}
                className="h-10 w-10"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex-1 text-center font-bold text-lg text-primary">
                {quantity} in cart
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleUpdateQuantity(item.id, quantity + 1)}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Our Menu</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Choose your favorite items
              </p>
            </div>
            
            {cart.length > 0 && (
              <Button 
                size="lg" 
                onClick={() => navigate("/student/cart")} 
                className="w-full sm:w-auto shadow-lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
              </Button>
            )}
          </div>

          <div className="space-y-8 sm:space-y-12">
            {/* Main Menu Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
              <TabsList className="mb-6 sm:mb-8 w-full grid grid-cols-3 gap-2 sm:gap-4 h-auto p-1 sm:p-2 bg-muted/50 rounded-xl">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all"
                >
                  All Items
                </TabsTrigger>
                <TabsTrigger 
                  value="food" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Food</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="drink" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2"
                >
                  <Coffee className="h-4 w-4" />
                  <span>Drinks</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {activeTab === "all" ? (
                  <div className="space-y-12">
                    {/* Food Section */}
                    <section>
                      <div className="flex items-center gap-3 mb-6 sm:mb-8">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <UtensilsCrossed className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Food</h2>
                          <p className="text-sm sm:text-base text-muted-foreground">Delicious meals and dishes</p>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {foodCategoryItems.map((item) => (
                          <FoodItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>

                    {/* Drinks Section */}
                    <section>
                      <div className="flex items-center gap-3 mb-6 sm:mb-8">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Drinks</h2>
                          <p className="text-sm sm:text-base text-muted-foreground">Refreshments and beverages</p>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {drinkCategoryItems.map((item) => (
                          <FoodItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {visibleItems.map((item) => (
                      <FoodItemCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Popular Items Section */}
            {popularItems.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Popular Items</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">Based on recent orders</p>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {popularItems.map((item) => (
                    <FoodItemCard 
                      key={`popular-${item.id}`} 
                      item={item} 
                      showPopularBadge={true}
                      orderCount={item.orderCount}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Floating Cart Button */}
          {cart.length > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button 
                size="lg" 
                onClick={() => navigate("/student/cart")} 
                className="shadow-2xl h-12 sm:h-14 px-4 sm:px-6 font-semibold rounded-full"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                <span className="text-sm sm:text-base">
                  Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;