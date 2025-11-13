/**
 * Internationalization (i18n) System
 * Supports English and Spanish
 */

import type { Language, LocalizedText } from '@/types';

// Translation dictionary
export const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.cart': 'Cart',
    'nav.account': 'Account',
    'nav.scan': 'Scan',

    // Common
    'common.search': 'Search products...',
    'common.currency': 'USD',
    'common.add_to_cart': 'Add to Cart',
    'common.reserve_now': 'Reserve Now',
    'common.buy_now': 'Buy Now',
    'common.view_details': 'View Details',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close',

    // Home Page
    'home.welcome': 'Welcome back',
    'home.your_flight': 'Your Flight',
    'home.featured': 'Featured Products',
    'home.categories': 'Shop by Category',
    'home.deals': 'Today\'s Deals',

    // Product
    'product.in_stock': 'In Stock',
    'product.out_of_stock': 'Out of Stock',
    'product.low_stock': 'Only {count} left',
    'product.discount': '{percent}% OFF',
    'product.reviews': '{count} reviews',
    'product.rating': 'Rating',
    'product.brand': 'Brand',
    'product.category': 'Category',
    'product.terminal': 'Terminal',

    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.items': '{count} items',
    'cart.subtotal': 'Subtotal',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.continue_shopping': 'Continue Shopping',
    'cart.remove': 'Remove',
    'cart.quantity': 'Quantity',

    // Account
    'account.title': 'My Account',
    'account.profile': 'Profile',
    'account.loyalty': 'Loyalty Program',
    'account.loyalty_points': 'Loyalty Points',
    'account.loyalty_tier': 'Tier',
    'account.qr_code': 'My QR Code',
    'account.orders': 'Order History',
    'account.settings': 'Settings',
    'account.logout': 'Logout',

    // QR Code
    'qr.title': 'Your Loyalty QR Code',
    'qr.description': 'Show this QR code at checkout to earn points or redeem offers',
    'qr.transaction': 'Transaction QR',

    // Tooltips
    'tooltip.theme': 'Toggle dark/light theme',
    'tooltip.language': 'Switch language (EN/ES)',
    'tooltip.cart': 'View shopping cart',
    'tooltip.favorites': 'View favorites',
    'tooltip.scan': 'Use your camera to scan a product in-store for information and reviews',
    'tooltip.filter': 'Filter products by category, price, or terminal',
    'tooltip.pickup': 'Pay in app (coming soon) or in-store and pick up your order in the express lane',
    'tooltip.qr': 'Show this QR at checkout to accumulate points or redeem offers',

    // Settings
    'settings.theme': 'Theme',
    'settings.theme_light': 'Light',
    'settings.theme_dark': 'Dark',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.email_updates': 'Email Updates',

    // Scanner
    'scanner.title': 'Product Scanner',
    'scanner.placeholder': 'Scanner function in development',
    'scanner.description': 'Soon you\'ll be able to scan products in-store',

    // Flight Info
    'flight.departure': 'Departure',
    'flight.arrival': 'Arrival',
    'flight.terminal': 'Terminal',
    'flight.gate': 'Gate',
    'flight.seat': 'Seat',
    'flight.class': 'Class',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.shop': 'Tienda',
    'nav.cart': 'Carrito',
    'nav.account': 'Cuenta',
    'nav.scan': 'Escanear',

    // Common
    'common.search': 'Buscar productos...',
    'common.currency': 'USD',
    'common.add_to_cart': 'Añadir al Carrito',
    'common.reserve_now': 'Reservar Ahora',
    'common.buy_now': 'Comprar Ahora',
    'common.view_details': 'Ver Detalles',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.close': 'Cerrar',

    // Home Page
    'home.welcome': 'Bienvenido de nuevo',
    'home.your_flight': 'Tu Vuelo',
    'home.featured': 'Productos Destacados',
    'home.categories': 'Comprar por Categoría',
    'home.deals': 'Ofertas del Día',

    // Product
    'product.in_stock': 'En Stock',
    'product.out_of_stock': 'Agotado',
    'product.low_stock': 'Solo quedan {count}',
    'product.discount': '{percent}% DESCUENTO',
    'product.reviews': '{count} reseñas',
    'product.rating': 'Calificación',
    'product.brand': 'Marca',
    'product.category': 'Categoría',
    'product.terminal': 'Terminal',

    // Cart
    'cart.title': 'Carrito de Compras',
    'cart.empty': 'Tu carrito está vacío',
    'cart.items': '{count} artículos',
    'cart.subtotal': 'Subtotal',
    'cart.total': 'Total',
    'cart.checkout': 'Proceder al Pago',
    'cart.continue_shopping': 'Continuar Comprando',
    'cart.remove': 'Eliminar',
    'cart.quantity': 'Cantidad',

    // Account
    'account.title': 'Mi Cuenta',
    'account.profile': 'Perfil',
    'account.loyalty': 'Programa de Lealtad',
    'account.loyalty_points': 'Puntos de Lealtad',
    'account.loyalty_tier': 'Nivel',
    'account.qr_code': 'Mi Código QR',
    'account.orders': 'Historial de Pedidos',
    'account.settings': 'Configuración',
    'account.logout': 'Cerrar Sesión',

    // QR Code
    'qr.title': 'Tu Código QR de Lealtad',
    'qr.description': 'Muestra este código QR en caja para acumular puntos o canjear ofertas',
    'qr.transaction': 'QR de Transacción',

    // Tooltips
    'tooltip.theme': 'Cambiar tema claro/oscuro',
    'tooltip.language': 'Cambiar idioma (EN/ES)',
    'tooltip.cart': 'Ver carrito de compras',
    'tooltip.favorites': 'Ver favoritos',
    'tooltip.scan': 'Usa tu cámara para escanear un producto en tienda y ver información y reseñas',
    'tooltip.filter': 'Filtrar productos por categoría, precio o terminal',
    'tooltip.pickup': 'Paga en la app (próximamente) o en tienda y recoge tu pedido en la fila rápida',
    'tooltip.qr': 'Muestra este QR en caja para acumular puntos o canjear ofertas',

    // Settings
    'settings.theme': 'Tema',
    'settings.theme_light': 'Claro',
    'settings.theme_dark': 'Oscuro',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificaciones',
    'settings.email_updates': 'Actualizaciones por Email',

    // Scanner
    'scanner.title': 'Escáner de Productos',
    'scanner.placeholder': 'Función de escáner en desarrollo',
    'scanner.description': 'Pronto podrás escanear productos en tienda',

    // Flight Info
    'flight.departure': 'Salida',
    'flight.arrival': 'Llegada',
    'flight.terminal': 'Terminal',
    'flight.gate': 'Puerta',
    'flight.seat': 'Asiento',
    'flight.class': 'Clase',
  },
};

export type TranslationKey = keyof typeof translations.en;

/**
 * Get translation for a key
 */
export function t(key: TranslationKey, language: Language = 'en'): string {
  return translations[language][key] || translations.en[key] || key;
}

/**
 * Get translation with replacements
 */
export function tr(
  key: TranslationKey,
  replacements: Record<string, string | number>,
  language: Language = 'en'
): string {
  let text = t(key, language);

  Object.entries(replacements).forEach(([key, value]) => {
    text = text.replace(`{${key}}`, String(value));
  });

  return text;
}

/**
 * Get localized text from a LocalizedText object
 */
export function getLocalizedText(
  text: LocalizedText,
  language: Language = 'en'
): string {
  return text[language] || text.en;
}
