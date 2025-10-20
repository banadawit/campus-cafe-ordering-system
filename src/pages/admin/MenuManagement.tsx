import { useEffect, useState } from "react";
import React, { useMemo } from 'react';

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { UtensilsCrossed, Coffee, Plus, Pencil, Trash2, Search, Filter, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "food" as "food" | "drink",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "food" | "drink">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleOpenDialog = (item?: FoodItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price.toString(),
        description: item.description || "",
        image: item.image || "",
        category: item.category as "food" | "drink",
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        price: "",
        description: "",
        image: "",
        category: "food",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Name and price are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const itemData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description || null,
        image: formData.image || null,
        category: formData.category,
        available: editingItem ? editingItem.available : true,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("food")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        const { error } = await supabase.from("food").insert(itemData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Item added successfully",
        });
      }

      setIsDialogOpen(false);
      fetchFoodItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save item",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItemId) return;

    try {
      const { error } = await supabase
        .from("food")
        .delete()
        .eq("id", deletingItemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setDeletingItemId(null);
      fetchFoodItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return foodItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAvailability = availabilityFilter === "all" || 
                                (availabilityFilter === "available" && item.available) ||
                                (availabilityFilter === "unavailable" && !item.available);
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      
      return matchesSearch && matchesAvailability && matchesCategory;
    });
  }, [foodItems, searchQuery, availabilityFilter, categoryFilter]);

  const foodCategoryItems = filteredItems.filter((item) => item.category === "food");
  const drinkCategoryItems = filteredItems.filter((item) => item.category === "drink");

  // Mobile item card component
  const MobileItemCard = ({ item }: { item: FoodItem }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-base truncate">{item.name}</CardTitle>
            <p className="text-xl font-bold text-primary">ETB {item.price}</p>
            <Badge 
              variant={item.available ? "secondary" : "outline"}
              className={item.available ? "bg-green-100 text-green-800" : ""}
            >
              {item.available ? "Available" : "Unavailable"}
            </Badge>
          </div>
          <div className="flex-shrink-0 ml-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              {item.category === "food" ? (
                <UtensilsCrossed className="h-4 w-4 text-primary" />
              ) : (
                <Coffee className="h-4 w-4 text-primary" />
              )}
            </div>
          </div>
        </div>

        {item.image && (
          <div className="aspect-video rounded-lg overflow-hidden border">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = "none";
              }}
              loading="lazy"
            />
          </div>
        )}

        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">Available</span>
          <Switch
            checked={item.available}
            onCheckedChange={() => toggleAvailability(item.id, item.available)}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleOpenDialog(item)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive"
            onClick={() => {
              setDeletingItemId(item.id);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage food items and availability • {foodItems.length} items
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">Menu Items</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing</span>
              <Badge variant="secondary">{filteredItems.length}</Badge>
              <span>of {foodItems.length} items</span>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by name or description..."
                className="pl-10 h-10"
              />
            </div>
            <Select 
              value={availabilityFilter} 
              onValueChange={(v) => setAvailabilityFilter(v as typeof availabilityFilter)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="available">Available only</SelectItem>
                <SelectItem value="unavailable">Unavailable only</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={categoryFilter} 
              onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="food">Food only</SelectItem>
                <SelectItem value="drink">Drinks only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu items..."
                className="pl-10 h-10"
              />
            </div>
            
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(availabilityFilter !== "all" || categoryFilter !== "all") && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh]">
                <SheetHeader className="text-left">
                  <SheetTitle>Filter Menu Items</SheetTitle>
                  <SheetDescription>
                    Apply filters to find specific items
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Availability</Label>
                    <Select 
                      value={availabilityFilter} 
                      onValueChange={(v) => setAvailabilityFilter(v as typeof availabilityFilter)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="available">Available only</SelectItem>
                        <SelectItem value="unavailable">Unavailable only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select 
                      value={categoryFilter} 
                      onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        <SelectItem value="food">Food only</SelectItem>
                        <SelectItem value="drink">Drinks only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
      </Card>

      {/* Menu Items */}
      <div className="space-y-8">
        {/* Food Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold">Food Items</h2>
              <p className="text-sm text-muted-foreground">
                {foodCategoryItems.length} item{foodCategoryItems.length !== 1 ? 's' : ''} • 
                {foodCategoryItems.filter(item => item.available).length} available
              </p>
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4">
            {foodCategoryItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <div className="text-lg font-medium">No food items found</div>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              foodCategoryItems.map((item) => (
                <MobileItemCard key={item.id} item={item} />
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {foodCategoryItems.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <div className="text-xl font-medium">No food items found</div>
                <p className="mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              foodCategoryItems.map((item) => (
                <Card key={item.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                        <p className="text-2xl font-bold text-primary">ETB {item.price}</p>
                      </div>
                      <Badge variant={item.available ? "secondary" : "outline"}>
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {item.image && (
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
                    )}
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Available</span>
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => toggleAvailability(item.id, item.available)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeletingItemId(item.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Drinks Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-lg">
              <Coffee className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold">Drinks</h2>
              <p className="text-sm text-muted-foreground">
                {drinkCategoryItems.length} item{drinkCategoryItems.length !== 1 ? 's' : ''} • 
                {drinkCategoryItems.filter(item => item.available).length} available
              </p>
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4">
            {drinkCategoryItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coffee className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <div className="text-lg font-medium">No drinks found</div>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              drinkCategoryItems.map((item) => (
                <MobileItemCard key={item.id} item={item} />
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {drinkCategoryItems.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Coffee className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <div className="text-xl font-medium">No drinks found</div>
                <p className="mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              drinkCategoryItems.map((item) => (
                <Card key={item.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                        <p className="text-2xl font-bold text-primary">ETB {item.price}</p>
                      </div>
                      <Badge variant={item.available ? "secondary" : "outline"}>
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {item.image && (
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
                    )}
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Available</span>
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => toggleAvailability(item.id, item.available)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeletingItemId(item.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingItem ? "Edit Menu Item" : "Add New Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the details of this menu item." : "Add a new item to your menu."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tibs firfir"
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-sm font-medium">Price (ETB) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as "food" | "drink" })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="drink">Drink</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this item (optional)"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image" className="text-sm font-medium">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Optional. Provide a direct link to an image.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveItem} 
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Update" : "Add"} Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu item and remove it from your menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingItemId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuManagement;