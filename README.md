# Ndangira Frontend 🎨

> **Modern Hyperlocal Marketplace UI** - Beautiful, fast, and intuitive shopping experience for Kigali neighborhoods

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra_UI-2.10-319795.svg)](https://chakra-ui.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)

## 🎯 Design Innovation Highlights

### 1. **Premium Visual Design**
- **Warm, Inviting Color Palette**: Sand and orange gradients evoke local market warmth
- **Modern Glassmorphism**: Frosted glass effects with backdrop blur for depth
- **Smooth Animations**: Framer Motion for delightful micro-interactions
- **Responsive Typography**: Scales beautifully from mobile to desktop

### 2. **AI-First Interface**
- **Conversational Shopping Assistant**: Chat-based product discovery
- **Natural Language Search**: "Find me fresh vegetables nearby" just works
- **Smart Suggestions**: AI-powered follow-up questions
- **Context-Aware Responses**: Remembers your location and preferences

### 3. **Location-Centric UX**
- **Proximity Badges**: Visual distance indicators on every listing
- **Neighborhood Clustering**: Group results by district
- **Real-Time Location**: Browser geolocation for accurate "near me" results
- **Map Integration Ready**: Prepared for visual location display

### 4. **Trust & Urgency Signals**
- **Verification Badges**: Visual trust indicators for merchants
- **Inventory Status**: Color-coded stock levels (green/yellow/orange)
- **Freshness Notes**: Time-sensitive product information
- **Featured Listings**: Highlighted quality merchants

### 5. **Conversion Optimization**
- **One-Click WhatsApp**: Direct merchant contact with pre-filled messages
- **Quick Actions**: Call, message, or get directions instantly
- **Visual Hierarchy**: Important information stands out
- **Mobile-First Design**: Optimized for on-the-go shopping

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Landing    │  │   Search     │  │  AI Chat     │ │
│  │   Page       │  │   Results    │  │  Interface   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │         │
│         └──────────────────┼──────────────────┘         │
│                            │                            │
│                    ┌───────▼────────┐                   │
│                    │  Chakra UI     │                   │
│                    │  Components    │                   │
│                    └───────┬────────┘                   │
│                            │                            │
│                    ┌───────▼────────┐                   │
│                    │  API Client    │                   │
│                    └───────┬────────┘                   │
└────────────────────────────┼──────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Backend API     │
                    │  (Express)       │
                    └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Backend API running (see backend/README.md)

### Installation

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your backend API URL

# Start development server
npm run dev
```

Application runs at `http://localhost:5173`

## 📦 Environment Variables

```env
# Backend API URL
VITE_API_URL="http://localhost:4000"

# For production
# VITE_API_URL="https://your-backend.vercel.app"
```

## 🎨 Design System

### Color Palette

```typescript
const colors = {
  brand: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Primary orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  sand: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  ink: {
    700: '#374151',
    900: '#171717',
  }
}
```

### Typography

- **Headings**: System font stack with fallbacks
- **Body**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- **Weights**: 400 (regular), 700 (bold), 800 (extra bold)
- **Scales**: Responsive sizing from mobile to desktop

### Component Patterns

#### Listing Card
```tsx
<ListingCard 
  listing={listing}
  showDistance={true}
  onWhatsAppClick={handleWhatsApp}
/>
```

**Features:**
- Merchant info with verification badge
- Distance indicator
- Inventory status badge
- Price in RWF
- Freshness notes
- WhatsApp quick action

#### AI Concierge
```tsx
<AiConcierge 
  initialMessage="How can I help you find what you need?"
  userLocation={{ lat: -1.9441, lng: 30.0619 }}
/>
```

**Features:**
- Chat interface with message history
- Typing indicators
- Suggested follow-up questions
- Embedded product cards
- Location-aware responses

#### Section Heading
```tsx
<SectionHeading
  eyebrow="Discovery Engine"
  title="Neighborhood-first search"
  description="Find what you need near you, not across the city."
/>
```

**Features:**
- Consistent section styling
- Eyebrow text for context
- Large, bold titles
- Descriptive subtitles

## 📱 Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  base: '0px',    // Mobile
  sm: '480px',    // Small mobile
  md: '768px',    // Tablet
  lg: '992px',    // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Extra large
}
```

### Mobile Optimizations
- Touch-friendly button sizes (min 44px)
- Simplified navigation on small screens
- Stacked layouts for narrow viewports
- Optimized image loading
- Reduced motion for accessibility

## 🧩 Component Library

### Core Components

#### `ListingCard.tsx`
Displays product listing with merchant info, distance, and actions.

**Props:**
```typescript
interface ListingCardProps {
  listing: Listing;
  showDistance?: boolean;
  onWhatsAppClick?: (listing: Listing) => void;
}
```

**Features:**
- Responsive layout
- Verification badges
- Inventory status indicators
- Distance display
- WhatsApp integration
- Freshness notes

#### `AiConcierge.tsx`
Conversational AI shopping assistant.

**Props:**
```typescript
interface AiConciergeProps {
  initialMessage?: string;
  userLocation?: { lat: number; lng: number };
  onProductClick?: (productId: string) => void;
}
```

**Features:**
- Chat message history
- Typing indicators
- Suggested questions
- Product card embeds
- Location context
- Conversation persistence

#### `SectionHeading.tsx`
Consistent section headers across the app.

**Props:**
```typescript
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
}
```

**Features:**
- Flexible alignment
- Optional eyebrow text
- Responsive typography
- Consistent spacing

### Layout Components

#### Hero Section
- Gradient background
- Call-to-action buttons
- Feature statistics
- Responsive grid

#### Search Interface
- Text input with autocomplete
- Category dropdown
- Location-aware results
- Sort and filter options

#### Featured Listings Sidebar
- Highlighted products
- Quick access to popular items
- Compact card layout

## 🔌 API Integration

### API Client (`lib/api.ts`)

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchListings(params: URLSearchParams): Promise<ListingsResponse> {
  const response = await fetch(`${API_URL}/api/listings?${params}`);
  if (!response.ok) throw new Error('Failed to fetch listings');
  return response.json();
}

export async function sendAiMessage(message: string, location: Location): Promise<AiResponse> {
  const response = await fetch(`${API_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, latitude: location.lat, longitude: location.lng })
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}
```

### Type Definitions (`types/index.ts`)

```typescript
export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  priceRwf: number;
  unitLabel: string;
  inventoryStatus: InventoryStatus;
  isFeatured: boolean;
  freshnessNote?: string;
  imageUrl?: string;
  tags: string[];
  merchant: Merchant;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  neighborhood: string;
  district: string;
  latitude: number;
  longitude: number;
  verified: boolean;
}

export type ListingCategory = 
  | 'GROCERIES' 
  | 'RESTAURANTS' 
  | 'FASHION' 
  | 'ELECTRONICS' 
  | 'HOME' 
  | 'HEALTH' 
  | 'SERVICES';

export type InventoryStatus = 
  | 'IN_STOCK' 
  | 'LOW_STOCK' 
  | 'MADE_TO_ORDER';
```

## 🎭 User Flows

### 1. Product Discovery Flow
```
Landing Page
  ↓
Enter search query + select category
  ↓
View proximity-sorted results
  ↓
Click listing for details
  ↓
Contact merchant via WhatsApp
```

### 2. AI Assistant Flow
```
Open AI Concierge
  ↓
Type natural language query
  ↓
Receive AI recommendations
  ↓
Click suggested product
  ↓
View full listing details
```

### 3. Location-Based Search Flow
```
Grant location permission
  ↓
Automatic proximity calculation
  ↓
Results sorted by distance
  ↓
View on map (future feature)
  ↓
Get directions to merchant
```

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Create Vercel Project**
   ```bash
   cd frontend
   vercel
   ```

2. **Configure Environment Variables**
   - Add `VITE_API_URL` in Vercel dashboard
   - Point to your deployed backend URL

3. **Set Build Configuration**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Deployment Options

#### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

#### GitHub Pages
```bash
npm run build
# Configure base path in vite.config.ts
# Deploy dist folder to gh-pages branch
```

## 🎨 Customization

### Theme Customization

Edit `src/theme/index.ts`:

```typescript
export const theme = extendTheme({
  colors: {
    brand: {
      // Your custom brand colors
    }
  },
  fonts: {
    heading: 'Your Custom Font',
    body: 'Your Custom Font',
  },
  components: {
    Button: {
      // Custom button styles
    }
  }
});
```

### Adding New Components

1. Create component in `src/components/`
2. Export from component file
3. Import in parent component
4. Follow Chakra UI patterns for consistency

## 🧪 Development Tips

### Hot Module Replacement
Vite provides instant HMR - changes appear immediately without full reload.

### TypeScript Strict Mode
All components are fully typed. Use TypeScript's IntelliSense for better DX.

### Chakra UI DevTools
Install Chakra UI DevTools browser extension for design debugging.

### Mock Data
Use `lib/mockData.ts` for development without backend:

```typescript
import { mockListings } from './lib/mockData';

// Use in development
const items = process.env.NODE_ENV === 'development' 
  ? mockListings 
  : await fetchListings(params);
```

## 📊 Performance Optimizations

### Code Splitting
```typescript
// Lazy load heavy components
const MapView = lazy(() => import('./components/MapView'));

<Suspense fallback={<Spinner />}>
  <MapView />
</Suspense>
```

### Image Optimization
```typescript
// Use responsive images
<Image 
  src={listing.imageUrl} 
  loading="lazy"
  srcSet={`${listing.imageUrl}?w=400 400w, ${listing.imageUrl}?w=800 800w`}
/>
```

### Bundle Size
- Tree-shaking enabled by default
- Chakra UI components imported individually
- No unused dependencies

### Lighthouse Scores (Target)
- Performance: 95+
- Accessibility: 100
- Best Practices: 95+
- SEO: 90+

## 🔐 Security Best Practices

- Environment variables for sensitive config
- HTTPS in production
- Content Security Policy headers
- XSS protection via React's built-in escaping
- No sensitive data in client-side code

## 🛠️ Tech Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **React 18.3** | UI Library | Modern, performant, huge ecosystem |
| **TypeScript 5.8** | Language | Type safety, better DX |
| **Chakra UI 2.10** | Component Library | Accessible, themeable, fast |
| **Vite 5.4** | Build Tool | Lightning-fast HMR, optimized builds |
| **Framer Motion** | Animations | Smooth, declarative animations |
| **React Icons** | Icon Library | Comprehensive icon set |

## 🏆 Competitive Advantages

### 1. **Visual Excellence**
- Premium design that stands out
- Warm, inviting color palette
- Modern glassmorphism effects
- Smooth animations and transitions

### 2. **User Experience**
- Intuitive navigation
- Fast, responsive interface
- Clear visual hierarchy
- Mobile-first approach

### 3. **AI Integration**
- Natural language shopping
- Conversational interface
- Smart recommendations
- Context awareness

### 4. **Local Market Fit**
- WhatsApp integration
- Rwanda Franc display
- Kigali neighborhoods
- Mobile-optimized

### 5. **Performance**
- Sub-second page loads
- Instant search results
- Optimized images
- Efficient code splitting

## 📈 Future Enhancements

- [ ] User authentication and profiles
- [ ] Merchant dashboard
- [ ] Interactive map view with Mapbox
- [ ] Advanced filters (price range, distance radius)
- [ ] Saved searches and favorites
- [ ] Push notifications
- [ ] Offline mode with service workers
- [ ] Multi-language support (Kinyarwanda, French)
- [ ] Dark mode
- [ ] Progressive Web App (PWA)

## 🎯 Hackathon Judging Criteria Alignment

### Innovation ✨
- AI-powered conversational commerce
- Hyperlocal proximity-first discovery
- Trust signals and urgency indicators

### Technical Excellence 💻
- Modern tech stack (React 18, TypeScript, Vite)
- Type-safe codebase
- Performance optimizations
- Clean architecture

### User Experience 🎨
- Beautiful, intuitive interface
- Mobile-first responsive design
- Accessibility compliance
- Smooth animations

### Market Fit 🎯
- Solves real problem for Kigali residents
- WhatsApp integration for local behavior
- Supports small businesses
- Scalable to other African cities

### Completeness 🚀
- Fully functional demo
- Comprehensive documentation
- Production-ready deployment
- Clear roadmap for future

## 🤝 Contributing

Built for a hackathon to showcase innovative solutions for African hyperlocal commerce. Feedback and suggestions welcome!

## 📄 License

MIT License - use freely for your own projects!

## 🙏 Acknowledgments

- Designed for Kigali's vibrant local business ecosystem
- Inspired by the need for better neighborhood commerce tools
- Built with modern web technologies and best practices

---

**Built with ❤️ for Kigali, Rwanda** 🇷🇼

*Beautiful interfaces for beautiful neighborhoods.*
