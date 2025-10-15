import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UtensilsCrossed, ArrowRight } from "lucide-react";

const StudentHome = () => {
  const navigate = useNavigate();
  const { setOrderDetails } = useCart();
  const [formData, setFormData] = useState({
    orderType: "cafeteria" as "delivery" | "cafeteria",
    timeSlot: "",
    blockType: "",
    dormNumber: "",
    studentName: "",
    studentId: "",
    phone: "",
    deliveryDate: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentName || !formData.studentId || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, student ID, and phone number",
        variant: "destructive",
      });
      return;
    }

    if (formData.orderType === "delivery" && (!formData.blockType || !formData.dormNumber)) {
      toast({
        title: "Missing Delivery Info",
        description: "Please provide your block and dorm number for delivery",
        variant: "destructive",
      });
      return;
    }

    setOrderDetails(formData);
    navigate("/student/menu");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <UtensilsCrossed className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Campus Lunch Order</h1>
            <p className="text-muted-foreground">Place your order in just a few steps</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Fill in your information to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Full Name *</Label>
                  <Input
                    id="studentName"
                    placeholder="Enter your full name"
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    placeholder="Enter your student ID"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Order Type *</Label>
                  <RadioGroup
                    value={formData.orderType}
                    onValueChange={(value: "delivery" | "cafeteria") =>
                      setFormData({ ...formData, orderType: value })
                    }
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="cafeteria" id="cafeteria" />
                      <Label htmlFor="cafeteria" className="cursor-pointer flex-1">
                        Eat at Cafeteria
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="cursor-pointer flex-1">
                        Delivery to Dorm
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.orderType === "delivery" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-semibold">Delivery Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="blockType">Block Type *</Label>
                      <Select
                        value={formData.blockType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, blockType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your block" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="Amel 1A">Amel 1A</SelectItem>
                          <SelectItem value="Amel 1B">Amel 1B</SelectItem>
                          <SelectItem value="Amel 2A">Amel 2A</SelectItem>
                          <SelectItem value="Amel 2B">Amel 2B</SelectItem>
                          <SelectItem value="Wing 1">Wing 1</SelectItem>
                          <SelectItem value="Wing 2">Wing 2</SelectItem>
                          <SelectItem value="Wing 3">Wing 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dormNumber">Dorm Number *</Label>
                      <Input
                        id="dormNumber"
                        placeholder="e.g., 101, 205"
                        value={formData.dormNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, dormNumber: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Select Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Preferred Time Slot</Label>
                  <Select
                    value={formData.timeSlot}
                    onValueChange={(value) =>
                      setFormData({ ...formData, timeSlot: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="12:30">12:30 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="13:30">1:30 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Continue to Menu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
