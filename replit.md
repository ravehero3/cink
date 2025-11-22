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

### Recent Design Improvements
- Fixed "VYBERTE VELIKOST" button spacing (added 32px top padding)
- Product detail "PŘIDAT DO KOŠÍKU" button now redirects to cart
- All pages maintain Balenciaga-inspired minimalist aesthetic