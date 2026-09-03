import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ReorderDraft {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  landmark: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  deliveryPreference: "delivery" | "pickup" | "";
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  startReorder: (nextItems: CartItem[], draft: ReorderDraft) => void;
  clearReorderDraft: () => void;
  reorderDraft: ReorderDraft | null;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [reorderDraft, setReorderDraft] = useState<ReorderDraft | null>(null);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i,
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
    toast.success("Item added to cart");
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 0) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    setItems([]);
    setReorderDraft(null);
  };

  const startReorder = (nextItems: CartItem[], draft: ReorderDraft) => {
    setItems(nextItems);
    setReorderDraft(draft);
    setIsCartOpen(true);
  };

  const clearReorderDraft = () => setReorderDraft(null);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const getBulkPrice = (price: number, quantity: number) => {
    if (quantity >= 5001) return price * 0.88;
    if (quantity >= 3001) return price * 0.9;
    if (quantity >= 501) return price * 0.95;
    return price;
  };

  const cartTotal = items.reduce(
    (sum, item) =>
      sum + getBulkPrice(item.price, item.quantity) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        startReorder,
        clearReorderDraft,
        reorderDraft,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
