import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { UtensilsCrossed, Coffee } from "lucide-react";

interface FoodItem {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  available: boolean;
  category: string;
}

const MenuManagement = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from("food")
        .select("*")
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

  const toggleAvailability = async (itemId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("food")
        .update({ available: !currentStatus })
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Item ${!currentStatus ? "enabled" : "disabled"}`,
      });

      fetchFoodItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update item availability",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  const foodCategoryItems = foodItems.filter((item) => item.category === "food");
  const drinkCategoryItems = foodItems.filter((item) => item.category === "drink");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <p className="text-muted-foreground">Manage food items and availability</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Food Items</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {foodCategoryItems.map((item) => (
              <Card key={item.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-2xl font-bold text-primary mt-1">${item.price}</p>
                    </div>
                    <Badge variant={item.available ? "secondary" : "outline"}>
                      {item.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Available</span>
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => toggleAvailability(item.id, item.available)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Drinks</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drinkCategoryItems.map((item) => (
              <Card key={item.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-2xl font-bold text-primary mt-1">${item.price}</p>
                    </div>
                    <Badge variant={item.available ? "secondary" : "outline"}>
                      {item.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Available</span>
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => toggleAvailability(item.id, item.available)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
