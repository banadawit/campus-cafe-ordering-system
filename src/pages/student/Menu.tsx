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

const Menu = () => {
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, orderDetails } = useCart();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderDetails) {
      navigate("/student");
      return;
    }
    fetchFoodItems();
  }, [orderDetails, navigate]);

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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
              <p className="text-muted-foreground">Choose your favorite items</p>
            </div>
            {cart.length > 0 && (
              <Button size="lg" onClick={() => navigate("/student/cart")}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                View Cart ({cart.length})
              </Button>
            )}
          </div>

          <div className="space-y-8">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="mb-6 w-full flex flex-wrap gap-2">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
                <TabsTrigger value="food" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" /> Food
                </TabsTrigger>
                <TabsTrigger value="drink" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <Coffee className="h-4 w-4" /> Drinks
                </TabsTrigger>
              </TabsList>

              {/* Active tab heading with icons, preserving original visuals */}
              <div className="flex items-center gap-2 mb-2">
                {activeTab === "food" && (
                  <>
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-semibold">Food</h2>
                  </>
                )}
                {activeTab === "drink" && (
                  <>
                    <Coffee className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-semibold">Drinks</h2>
                  </>
                )}
                {/* For 'all', section headings will be rendered inside content */}
              </div>

              <TabsContent value={activeTab}>
                {activeTab === "all" ? (
                  <div className="space-y-10">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <UtensilsCrossed className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-semibold">Food</h2>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                      <div className="flex items-center gap-2 mb-4">
                        <Coffee className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-semibold">Drinks</h2>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          </div>

          {cart.length > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button size="lg" onClick={() => navigate("/student/cart")} className="shadow-lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                View Cart ({cart.length})
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
