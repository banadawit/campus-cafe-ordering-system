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
import { UtensilsCrossed, ArrowRight, MapPin, Clock, User, Phone, IdCard, Building2 } from "lucide-react";

// Theme constants for consistency
const PRIMARY_COLOR = "bg-orange-600 hover:bg-orange-700";
const ACCENT_TEXT_COLOR = "text-orange-700";
const RING_COLOR = "focus:ring-orange-500/80";

const StudentHome = () => {
  const navigate = useNavigate();
  // Assuming useCart and setOrderDetails are correctly implemented
  const { setOrderDetails } = {} as any // useCart(); 
  
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

    // setOrderDetails(formData); // Uncomment in real app
    navigate("/student/menu");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-orange-50/50 to-white dark:from-gray-900 dark:via-gray-800/20 dark:to-gray-900 p-4 sm:p-6">
      <div className="container mx-auto max-w-3xl">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10 sm:mb-12 pt-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-600 rounded-full flex items-center justify-center shadow-xl shadow-orange-300/50">
                <UtensilsCrossed className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              Start Your Campus Order
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto font-light">
              We need a few details to process and deliver your delicious meal.
            </p>
          </div>

          {/* Main Form Card */}
          <Card className="shadow-2xl border-2 border-orange-100/50 bg-white/95 backdrop-blur-sm">
            <CardHeader className="p-6 sm:p-8 pb-4 border-b">
              <CardTitle className={`text-xl sm:text-2xl font-bold ${ACCENT_TEXT_COLOR} flex items-center gap-2`}>
                <User className="h-5 w-5" />
                Customer & Order Details
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Ensure all required fields are filled to proceed to the menu.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Personal Information Section */}
                <div className="space-y-5 border-b pb-6 border-dashed">
                  <h3 className="font-extrabold text-lg sm:text-xl flex items-center gap-2 text-gray-800">
                    <User className="h-5 w-5 text-orange-600" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="studentName" className="text-sm font-medium">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="studentName"
                          placeholder="Enter your full name"
                          value={formData.studentName}
                          onChange={(e) =>
                            setFormData({ ...formData, studentName: e.target.value })
                          }
                          className={`h-12 sm:h-12 text-base pl-10 ${RING_COLOR}`}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="text-sm font-medium">Student ID *</Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="studentId"
                          placeholder="e.g., UGR/1234/10"
                          value={formData.studentId}
                          onChange={(e) =>
                            setFormData({ ...formData, studentId: e.target.value })
                          }
                          className={`h-12 sm:h-12 text-base pl-10 ${RING_COLOR}`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g., +251 9XX XXX XXXX"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className={`h-12 sm:h-12 text-base pl-10 ${RING_COLOR}`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Order Type Section */}
                <div className="space-y-5">
                  <h3 className="font-extrabold text-lg sm:text-xl flex items-center gap-2 text-gray-800">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    Pickup or Delivery
                  </h3>
                  <RadioGroup
                    value={formData.orderType}
                    onValueChange={(value: "delivery" | "cafeteria") =>
                      setFormData({ ...formData, orderType: value })
                    }
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div className={`flex items-center space-x-3 border rounded-xl p-4 transition-all shadow-sm ${
                      formData.orderType === "cafeteria" 
                        ? "border-orange-500 bg-orange-50/70 shadow-md" 
                        : "border-gray-200 hover:border-orange-300 bg-white"
                    }`}>
                      <RadioGroupItem value="cafeteria" id="cafeteria" className="text-orange-600 focus-visible:ring-offset-0 focus-visible:ring-orange-500" />
                      <Label htmlFor="cafeteria" className="cursor-pointer flex-1 text-base font-semibold">
                        Eat at Cafeteria
                        <p className="text-xs text-muted-foreground font-normal mt-0.5">Quickest option.</p>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 border rounded-xl p-4 transition-all shadow-sm ${
                      formData.orderType === "delivery" 
                        ? "border-orange-500 bg-orange-50/70 shadow-md" 
                        : "border-gray-200 hover:border-orange-300 bg-white"
                    }`}>
                      <RadioGroupItem value="delivery" id="delivery" className="text-orange-600 focus-visible:ring-offset-0 focus-visible:ring-orange-500" />
                      <Label htmlFor="delivery" className="cursor-pointer flex-1 text-base font-semibold">
                        Delivery to Dorm
                        <p className="text-xs text-muted-foreground font-normal mt-0.5">Delivered to your block.</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 3. Delivery Information (Conditional) */}
                {formData.orderType === "delivery" && (
                  <div className="space-y-5 p-5 border-2 border-orange-300 rounded-xl bg-orange-50/50 shadow-inner">
                    <h3 className="font-extrabold text-lg sm:text-xl flex items-center gap-2 text-orange-700">
                      <Building2 className="h-5 w-5" />
                      Delivery Location
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="blockType" className="text-sm font-medium">Block Type *</Label>
                        <Select
                          value={formData.blockType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, blockType: value })
                          }
                        >
                          <SelectTrigger className={`h-12 sm:h-12 text-base ${RING_COLOR}`}>
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
                          className={`h-12 sm:h-12 text-base ${RING_COLOR}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Date and Time Section */}
                <div className="space-y-5 pt-2 border-t border-dashed">
                  <h3 className="font-extrabold text-lg sm:text-xl flex items-center gap-2 text-gray-800">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Time Slot
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate" className="text-sm font-medium">
                        Order Date
                      </Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        className={`h-12 sm:h-12 text-base ${RING_COLOR}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeSlot" className="text-sm font-medium">
                        Preferred Time *
                      </Label>
                      <Select
                        value={formData.timeSlot}
                        onValueChange={(value) =>
                          setFormData({ ...formData, timeSlot: value })
                        }
                      >
                        <SelectTrigger className={`h-12 sm:h-12 text-base ${RING_COLOR}`}>
                          <SelectValue placeholder="Select a time slot" />
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
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className={`w-full h-14 sm:h-16 text-lg sm:text-xl font-bold text-white ${PRIMARY_COLOR} shadow-xl shadow-orange-500/50 transition-all duration-300 ${RING_COLOR}`}
                  size="lg"
                >
                  Continue to Menu
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Need assistance with your order?
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Contact campus cafe support: <span className="text-orange-600 font-semibold">+251-XXX-XXXX</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;