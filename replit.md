# UFO Sport E-shop

## Overview
A minimalistic black-and-white e-commerce website for UFO Sport (ufosport.cz), designed with a high-fashion, Balenciaga-inspired aesthetic. The project focuses on clean design, enlarged typography, and generous spacing to deliver a premium user experience. It supports a comprehensive e-commerce workflow, from product browsing and selection to secure payment processing and shipping. The platform aims to provide a unique online shopping experience that aligns with a luxury, avant-garde brand image.

## User Preferences
I prefer clear, concise explanations.
I value a systematic and organized approach to development.
Please ensure all UI/UX changes strictly adhere to the defined black/white/neon green color palette and minimalistic design principles.
I prefer detailed explanations of complex architectural decisions.
Ask before making major changes to the core design system or introducing new external dependencies.

## System Architecture

### UI/UX Decisions
The design strictly adheres to a Balenciaga-inspired minimalist aesthetic, using a black-and-white color palette with neon green accents solely for primary calls to action. The design avoids grays, shadows, and gradients. Typography features enlarged "Helvetica Neue" (or similar sans-serif) with specific letter spacing for headlines. A consistent 8px-based spacing system is used throughout. The layout includes a 1600px max-width container and responsive product grids. Buttons have sharp corners with minimal hover effects. Headers are fixed, integrating search functionality and a three-column grid layout with reduced icon sizes (22px) and specific font styles for navigation. Cart and saved products use slide-in drawers with semi-transparent overlays. Product cards include color variant display on hover and clickable image navigation dots. Single product pages feature a heart icon for saving, standardized typography for titles and buttons, and carefully adjusted spacing. Accordion sections (Product Information, Size & Fit, Shipping, Care) include smooth arrow rotation and content reveal animations.

### Technical Implementations
The project is built using Next.js 14 (App Router) and TypeScript, with Tailwind CSS for styling. Zustand manages client-side state for the cart, recently viewed items, and saved products. The application features a comprehensive checkout flow, order creation, and confirmation. Search functionality includes product filtering. Promo code validation and discount calculations are integrated. Homepage video and category sections are customizable via an admin interface. UI animations, such as search bar slide-down, delayed content fade-in, and interactive elements (like sparkle animation on saving products), are implemented for a smooth user experience. Saved product functionality includes database synchronization for authenticated users and local storage persistence for unauthenticated users. Admin users are redirected to the admin dashboard upon login.

### Feature Specifications
- **Product Catalog**: Comprehensive display of products with images, size options, and stock levels.
- **Shopping Cart**: Slide-in drawer with recently viewed products and highlighted shipping/payment benefits.
- **Checkout Flow**: End-to-end process including promo code application, payment gateway integration (GoPay), and shipping point selection (Zásilkovna).
- **Order Management**: Creation and confirmation of customer orders.
- **User Accounts**: Basic user authentication.
- **Saved Products**: Functionality for users to save products to a dedicated wishlist page, with persistence across sessions for authenticated users.
- **Search**: Site-wide product search with filtering capabilities.
- **Admin Features**: Content management for homepage sections (e.g., video and category displays) and product details including a "shortDescription" field.

### System Design Choices
- **Framework**: Next.js 14 (App Router).
- **Language**: TypeScript.
- **Styling**: Tailwind CSS.
- **Database**: PostgreSQL via Prisma ORM.
- **Authentication**: NextAuth.js.
- **State Management**: Zustand for client-side global state.

## External Dependencies
- **Database**: PostgreSQL (Neon-backed)
- **Authentication**: NextAuth.js
- **Payment Gateway**: GoPay
- **Shipping Integration**: Zásilkovna (Packeta) API
- **Email Service**: Resend API
- **File Storage**: Cloudinary

## Recent Implementations

### November 22, 2025 - Three-Step Checkout Flow (Czech Implementation)
Created a new comprehensive 3-step checkout flow with full Czech language support and Balenciaga minimalist design:

**Pages Created**:
1. `/checkout/email` - Email authentication (Google OAuth or guest checkout)
2. `/checkout/doprava` - Shipping address & method selection (Zásilkovna integration)
3. `/checkout/platba` - Payment processing (GoPay integration)

**Features**:
- Google OAuth integration for seamless authentication
- Guest checkout option for non-authenticated users
- Zásilkovna delivery point selection widget
- Promo code validation and discount application
- Session storage for checkout data persistence
- GoPay payment gateway processing
- Order summary sidebars on all pages
- Fully translated to Czech (all text, labels, placeholders)
- Consistent minimalist black/white design with proper spacing

**Flow**: Cart → Email Step → Shipping Step → Payment Step → GoPay → Confirmation

**Design Adjustments**:
- Right panel (order summary) positioned at exactly 33% width mark
- Left panel (form) takes 67% width for optimal content presentation
- Consistent layout across all three checkout pages
- Follows Balenciaga minimalist design principles

### Saved Products Feature
- Fixed Zustand hydration timing issues
- Implemented database sync for authenticated users
- LocalStorage persistence for guest users
- Added `/api/products` endpoint support for fetching products by ID
- ULOŽENÉ PRODUKTY page with proper 1px borders between items

### November 22, 2025 - POKLADNA Page Styling Refinement
Enhanced the checkout summary page (POKLADNA) with minimalist border styling:

**Design Changes**:
- Replaced all full borders with strategic minimal borders (bottom only or right+bottom)
- All contact form inputs (E-mail, Jméno a příjmení, Telefon): Bottom border only (border-b)
- Promo code input field: Right and bottom borders (border-r border-b) for directional accent
- All form sections extend full height with proper vertical line dividers (left and right edges)
- Vertical lines run from header to footer edge for visual continuity

**Header Styling**:
- Changed "SOUHRN" to "SOUHRN OBJEDNÁVKY" with dedicated header section
- Header height matches main navigation (h-header = 44px)
- Added horizontal line divider (border-b) below header
- Consistent HELVETICA NEUE CONDENSED BOLD typography (14px) for all titles

**Typography Standardization**:
- All text on POKLADNA page standardized to 14px (text-body)
- Form section titles (KONTAKTNÍ ÚDAJE, DOPRAVA): HELVETICA NEUE CONDENSED BOLD, 14px
- Right panel header (SOUHRN OBJEDNÁVKY): HELVETICA NEUE CONDENSED BOLD, 14px
- Removed 12px font sizes in favor of consistent 14px throughout

**Border Styling System**:
- Left panel: border-l (vertical line only)
- Right panel: border-l (vertical line only)
- Form inputs: border-b (minimalist underline style)
- Promo code input: border-r border-b (two-edge directional style)
- Removed all focus rings for cleaner minimal appearance

**Button Styling**:
- PŘEJÍT K PLATBĚ button: py-2 (matches input field height), hover:bg-gray-900 (subtle darkening)
- Removed color inversion hover effect in favor of subtle gray darkening

### November 22, 2025 - POKLADNA Page Header & Typography Updates
Enhanced the checkout page with refined header behavior and typography adjustments:

**Header Behavior**:
- Header now displays only UFO SPORT logo on pokladna page (all navigation, icons, and controls hidden)
- Implemented using `usePathname()` in Header1.tsx with conditional rendering
- Rule: When user navigates to `/pokladna`, left navigation (categories), right side icons (login, saved, search, cart), and close search button are hidden
- Logo remains visible and centered on all pages

**Typography Refinements**:
- Contact form labels (E-mail, Jméno a příjmení, Telefon): 12px (2px smaller), 2px padding on left/right
- Promo code label: 12px (reduced from 14px)
- Order summary section (Mezisoučet, Doprava, Sleva, CELKEM): 10px
- "SOUHRN OBJEDNÁVKY" header: 9.33px (1.5x smaller than standard, centered in 44px header)

**Order Summary Panel**:
- Right panel header (44px height): Centered text at 9.33px
- Summary items text: 10px throughout
- Maintains minimalist aesthetic with consistent spacing

### Recent Design Improvements
- Fixed "VYBERTE VELIKOST" button spacing (added 32px top padding)
- Product detail "PŘIDAT DO KOŠÍKU" button now redirects to cart
- All pages maintain Balenciaga-inspired minimalist aesthetic

### November 23, 2025 - Admin Inventory Management & Bulk Operations

**Feature #2: Inventory Alerts & Low Stock Management**
- Added `lowStockThreshold` field to Product model (default: 5 units)
- Dashboard now displays "⚠️ Nízký sklad" (Low Stock) card showing count of products below threshold
- Low stock card highlights in red when products need attention
- New "Nízký sklad" filter on products page to quickly find understock items
- Products with low stock are highlighted in red on product list
- Each product shows warning emoji (⚠️) when stock is below threshold

**Feature #6: Product Bulk Operations**
- Added checkbox selection for products on admin products page
- "Select All" checkbox to select/deselect all visible products at once
- Bulk operations panel appears when products are selected, showing count
- Bulk operations available:
  - **💰 Hromadná cena** - Update price for multiple products at once
  - **📁 Hromadná kategorie** - Change category for multiple products
  - **👁️ Hromadná viditelnost** - Toggle visibility (visible/hidden) for multiple products
  - **📦 Hromadný sklad** - Update stock levels for multiple products
  - **⚠️ Hromadný práh** - Set low stock threshold for multiple products
- **Kopie (Duplicate)** button on each product row:
  - Creates exact copy of product with "(kopie)" suffix added to name
  - New slug generated with timestamp to ensure uniqueness
  - Duplicated products are hidden by default for safety
  - All product details (price, images, sizes, stock) are copied

**Database Schema Changes**:
- Added `lowStockThreshold: Int @default(5)` to Product model
- Allows per-product customization of low stock alerts

**API Endpoints Created**:
- `POST /api/admin/products/bulk` - Handles all bulk operations (price, category, visibility, stock, threshold)
- `POST /api/admin/products/duplicate` - Duplicates a product with safety measures

**Admin Dashboard Updates**:
- Stats endpoint now includes `lowStockProducts` count
- Low stock card appears in dashboard statistics grid
