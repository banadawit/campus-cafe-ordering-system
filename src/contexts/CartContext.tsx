import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface OrderDetails {
  orderType: "delivery" | "cafeteria";
  timeSlot: string;
  blockType: string;
  dormNumber: string;
  studentName: string;
  studentId: string;
  phone: string;
}

interface CartContextType {
  cart: CartItem[];
  orderDetails: OrderDetails | null;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  setOrderDetails: (details: OrderDetails) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem("ccos_cart");
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem("ccos_orderDetails");
      return raw ? (JSON.parse(raw) as OrderDetails) : null;
    } catch {
      return null;
    }
  });

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setOrderDetails(null);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Persist to localStorage when values change
  useEffect(() => {
    try {
      localStorage.setItem("ccos_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      if (orderDetails) {
        localStorage.setItem("ccos_orderDetails", JSON.stringify(orderDetails));
      } else {
        localStorage.removeItem("ccos_orderDetails");
      }
    } catch {}
  }, [orderDetails]);

  return (
    <CartContext.Provider
      value={{
        cart,
        orderDetails,
        addToCart,
        removeFromCart,
        updateQuantity,
        setOrderDetails,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
