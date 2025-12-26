export interface User {
  id: string;
  name: string;
  email: string;
  address?: Address;
  avatar?: string;
  favorites: string[];
  createdAt: Date;
  subscription?: Subscription;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Plant {
  id: string;
  name: string;
  category: PlantCategory;
  description: string;
  basePrice: number;
  images: string[];
  sizes: PlantSize[];
  colors: PotColor[];
  lightPreference: LightPreference;
  careLevel: CareLevel;
  airPurifying: boolean;
  featured: boolean;
  // Optional AR model files
  modelGlbUrl?: string; // Android Scene Viewer
  modelUsdzUrl?: string; // iOS Quick Look
  // Optional real-world dimensions for scale hints
  approximateHeightCm?: number;
}

export type PlantCategory = 
  | 'Low Light'
  | 'Air Purifying'
  | 'Easy Care'
  | 'Succulents'
  | 'Flowering'
  | 'Large Plants'
  | 'Small Plants';

export type PlantSize = 'Small' | 'Medium' | 'Large';

export interface PotColor {
  name: string;
  material: 'Ceramic' | 'Plastic' | 'Terracotta' | 'Metal';
  hexCode: string;
  priceModifier: number;
  images?: string[]; // Images spécifiques pour cette couleur (optionnel)
}

export type LightPreference = 'Low' | 'Medium' | 'Bright' | 'Direct';

export type CareLevel = 'Easy' | 'Medium' | 'Hard';

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export interface CartItem {
  plantId: string;
  plant: Plant;
  size: PlantSize;
  potColor: PotColor;
  accessories: Accessory[];
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  address: Address;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface CareTip {
  plantId: string;
  title: string;
  description: string;
  category: 'Watering' | 'Light' | 'Fertilizer' | 'Pruning' | 'Repotting';
}

export interface DeviceReading {
  humidityPercent: number; // 0-100
  lightLux: number; // lux
  temperatureCelsius: number; // °C
  soilMoisturePercent: number; // 0-100
  timestamp: number;
}

export type InstallationChoice = 'self' | 'assisted';

export interface MonitoringDevice {
  id: string;
  plantId: string;
  name: string;
  connected: boolean;
  installation: InstallationChoice;
}

export type SubscriptionPlanId = 'assisted-monitoring';
export type SupportLevel = '24/7-expert';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  pricePerMonth: number;
  supportLevel: SupportLevel;
  includesInsurance: boolean;
  description: string;
}

export interface Subscription {
  planId: SubscriptionPlanId;
  active: boolean;
  startedAt: number;
  renewsAt?: number;
  supportLevel: SupportLevel;
  includesInsurance: boolean;
  pricePerMonth: number;
}



