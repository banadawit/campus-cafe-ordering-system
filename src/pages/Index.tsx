import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, ShoppingBag, Clock, Truck, Heart, Shield, Star } from "lucide-react";

// Color variables for consistency
const PRIMARY_COLOR = "bg-amber-700 hover:bg-amber-800";
const ACCENT_COLOR = "bg-orange-600 hover:bg-orange-700";
const TEXT_COLOR = "text-amber-800";
const BG_GRADIENT = "from-amber-50/50 via-orange-50/30 to-white dark:from-gray-900 dark:via-gray-800/20 dark:to-gray-900";

const Index = () => {
  return (
    <div className={`min-h-screen ${BG_GRADIENT} transition-colors duration-500`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 border-b border-amber-100 dark:border-amber-900/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <span className={`font-bold text-lg bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent ${TEXT_COLOR}`}>
                Campus Cafe
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Staff Login</Link>
              </Button>
              <Button size="sm" className={`text-white ${PRIMARY_COLOR}`} asChild>
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
        <div className="container mx-auto px-4 py-16 sm:py-20 md:py-28 lg:py-32 relative max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 sm:mb-6 px-4 py-1.5 text-sm border-amber-300 bg-amber-100 font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              🎓 Authentic Campus Dining Experience
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tighter">
              <span className="bg-gradient-to-r from-amber-800 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                Traditional Flavors,
              </span>
              <br className="hidden sm:inline" />
              <span className="text-foreground">Modern Convenience</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
              Experience **authentic campus cuisine** made fresh daily. Your favorite meals are just a click away, delivered across the university.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 sm:mb-16">
              <Button size="xl" className={`shadow-lg shadow-amber-300/50 w-full sm:w-64 h-14 px-8 text-base font-semibold text-white ${PRIMARY_COLOR}`} asChild>
                <Link to="/student">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Order Meal Now
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="w-full sm:w-64 h-14 px-8 text-base border-amber-400/50 text-amber-700 hover:bg-amber-50" asChild>
                <Link to="#menu">See Today's Specials</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto pt-6 border-t border-amber-100 dark:border-amber-900/30">
              <div className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold ${TEXT_COLOR}`}>300+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Daily Orders</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold ${TEXT_COLOR} flex items-center justify-center gap-1`}>
                  4.9 <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Top Rating</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold ${TEXT_COLOR}`}>Delivery</div>
                <div className="text-xs sm:text-sm text-muted-foreground">To All Dorms</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- */}

      {/* === 2. Popular Dishes / Menu Highlights === */}
      <section id="menu" className="py-16 sm:py-20 md:py-28 bg-white dark:bg-gray-950/70 shadow-inner">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Student Favorites
            </h2>
            <p className="text-lg text-muted-foreground">
              Our most popular, authentic, and comforting meals chosen by the university community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { 
                name: "Doro Wot", 
                price: "ETB 120", 
                description: "Spicy chicken stew with boiled eggs and Berbere spice.",
                popular: true,
                spice: "🌶️🌶️🌶️"
              },
              { 
                name: "Beef Tibs", 
                price: "ETB 95", 
                description: "Sautéed beef cooked with rosemary, butter, and mild herbs.",
                popular: true,
                spice: "🌶️🌶️"
              },
              { 
                name: "Shiro Wot", 
                price: "ETB 65", 
                description: "Flavorful chickpea stew, a delicious vegetarian staple.",
                popular: false,
                spice: "🌶️"
              },
              { 
                name: "Firfir", 
                price: "ETB 55", 
                description: "Injera pieces tossed in a flavorful tomato and onion sauce.",
                popular: true,
                spice: "🌶️🌶️"
              },
            ].map((item, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-amber-300 group">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`font-extrabold text-xl ${TEXT_COLOR}`}>{item.name}</h3>
                    {item.popular && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300/80 dark:bg-amber-900 dark:text-amber-300">
                        <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                        Top Pick
                      </Badge>
                    )}
                  </div>
                  <p className={`text-3xl font-bold ${ACCENT_COLOR.split(' ')[0].replace('bg', 'text')} mb-2`}>{item.price}</p>
                  <p className="text-sm text-muted-foreground mb-3 min-h-10">{item.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-amber-100 dark:border-amber-900/30">
                    <span className="text-base text-amber-600">{item.spice} Spice</span>
                    <span className="text-xs text-muted-foreground">Served with Injera</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- */}

      {/* === 3. Features Section === */}
      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Built for Campus Life
            </h2>
            <p className="text-lg text-muted-foreground">
              The fastest, most reliable way to get authentic campus dining
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="shadow-md border-amber-100 dark:border-amber-900/50 text-center">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">Authentic Taste</CardTitle>
                <CardDescription className="text-sm min-h-10">
                  Traditional recipes and spices for a true culinary experience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-md border-amber-100 dark:border-amber-900/50 text-center">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Truck className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">Fast Delivery</CardTitle>
                <CardDescription className="text-sm min-h-10">
                  Quick and efficient delivery service right to your dorm block.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-md border-amber-100 dark:border-amber-900/50 text-center">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Heart className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">Fresh & Daily</CardTitle>
                <CardDescription className="text-sm min-h-10">
                  All meals prepared fresh every day with high-quality ingredients.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-md border-amber-100 dark:border-amber-900/50 text-center">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Shield className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">Secure Ordering</CardTitle>
                <CardDescription className="text-sm min-h-10">
                  Safe payment options tailored for the university community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* --- */}

      {/* === 4. How It Works (Simplified Steps) === */}
      <section className="py-16 sm:py-20 md:py-28 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Getting Your Meal
            </h2>
            <p className="text-lg text-muted-foreground">
              Delicious campus dining in three easy steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-8 sm:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                  {[
                    { number: 1, title: "Select Meal", description: "Choose your favorite dishes and Injera from the daily menu." },
                    { number: 2, title: "Choose Delivery", description: "Specify your block/dorm number and a convenient pickup time." },
                    { number: 3, title: "Enjoy!", description: "Receive a notification and savor your hot, traditional meal." },
                  ].map((step, index) => (
                    <div key={index} className="text-center relative">
                      {/* Connector Line (Desktop Only) */}
                      {index < 2 && (
                        <div className="hidden md:block absolute top-8 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-0.5 bg-amber-200 dark:bg-amber-900/50 translate-y-1/2" />
                      )}
                      <div className={`w-16 h-16 ${PRIMARY_COLOR} text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-extrabold shadow-lg`}>
                        {step.number}
                      </div>
                      <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
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
      <section className="py-16 sm:py-20 md:py-28 bg-gradient-to-r from-amber-700 to-orange-700 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
              Taste Tradition. Skip the Line.
            </h2>
            <p className="text-lg sm:text-xl mb-10 max-w-3xl mx-auto text-amber-100">
              Join hundreds of students enjoying authentic, fresh meals on campus every day.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 sm:mb-12">
              {[
                { name: "Mekdes", text: "Tastes just like home! The Doro Wot is a lifesaver between lectures." },
                { name: "Dawit", text: "Incredibly fast delivery to my dorm block. Always hot and fresh!" },
                { name: "Sara", text: "Best campus food, hands down. The Shiro Wot is a weekly must-have." },
              ].map((testimonial, idx) => (
                <Card key={idx} className="bg-white/10 border-white/30 text-white shadow-lg">
                  <CardContent className="pt-6 space-y-3">
                    <p className="text-sm italic">"{testimonial.text}"</p>
                    <p className="font-semibold text-amber-300">— {testimonial.name}, Student</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button size="xl" className="w-full sm:w-80 h-14 px-8 text-lg font-bold bg-white text-amber-700 hover:bg-amber-100 shadow-2xl" asChild>
              <Link to="/student">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Order Your Meal Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- */}

      {/* === 6. Footer and Fixed Mobile CTA === */}
      <footer className="bg-amber-900 text-amber-200 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <UtensilsCrossed className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-lg">Campus Cafe</span>
            </div>
            <p className="text-sm mb-2">
              Authentic Campus Dining • Fresh Traditional Meals Daily
            </p>
            <p className="text-xs text-amber-400">
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