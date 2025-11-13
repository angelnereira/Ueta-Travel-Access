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
