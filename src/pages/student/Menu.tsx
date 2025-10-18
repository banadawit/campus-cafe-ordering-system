import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { UtensilsCrossed, Coffee, ShoppingCart, Plus, Minus } from "lucide-react";
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
  const POPULAR_MIN_COUNT = 2; // require at least 2 orders to be considered popular

  useEffect(() => {
    if (!orderDetails) {
      navigate("/student");
      return;
    }
    fetchFoodItems();
    fetchPopularItems();
  }, [orderDetails, navigate]);

  // Periodically refresh popular items in case new orders were placed
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
      // Step 1: Fetch recent order_items (no join dependency)
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

      // Step 2: take top 10 ids then fetch their food details
      const topIds = Array.from(countMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      const { data: foods, error: foodErr } = await supabase
        .from("food")
        .select("id, name, image, price, available, category")
        .in("id", topIds);

      if (foodErr) throw foodErr;

      const foodById = new Map<number, FoodItem>();
      (foods || []).forEach((f: any) => {
        foodById.set(Number(f.id), {
          id: Number(f.id),
          name: String(f.name ?? `Item ${f.id}`),
          price: Number(f.price ?? 0),
          description: null,
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
      // Silently ignore popular fetch errors to avoid blocking menu
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

  // Hooks must run before any early returns to keep order consistent
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Our Menu</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Choose your favorite items</p>
            </div>
            {cart.length > 0 && (
              <Button size="lg" onClick={() => navigate("/student/cart")} className="w-full sm:w-auto">
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                View Cart ({cart.length})
              </Button>
            )}
          </div>

          <div className="space-y-8">
            {/* Popular Items at bottom, as requested */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="mb-4 sm:mb-6 w-full flex flex-wrap gap-1 sm:gap-2 h-auto">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2 sm:px-3 py-2">
                  All
                </TabsTrigger>
                <TabsTrigger value="food" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                  <UtensilsCrossed className="h-3 w-3 sm:h-4 sm:w-4" /> 
                  <span className="hidden sm:inline">Food</span>
                  <span className="sm:hidden">Food</span>
                </TabsTrigger>
                <TabsTrigger value="drink" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                  <Coffee className="h-3 w-3 sm:h-4 sm:w-4" /> 
                  <span className="hidden sm:inline">Drinks</span>
                  <span className="sm:hidden">Drinks</span>
                </TabsTrigger>
              </TabsList>

              {/* Active tab heading with icons, preserving original visuals */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                {activeTab === "food" && (
                  <>
                    <UtensilsCrossed className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <h2 className="text-xl sm:text-2xl font-semibold">Food</h2>
                  </>
                )}
                {activeTab === "drink" && (
                  <>
                    <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <h2 className="text-xl sm:text-2xl font-semibold">Drinks</h2>
                  </>
                )}
                {/* For 'all', section headings will be rendered inside content */}
              </div>

              <TabsContent value={activeTab}>
                {activeTab === "all" ? (
                  <div className="space-y-10">
                    <div>
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <UtensilsCrossed className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        <h2 className="text-xl sm:text-2xl font-semibold">Food</h2>
                      </div>
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {foodCategoryItems.map((item) => {
                          const quantity = getItemQuantity(item.id);
                          return (
                            <Card key={item.id}>
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                    <p className="text-2xl font-bold text-primary mt-1">
                                      ETB {item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <Badge>Food</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {item.image ? (
                                  <AspectRatio ratio={16 / 9}>
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-full w-full object-cover rounded-md border"
                                      onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.style.display = "none";
                                      }}
                                      loading="lazy"
                                    />
                                  </AspectRatio>
                                ) : null}
                                {item.description && (
                                  <CardDescription>{item.description}</CardDescription>
                                )}
                                {quantity === 0 ? (
                                  <Button onClick={() => handleAddToCart(item)} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add to Cart
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleUpdateQuantity(item.id, quantity - 1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="flex-1 text-center font-semibold">{quantity}</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleUpdateQuantity(item.id, quantity + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        <h2 className="text-xl sm:text-2xl font-semibold">Drinks</h2>
                      </div>
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {drinkCategoryItems.map((item) => {
                          const quantity = getItemQuantity(item.id);
                          return (
                            <Card key={item.id}>
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                    <p className="text-2xl font-bold text-primary mt-1">
                                      ETB {item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <Badge variant="secondary">Drink</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {item.image ? (
                                  <AspectRatio ratio={16 / 9}>
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-full w-full object-cover rounded-md border"
                                      onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.style.display = "none";
                                      }}
                                      loading="lazy"
                                    />
                                  </AspectRatio>
                                ) : null}
                                {item.description && (
                                  <CardDescription>{item.description}</CardDescription>
                                )}
                                {quantity === 0 ? (
                                  <Button onClick={() => handleAddToCart(item)} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add to Cart
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleUpdateQuantity(item.id, quantity - 1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="flex-1 text-center font-semibold">{quantity}</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleUpdateQuantity(item.id, quantity + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {visibleItems.map((item) => {
                      const quantity = getItemQuantity(item.id);
                      return (
                        <Card key={item.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                <p className="text-2xl font-bold text-primary mt-1">ETB {item.price.toFixed(2)}</p>
                              </div>
                              <Badge variant={item.category === "drink" ? "secondary" : "default"}>
                                {item.category === "drink" ? "Drink" : "Food"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {item.image ? (
                              <AspectRatio ratio={16 / 9}>
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover rounded-md border"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = "none";
                                  }}
                                  loading="lazy"
                                />
                              </AspectRatio>
                            ) : null}
                            {item.description && <CardDescription>{item.description}</CardDescription>}
                            {quantity === 0 ? (
                              <Button onClick={() => handleAddToCart(item)} className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Add to Cart
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item.id, quantity - 1)}>
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="flex-1 text-center font-semibold">{quantity}</span>
                                <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item.id, quantity + 1)}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Removed duplicate Tabs block that caused double-rendering */}

            {/* Popular Items at bottom, as requested */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl font-semibold">Popular Items</span>
                <span className="text-xs sm:text-sm text-muted-foreground">Based on recent orders</span>
              </div>
              {popularItems.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Popular items will appear after a few orders.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {popularItems.map((item) => {
                    const quantity = getItemQuantity(item.id);
                    return (
                      <Card key={`popular-${item.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {item.name}
                                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white">🔥 Popular</span>
                              </CardTitle>
                              <p className="text-2xl font-bold text-primary mt-1">ETB {item.price.toFixed(2)}</p>
                            </div>
                            <Badge variant={item.category === "drink" ? "secondary" : "default"}>
                              {item.category === "drink" ? "Drink" : "Food"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {item.image ? (
                            <AspectRatio ratio={16 / 9}>
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover rounded-md border"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                                loading="lazy"
                              />
                            </AspectRatio>
                          ) : null}
                          {quantity === 0 ? (
                            <Button onClick={() => handleAddToCart(item)} className="w-full">
                              <Plus className="mr-2 h-4 w-4" />
                              Add to Cart
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item.id, quantity - 1)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="flex-1 text-center font-semibold">{quantity}</span>
                              <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item.id, quantity + 1)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
              <Button size="lg" onClick={() => navigate("/student/cart")} className="shadow-lg h-12 sm:h-14 px-4 sm:px-6">
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">View Cart ({cart.length})</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
