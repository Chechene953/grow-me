import { create } from 'zustand';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (plantId: string, size: string, potColorName: string) => void;
  updateQuantity: (plantId: string, size: string, potColorName: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const existingItem = get().items.find(
      i => i.plantId === item.plantId && 
           i.size === item.size && 
           i.potColor.name === item.potColor.name
    );

    if (existingItem) {
      set({
        items: get().items.map(i =>
          i.plantId === item.plantId && 
          i.size === item.size && 
          i.potColor.name === item.potColor.name
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      });
    } else {
      set({ items: [...get().items, item] });
    }
  },

  removeItem: (plantId, size, potColorName) => {
    set({
      items: get().items.filter(
        i => !(i.plantId === plantId && i.size === size && i.potColor.name === potColorName)
      ),
    });
  },

  updateQuantity: (plantId, size, potColorName, quantity) => {
    if (quantity <= 0) {
      get().removeItem(plantId, size, potColorName);
      return;
    }

    set({
      items: get().items.map(i =>
        i.plantId === plantId && 
        i.size === size && 
        i.potColor.name === potColorName
          ? { ...i, quantity }
          : i
      ),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getDeliveryFee: () => {
    const subtotal = get().getSubtotal();
    return subtotal > 50 ? 0 : 5.99;
  },

  getTotal: () => {
    return get().getSubtotal() + get().getDeliveryFee();
  },
}));








