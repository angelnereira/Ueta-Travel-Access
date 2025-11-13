// Product Types
export interface LocalizedText {
  en: string;
  es: string;
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  currency: string;
  originalPrice: number;
  discount: number;
  category: string;
  subCategory: string;
  brand: string;
  image: string;
  images: string[];
  stock: number;
  terminal: string;
  featured: boolean;
  rating: number;
  reviews: number;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

// User Types
export interface FlightInfo {
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    city: string;
    terminal: string;
    date: string;
    gate: string;
  };
  arrival: {
    airport: string;
    city: string;
    terminal: string;
    date: string;
  };
  class: string;
  seat: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  total: number;
  items: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: 'en' | 'es';
  currency: string;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  loyaltyPoints: number;
  upcomingFlight: FlightInfo;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    emailUpdates: boolean;
  };
  savedPaymentMethods: PaymentMethod[];
  orderHistory: OrderHistoryItem[];
}

// Category Types
export interface SubCategory {
  id: string;
  name: LocalizedText;
}

export interface Category {
  id: string;
  name: LocalizedText;
  icon: string;
  subcategories: SubCategory[];
}

// Order Types
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'ready' | 'completed';
  createdAt: string;
  qrCode: string;
}

// Language Type
export type Language = 'en' | 'es';

// Theme Type
export type Theme = 'light' | 'dark';

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: LocalizedText;
  comment: LocalizedText;
  date: string;
  verified: boolean;
  helpful: number;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  description: LocalizedText;
  minPurchase: number;
  maxDiscount: number;
  active: boolean;
  expiryDate: string;
  usageLimit: number;
  categories: string[];
  loyaltyTierRequired?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// Terminal Types
export interface TerminalStore {
  name: string;
  location: string;
  hours: string;
  categories: string[];
}

export interface Terminal {
  id: string;
  code: string;
  name: LocalizedText;
  airport: string;
  stores: TerminalStore[];
  features: {
    en: string[];
    es: string[];
  };
  pickupTime: LocalizedText;
}

// Promotion Types
export interface Promotion {
  id: string;
  type: 'banner' | 'flash' | 'deal';
  title: LocalizedText;
  subtitle: LocalizedText;
  image?: string;
  cta?: LocalizedText;
  link?: string;
  couponCode?: string;
  active: boolean;
  priority: number;
  startDate: string;
  endDate: string;
}
