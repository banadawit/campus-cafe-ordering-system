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
import { UtensilsCrossed, ArrowRight, MapPin, Clock, User, Phone, IdCard } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              Campus Cafe Order
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Start your order by providing your details below
            </p>
          </div>

          {/* Main Form Card */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="px-4 sm:px-6 pb-4">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <User className="h-5 w-5 text-orange-600" />
                Order Information
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                We need a few details to prepare your order
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 text-orange-700">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName" className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Full Name *
                      </Label>
                      <Input
                        id="studentName"
                        placeholder="Enter your full name"
                        value={formData.studentName}
                        onChange={(e) =>
                          setFormData({ ...formData, studentName: e.target.value })
                        }
                        className="h-11 sm:h-12 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="text-sm font-medium flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-muted-foreground" />
                        Student ID *
                      </Label>
                      <Input
                        id="studentId"
                        placeholder="Enter student ID"
                        value={formData.studentId}
                        onChange={(e) =>
                          setFormData({ ...formData, studentId: e.target.value })
                        }
                        className="h-11 sm:h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="h-11 sm:h-12 text-base"
                      required
                    />
                  </div>
                </div>

                {/* Order Type Section */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2 text-orange-700">
                    <MapPin className="h-4 w-4" />
                    Order Type *
                  </Label>
                  <RadioGroup
                    value={formData.orderType}
                    onValueChange={(value: "delivery" | "cafeteria") =>
                      setFormData({ ...formData, orderType: value })
                    }
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div className={`flex items-center space-x-3 border-2 rounded-xl p-4 hover:border-orange-300 cursor-pointer transition-all ${
                      formData.orderType === "cafeteria" 
                        ? "border-orange-500 bg-orange-50" 
                        : "border-border hover:bg-muted/50"
                    }`}>
                      <RadioGroupItem value="cafeteria" id="cafeteria" className="text-orange-600" />
                      <Label htmlFor="cafeteria" className="cursor-pointer flex-1 text-sm sm:text-base font-medium">
                        Eat at Cafeteria
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 border-2 rounded-xl p-4 hover:border-orange-300 cursor-pointer transition-all ${
                      formData.orderType === "delivery" 
                        ? "border-orange-500 bg-orange-50" 
                        : "border-border hover:bg-muted/50"
                    }`}>
                      <RadioGroupItem value="delivery" id="delivery" className="text-orange-600" />
                      <Label htmlFor="delivery" className="cursor-pointer flex-1 text-sm sm:text-base font-medium">
                        Delivery to Dorm
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Delivery Information */}
                {formData.orderType === "delivery" && (
                  <div className="space-y-4 p-4 border-2 border-orange-200 rounded-xl bg-orange-50/50">
                    <h3 className="font-semibold text-base flex items-center gap-2 text-orange-700">
                      <MapPin className="h-4 w-4" />
                      Delivery Information
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="blockType" className="text-sm font-medium">Block Type *</Label>
                        <Select
                          value={formData.blockType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, blockType: value })
                          }
                        >
                          <SelectTrigger className="h-11 sm:h-12 text-base">
                            <SelectValue placeholder="Select block" />
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
                        <Label htmlFor="dormNumber" className="text-sm font-medium">Dorm Number *</Label>
                        <Input
                          id="dormNumber"
                          placeholder="e.g., 101, 205"
                          value={formData.dormNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, dormNumber: e.target.value })
                          }
                          className="h-11 sm:h-12 text-base"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Date and Time Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate" className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Delivery Date
                    </Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="h-11 sm:h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeSlot" className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Preferred Time
                    </Label>
                    <Select
                      value={formData.timeSlot}
                      onValueChange={(value) =>
                        setFormData({ ...formData, timeSlot: value })
                      }
                    >
                      <SelectTrigger className="h-11 sm:h-12 text-base">
                        <SelectValue placeholder="Select time" />
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
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-orange-600 hover:bg-orange-700 shadow-lg"
                  size="lg"
                >
                  Continue to Menu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Need help? Contact campus cafe at +251-XXX-XXXX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;