import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, ShoppingBag, Clock, Truck, Heart, Shield, Star, ChefHat } from "lucide-react";

// Color variables updated for a single, vibrant, clean Orange palette to perfectly match the menu image.
const PRIMARY_COLOR = "bg-orange-600 hover:bg-orange-700"; // Main CTA/Action (Vibrant Orange)
const ACCENT_COLOR = "text-orange-600"; // Price/Accent Text Color
const TEXT_COLOR = "text-gray-800"; // Dark text for high contrast on light background
// Background gradient uses a subtle warm tone
const BG_GRADIENT = "from-stone-50 via-orange-50/50 to-white dark:from-gray-900 dark:via-gray-800/20 dark:to-gray-900";
const RING_COLOR = "focus:ring-orange-500/80"; // Focus ring for accessibility

const Index = () => {
  // Mock image for a more polished look
  const MockImage = ({ name, className = "" }) => (
    <div 
      className={`absolute inset-0 bg-gray-200/50 dark:bg-gray-700/50 flex items-center justify-center text-sm text-gray-500 rounded-lg ${className}`}
    >
      <ChefHat className="w-5 h-5 mr-1" /> {name}
    </div>
  );

  return (
    <div className={`min-h-screen ${BG_GRADIENT} transition-colors duration-500 font-sans`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-orange-100/70 dark:border-gray-800/50 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Logo icon uses a simple solid Orange for a cleaner look */}
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              {/* Text color uses the dark text color for better contrast */}
              <span className={`font-extrabold text-xl ${TEXT_COLOR}`}>
                Campus Cafe
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Staff Login</Link>
              </Button>
              <Button size="sm" className={`text-white ${PRIMARY_COLOR} ${RING_COLOR}`} asChild>
                <Link to="/student">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Order Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* === 1. Hero Section === */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 sm:py-28 md:py-36 relative max-w-7xl">
          {/* Subtle background shape for visual interest */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl opacity-50 pointer-events-none hidden lg:block" />

          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="secondary" className="mb-4 sm:mb-6 px-4 py-1.5 text-sm border-orange-400 bg-orange-100 font-semibold text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 shadow-md">
              🎓 Authentic Ethiopian Campus Dining
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-5 sm:mb-8 leading-tight tracking-tighter">
              {/* Title gradient uses bright orange for maximum impact */}
              <span className="bg-gradient-to-r from-orange-800 via-orange-600 to-orange-700 bg-clip-text text-transparent drop-shadow-md">
                Savory Meals,
              </span>
              <br className="hidden sm:inline" />
              <span className="text-gray-900 dark:text-white">Speedy Delivery</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 sm:mb-12 max-w-4xl mx-auto font-light leading-relaxed">
              Experience **authentic, fresh campus cuisine** made daily. Your favorites are just a click away, delivered across the university.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 sm:mb-16">
              {/* Primary CTA Button - Vibrant Orange */}
              <Button size="xl" className={`shadow-xl shadow-orange-500/50 w-full sm:w-72 h-16 px-8 text-lg font-bold text-white transition-all duration-300 ${PRIMARY_COLOR} ${RING_COLOR}`} asChild>
                <Link to="/student">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Place Order Now
                </Link>
              </Button>
              {/* Ghost Button - Orange accent */}
              <Button size="xl" variant="ghost" className="w-full sm:w-72 h-16 px-8 text-lg font-semibold text-orange-700 hover:bg-orange-50" asChild>
                <Link to="#menu">View Today's Specials</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-12 max-w-2xl mx-auto pt-8 border-t border-orange-200/50 dark:border-gray-700">
              <div className="text-center">
                <div className={`text-4xl sm:text-5xl font-extrabold ${TEXT_COLOR}`}>300+</div>
                <div className="text-sm sm:text-base text-muted-foreground mt-1">Daily Orders</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl sm:text-5xl font-extrabold ${TEXT_COLOR} flex items-center justify-center gap-2`}>
                  4.9 <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
                </div>
                <div className="text-sm sm:text-base text-muted-foreground mt-1">Top Rating</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl sm:text-5xl font-extrabold ${TEXT_COLOR}`}>15 Min</div>
                <div className="text-sm sm:text-base text-muted-foreground mt-1">Avg. Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- */}

      {/* === 2. Popular Dishes / Menu Highlights === */}
      <section id="menu" className="py-20 sm:py-24 md:py-32 bg-white dark:bg-gray-950 shadow-inner border-t border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-5">
              Top Student Picks
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Our most popular, authentic, and comforting meals chosen by the university community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { 
                name: "Doro Wot", 
                price: "ETB 120", 
                description: "Spicy chicken stew with boiled eggs and Berbere spice. A classic favorite.",
                popular: true,
                spice: "🌶️🌶️🌶️"
              },
              { 
                name: "Beef Tibs", 
                price: "ETB 95", 
                description: "Tender sautéed beef cooked with rosemary, clarified butter, and mild herbs.",
                popular: true,
                spice: "🌶️🌶️"
              },
              { 
                name: "Shiro Wot", 
                price: "ETB 65", 
                description: "A thick, flavorful chickpea flour stew. A delicious and hearty vegetarian staple.",
                popular: false,
                spice: "🌶️"
              },
              { 
                name: "Firfir", 
                price: "ETB 55", 
                description: "Shredded Injera pieces tossed in a flavorful tomato and onion sauce. Great for breakfast or any time.",
                popular: true,
                spice: "🌶️🌶️"
              },
            ].map((item, index) => (
              <Card 
                key={index} 
                className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-400 group overflow-hidden"
              >
                <div className="relative aspect-[4/3]">
                   {/* Faux Image/Placeholder for better design */}
                   <MockImage name={item.name} />
                   <div className="absolute top-0 right-0 m-3">
                      {item.popular && (
                        <Badge className="bg-orange-600/90 text-white shadow-md hover:bg-orange-600">
                          <Star className="w-3 h-3 mr-1 fill-white text-white" />
                          Top Pick
                        </Badge>
                      )}
                   </div>
                </div>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-extrabold text-xl tracking-tight ${TEXT_COLOR}`}>{item.name}</h3>
                    <p className={`text-xl font-bold ${ACCENT_COLOR}`}>{item.price}</p>
                  </div>
                  <p className="text-sm text-muted-foreground min-h-10">{item.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <span className={`text-sm font-semibold ${ACCENT_COLOR} flex items-center gap-1`}>
                       <ChefHat className="w-4 h-4" /> {item.spice} Spice
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-orange-500 hover:bg-orange-50">
                        Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- */}

      {/* === 3. Features Section === */}
      <section className="py-20 sm:py-24 md:py-32">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-5">
              Why Choose Campus Cafe?
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Built specifically for students, offering the fastest, most reliable way to enjoy authentic campus dining.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Card 1: Authentic Taste - Orange Icon */}
            <Card className="shadow-lg border-orange-200/50 dark:border-gray-700 text-center hover:scale-[1.02] transition-transform">
              <CardHeader className="pb-4 pt-6">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-200/50">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Authentic Taste</CardTitle>
                <CardDescription className="text-sm min-h-10">
                  Traditional recipes and spices for a true, comforting culinary experience.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 2: Fast Delivery - Green Icon (Kept for contrast) */}
            <Card className="shadow-lg border-orange-200/50 dark:border-gray-700 text-center hover:scale-[1.02] transition-transform">
              <CardHeader className="pb-4 pt-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-200/50">
                  <Truck className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Fast Delivery</CardTitle>
                <CardDescription className="text-sm min-h-10">
                  Quick, efficient, and reliable service right to your dorm block or lecture hall.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 3: Fresh & Daily - Red Icon (Kept for contrast) */}
            <Card className="shadow-lg border-orange-200/50 dark:border-gray-700 text-center hover:scale-[1.02] transition-transform">
              <CardHeader className="pb-4 pt-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-200/50">
                  <Heart className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Fresh & Daily</CardTitle>
                <CardDescription className="text-sm min-h-10">
                  All meals prepared fresh every morning with the highest quality, local ingredients.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 4: Secure Ordering - Blue Icon (Kept for contrast) */}
            <Card className="shadow-lg border-orange-200/50 dark:border-gray-700 text-center hover:scale-[1.02] transition-transform">
              <CardHeader className="pb-4 pt-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200/50">
                  <Shield className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Secure Ordering</CardTitle>
                <CardDescription className="text-sm min-h-10">
                  Safe and secure payment options tailored for the university community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* --- */}

      {/* === 4. How It Works (Simplified Steps) - High Contrast Section === */}
      <section className="py-20 sm:py-24 md:py-32 bg-gray-50/70 dark:bg-gray-900/70">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-5">
              Meal Delivery in 3 Easy Steps
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              From hungry to happy in no time at all.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="shadow-2xl shadow-orange-200/50 border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-10 sm:p-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-16">
                  {[
                    { number: 1, title: "Select Your Meal", description: "Browse the daily menu and choose your favorite authentic dishes." },
                    { number: 2, title: "Confirm Location", description: "Specify your exact block/dorm number and checkout securely." },
                    { number: 3, title: "Enjoy!", description: "Receive a notification when your meal arrives hot and ready to eat." },
                  ].map((step, index) => (
                    <div key={index} className="text-center relative">
                      {/* Connector Line (Desktop Only) - Thicker, more prominent */}
                      {index < 2 && (
                        <div className="hidden md:block absolute top-10 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-1 bg-gray-200 dark:bg-gray-700 translate-y-1/2" />
                      )}
                      <div className={`w-16 h-16 ${PRIMARY_COLOR} text-white rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-extrabold shadow-xl z-10 relative`}>
                        {step.number}
                      </div>
                      <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-base font-light">{step.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- */}

      {/* === 5. Final CTA & Testimonials === */}
      <section className="py-20 sm:py-24 md:py-32 bg-orange-600 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-5">
              Taste Tradition. Skip the Line.
            </h2>
            <p className="text-xl sm:text-2xl mb-12 max-w-3xl mx-auto text-orange-200 font-light">
              Join hundreds of students enjoying authentic, fresh meals on campus every day.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 sm:mb-16">
              {[
                { name: "Mekdes", text: "Tastes just like home! The Doro Wot is a lifesaver between lectures. Incredibly fast." },
                { name: "Dawit", text: "Always hot and fresh! Incredibly fast delivery right to my dorm block. Zero complaints." },
                { name: "Sara", text: "The variety is fantastic. Best campus food, hands down. The Shiro Wot is a weekly must-have." },
              ].map((testimonial, idx) => (
                <Card key={idx} className="bg-white/10 border-white/30 text-white shadow-xl backdrop-blur-sm transition-all hover:bg-white/20">
                  <CardContent className="pt-6 space-y-3">
                    <Star className="w-4 h-4 fill-orange-300 text-orange-300" />
                    <p className="text-sm italic leading-relaxed">"{testimonial.text}"</p>
                    <p className="font-semibold text-orange-300">— {testimonial.name}, Student</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button size="xl" className={`w-full sm:w-96 h-16 px-8 text-xl font-bold bg-white text-orange-700 hover:bg-orange-100 shadow-2xl shadow-white/50 transition-all duration-300 ${RING_COLOR}`} asChild>
              <Link to="/student">
                <ShoppingBag className="mr-3 h-6 w-6" />
                Order Your Meal Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- */}

      {/* === 6. Footer and Fixed Mobile CTA === */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
             <div className="space-y-3">
               <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                 <UtensilsCrossed className="w-6 h-6 text-orange-400" />
                 <span className="font-bold text-lg text-white">Campus Cafe</span>
               </div>
               <p className="text-sm">
                 Authentic Campus Dining. Fresh Traditional Meals Daily.
               </p>
             </div>
             <div className="space-y-2">
                <h4 className="font-semibold text-white">Quick Links</h4>
                <ul className="space-y-1 text-sm">
                  <li><Link to="/student" className="hover:text-orange-400 transition-colors">Order Menu</Link></li>
                  <li><Link to="#menu" className="hover:text-orange-400 transition-colors">Today's Specials</Link></li>
                  <li><Link to="/faq" className="hover:text-orange-400 transition-colors">FAQ</Link></li>
                </ul>
             </div>
             <div className="space-y-2">
                <h4 className="font-semibold text-white">Account</h4>
                <ul className="space-y-1 text-sm">
                  <li><Link to="/auth" className="hover:text-orange-400 transition-colors">Staff Login</Link></li>
                  <li><Link to="/student/profile" className="hover:text-orange-400 transition-colors">My Orders</Link></li>
                </ul>
             </div>
             <div className="space-y-2">
                <h4 className="font-semibold text-white">Contact</h4>
                <p className="text-sm">support@campuscafecity.edu</p>
                <p className="text-sm">Office Hours: M-F, 9AM - 5PM</p>
             </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Campus Cafe — Built for students, powered by flavor.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Fixed Mobile CTA (Hidden on screens >= sm) */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 sm:hidden shadow-[0_-5px_15px_rgba(0,0,0,0.1)] z-50">
        <Button size="lg" className={`w-full h-12 font-semibold text-white ${PRIMARY_COLOR}`} asChild>
          <Link to="/student">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Order Now
          </Link>
        </Button>
      </div>

    </div>
  );
};

export default Index;