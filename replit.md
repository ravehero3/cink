# UFO Sport E-shop

## Overview
A minimalistic black-and-white e-commerce website for UFO Sport (ufosport.cz), designed with a high-fashion, Balenciaga-inspired aesthetic. The project focuses on clean design, enlarged typography, and generous spacing to deliver a premium user experience. It supports a comprehensive e-commerce workflow, from product browsing and selection to secure payment processing and shipping. The platform aims to provide a unique online shopping experience that aligns with a luxury, avant-garde brand image.

## Recent Changes (November 26, 2025)
**Category Products Not Showing on Vercel - FIXED:**
- **Root Cause**: The `/api/products` route was using exact string matching for category filtering (`where.category = category`), but search used case-insensitive matching. This caused a mismatch on Vercel deployment.
- **Solution**: Changed category filter to use case-insensitive matching: `where.category = { equals: category, mode: 'insensitive' }`
- **Result**: Category pages (VOODOO808, SPACE LOVE, etc.) now return products correctly, matching search behavior.

**Previous Critical Bug Fixes for Vercel Deployment:**
1. **Order Confirmation Fix** - Updated order lookup API to search by `orderNumber` instead of UUID, enabling guest checkout users to view their order confirmations without authentication
2. **Checkout Email Auto-Fill** - Improved email field synchronization to populate from session data in all navigation scenarios (login, page refresh, back navigation)
3. **Safari Compatibility** - Replaced `requestIdleCallback` with `setTimeout` in cart button handler for cross-browser support (Safari/iOS compatibility)
4. **Database Connection** - Fixed production database connection from local Replit heliumdb to Neon PostgreSQL
5. **Database Seeding** - Populated production database with 40 products across 4 categories (RECREATION WELLNESS, SPACE LOVE, T SHIRT GALLERY, VOODOO808)

**Technical Details:**
- Order numbers follow format: `UFO{YY}{MM}{DD}{NNN}` (e.g., UFO251126001)
- Guest checkout orders are accessible via orderNumber as a secure token
- All APIs verified working with 200 OK responses
- Application ready for Vercel deployment

## User Preferences
I prefer clear, concise explanations.
I value a systematic and organized approach to development.
Please ensure all UI/UX changes strictly adhere to the defined black/white/neon green color palette and minimalistic design principles.
I prefer detailed explanations of complex architectural decisions.
Ask before making major changes to the core design system or introducing new external dependencies.

## System Architecture

### UI/UX Decisions
The design strictly adheres to a Balenciaga-inspired minimalist aesthetic, using a black-and-white color palette with neon green accents solely for primary calls to action. The design avoids grays, shadows, and gradients. Typography features enlarged "Helvetica Neue" (or similar sans-serif) with specific letter spacing for headlines. A consistent 8px-based spacing system is used throughout. The layout includes a 1600px max-width container and responsive product grids. Buttons have sharp corners with minimal hover effects. Headers are fixed, integrating search functionality and a three-column grid layout with reduced icon sizes (22px) and specific font styles for navigation. Cart and saved products use slide-in drawers with semi-transparent overlays. Product cards include color variant display on hover and clickable image navigation dots. Single product pages feature a heart icon for saving, standardized typography for titles and buttons, and carefully adjusted spacing. Accordion sections include smooth arrow rotation and content reveal animations. Checkout flows follow a three-step process with a 33/67% split for order summary/form, and minimalist border styling. Admin dashboards feature minimalist design with 1px black dividers and 20px padding.

### Technical Implementations
The project is built using Next.js 14 (App Router) and TypeScript, with Tailwind CSS for styling. Zustand manages client-side state for the cart, recently viewed items, and saved products. The application features a comprehensive checkout flow, order creation, and confirmation. Search functionality includes product filtering. Promo code validation and discount calculations are integrated. Homepage video and category sections are customizable via an admin interface. UI animations, such as search bar slide-down, delayed content fade-in, and interactive elements (like sparkle animation on saving products), are implemented for a smooth user experience. Saved product functionality includes database synchronization for authenticated users and local storage persistence for unauthenticated users. Admin users are redirected to the admin dashboard upon login, which includes real-time revenue and order statistics with Recharts LineChart visualization, order sorting, customer phone display, inventory alerts, low stock management, and bulk product operations (price, category, visibility, stock, threshold, duplicate).

### Feature Specifications
- **Product Catalog**: Display of products with images, size options, and stock levels.
- **Shopping Cart**: Slide-in drawer with recently viewed products and highlighted benefits.
- **Checkout Flow**: End-to-end process including promo code application, payment gateway integration, and shipping point selection.
- **Order Management**: Creation and confirmation of customer orders, with admin sorting capabilities.
- **User Accounts**: Basic user authentication and saved products functionality.
- **Saved Products**: Wishlist functionality with persistence.
- **Search**: Site-wide product search with filtering.
- **Admin Features**: Content management for homepage sections, product details, order statistics dashboard, inventory alerts, and bulk product operations.

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
- **File Storage**: Cloudinary / Vercel Blob