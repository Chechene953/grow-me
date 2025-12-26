import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Order, OrderStatus, CartItem } from '../types';

export const orderService = {
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...order,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Order));
    } catch (error: any) {
      if (error.code === 'failed-precondition' && error.message?.includes('index')) {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as Order));

        return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      throw error;
    }
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (orderDoc.exists()) {
      const orderData = orderDoc.data();
      return {
        id: orderDoc.id,
        ...orderData,
        createdAt: orderData.createdAt?.toDate() || new Date(),
        updatedAt: orderData.updatedAt?.toDate() || new Date(),
      } as Order;
    }
    return null;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date(),
    });
  },
};

