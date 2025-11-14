# Ueta Travel Access - PWA

A premium Progressive Web App for seamless duty-free shopping experiences.

## 🚀 Features

- **Click & Reserve**: Effortless shopping with reservation system
- **QR Code Integration**: Loyalty and transaction QR codes
- **Multi-language**: English and Spanish support
- **Dark Mode**: Automatic theme switching
- **Responsive**: Optimized for mobile, tablet, and desktop
- **PWA Ready**: Installable with offline support

## 🏗️ Architecture

### Phase 1: Mock Data (Current)
- Pure frontend implementation with JSON mock data
- Client-side state management with Zustand
- No database dependencies

### Phase 2: Oracle Cloud Integration (Future)
- Replace mock data with Oracle Cloud APIs
- Connect to Oracle Database via OCI Functions
- Implement Oracle IDCS/IAM authentication

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **QR Codes**: qrcode.react
- **Deployment**: OCI (Oracle Cloud Infrastructure)

## 📦 Project Structure

```
Ueta-Travel-Access/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home/Dashboard
│   ├── shop/              # Product catalog
│   ├── product/           # Product details
│   ├── cart/              # Shopping cart
│   └── account/           # User account & QR
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── layout/           # Layout components
├── lib/                   # Utilities & logic
│   ├── stores/           # Zustand stores
│   ├── api.ts            # API abstraction
│   └── i18n.ts           # Internationalization
├── data/                  # Mock data (Phase 1)
│   ├── products.json
│   ├── user.json
│   └── categories.json
├── types/                 # TypeScript types
└── public/               # Static assets

## 🚦 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## 🎨 Design System

### Colors
- **Primary**: Ueta Red (#E60023)
- **Background Light**: #FAFAFA
- **Background Dark**: #1a1a1a
- **Card Light**: #FFFFFF
- **Card Dark**: #2a2a2a

### Typography
- **Font**: Inter (Geist-inspired)
- **Weights**: 300-800

## 🌐 i18n Support

The app supports:
- 🇺🇸 English (EN)
- 🇪🇸 Spanish (ES)

Toggle language using the header button.

## 🔄 State Management

### Stores
- `cart-store`: Shopping cart state
- `favorites-store`: Favorite products
- `order-store`: Order history & QR codes
- `theme-store`: Light/dark theme
- `language-store`: Language preference

All stores persist to localStorage.

## 📱 PWA Features

- Installable on mobile devices
- Offline-ready with service worker
- App shortcuts for quick access
- Native app-like experience

## 🔮 Future Enhancements (Phase 2)

1. **Oracle Cloud Integration**
   - OCI Functions for serverless backend
   - Oracle Autonomous Database
   - Oracle IDCS authentication

2. **Payment Integration**
   - Credit card processing
   - Digital wallet support

3. **Real-time Updates**
   - WebSocket for live inventory
   - Push notifications

4. **Advanced Features**
   - Product scanner (camera API)
   - Augmented reality preview
   - Personalized recommendations

## 📄 License

Proprietary - Ueta Travel

## 🤝 Contributing

This is a proprietary project. For contributions, please contact the development team.

---

Built with ❤️ for travelers worldwide
