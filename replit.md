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
The design strictly adheres to a Balenciaga-inspired minimalist aesthetic, using a black-and-white color palette with neon green accents solely for primary calls to action. The design avoids grays, shadows, and gradients. Typography features enlarged "Helvetica Neue" (or similar sans-serif) with specific letter spacing for headlines. A consistent 8px-based spacing system is used throughout. The layout includes a 1600px max-width container and responsive product grids. Buttons have sharp corners with minimal hover effects. Headers are fixed, integrating search functionality and a three-column grid layout with reduced icon sizes (22px) and specific font styles for navigation. Cart and saved products use slide-in drawers with semi-transparent overlays.

### Technical Implementations
The project is built using Next.js 14 (App Router) and TypeScript. Tailwind CSS manages all styling. State management for the cart, recently viewed items, and saved products is handled by Zustand. The application features a comprehensive checkout flow, order creation, and confirmation. Search functionality includes product filtering. Promo code validation and discount calculations are integrated. Homepage video and category sections are customizable via an admin interface, utilizing a Zustand store for content persistence. UI animations, such as search bar slide-down and delayed content fade-in, are carefully implemented for a smooth user experience.

### Feature Specifications
- **Product Catalog**: Comprehensive display of products with images, size options, and stock levels.
- **Shopping Cart**: Slide-in drawer with recently viewed products and highlighted shipping/payment benefits.
- **Checkout Flow**: End-to-end process including promo code application, payment gateway integration (GoPay), and shipping point selection (Zásilkovna).
- **Order Management**: Creation and confirmation of customer orders.
- **User Accounts**: Basic user authentication.
- **Saved Products**: Functionality for users to save products to a dedicated wishlist page.
- **Search**: Site-wide product search with filtering capabilities.
- **Admin Features**: Content management for homepage sections (e.g., video and category displays).

### System Design Choices
- **Framework**: Next.js 14 (App Router).
- **Language**: TypeScript.
- **Styling**: Tailwind CSS.
- **Database**: PostgreSQL via Prisma ORM.
- **Authentication**: NextAuth.js.
- **State Management**: Zustand for client-side global state.

## Recent Changes

### November 22, 2025 - Fixed Saved Products Synchronization Bug (Complete Fix)
- **Phase 1 - Initial Issue**: When authenticated users saved products by clicking the heart icon, the count in the header showed only "1" instead of the actual number, and the saved products page was empty
- **Root Cause**: 
  - Heart click handlers only updated Zustand store (browser localStorage) without syncing to database
  - Saved products page had conditional logic that only fetched from database if Zustand store had items
  - For authenticated users, the page relied on localStorage being restored, which could fail
- **Complete Solution**:
  - **Heart click handlers** (both category and product detail pages):
    - Now sync with `/api/saved-products` endpoint for authenticated users
    - Update Zustand store immediately for UI feedback
    - Call POST to add or DELETE to remove from database
    - Work seamlessly for both authenticated and unauthenticated users
  
  - **Saved Products Page** (`app/ulozeno/page.tsx`):
    - **For authenticated users**: ALWAYS fetches from database (ignores Zustand/localStorage)
    - **For unauthenticated users**: Uses Zustand store from browser localStorage
    - Fixed dependency array to prevent React warnings
    - Properly handles session loading states
  
  - **Remove Product Handler**: Also syncs with database when user removes products from saved list
  
- **Result**:
  - Header count shows correct number of saved products ✓
  - Saved products page displays all saved products ✓
  - Authenticated users' data persists across sessions ✓
  - Unauthenticated users can save locally and view in same session ✓
  - All changes sync in real-time ✓

### November 22, 2025 - Comprehensive Single Product Page Redesign & Accordion Animations
- **Heart Icon on Product Images**: 
  - Added heart icon to top-right corner of first product image on single product view page
  - Icon is 22px (matching header heart size) with stroke-based design (white with black stroke initially)
  - Fully clickable to save/unsave products with Scale Pop animation (same effect as product grid heart)
  - Turns black when saved, white when unsaved
  - Uses cubic-bezier(0.175, 0.885, 0.32, 1.275) easing for smooth animation
  
- **Product Title Font Standardization**:
  - Changed from BB-CondBold to "Helvetica Neue Condensed Bold" at 14px
  - Maintains uppercase styling with proper letter-spacing (0.03em) and font-stretch: condensed
  
- **Button Font Updates**:
  - "VYBERTE VELIKOST" button: Now uses Helvetica Neue Condensed Bold at 22px (matches VOODOO808 header text exactly)
  - "PŘIDAT DO KOŠÍKU" button: Now uses Helvetica Neue Condensed Bold at 22px (matches VOODOO808 header text exactly)
  - Both buttons maintain uppercase styling, proper letter-spacing, and font-stretch properties
  
- **Spacing Adjustments**:
  - Line height between product title and price reduced to 4px (was larger before)
  - Ensures compact, elegant visual grouping
  
- **Product Short Description Field**:
  - Added new "shortDescription" field to database schema (String, optional)
  - Displays below price at 14px using BB-Regular font
  - Example text: "Top triko v černé barvě. Kus oblečení co poznají všichni fanoušci VOODOO808"
  - **Admin Features**: Fully editable by logged-in admin users
  - Can be set when creating new products or editing existing products
  - Seamlessly integrated into product detail page UI
  
- **Accordion Animations** (Product Information, Size & Fit, Shipping, Care sections):
  - **Arrow Rotation**: ChevronDown icon rotates 180 degrees smoothly on accordion open/close
    - Duration: 0.3 seconds
    - Easing: cubic-bezier(0.4, 0, 0.2, 1)
    - Uses CSS transform: rotate(180deg)
  - **Content Reveal**: Accordion content smoothly slides down/up on toggle
    - Duration: 0.4 seconds
    - Easing: cubic-bezier(0.4, 0, 0.2, 1)
    - Uses CSS max-height transition with overflow: hidden
    - Smooth in both directions with no jerky movements
  
- **Database Schema Updates**:
  - Added `shortDescription String? @db.Text` field to Product model
  - Successfully migrated PostgreSQL database with `npm run db:push`
  - Field is optional to maintain backwards compatibility
  
- **API Endpoint Updates**:
  - Updated PATCH `/api/admin/products/[id]` endpoint to handle shortDescription field
  - Admin can now update shortDescription via product edit form
  
- **UI Components Updated**:
  - Product interface includes optional shortDescription property
  - Admin edit form includes dedicated textarea for "Krátký popis (zobrazen pod cenou)"
  - Separate fields for short description and detailed description for clarity

### November 21, 2025 - Production Deployment Configuration
- **Deployment Setup**: Updated deployment scripts for production launch
- **Environment Variables**: Configured all production environment variables (.env.local)
  - NEXTAUTH_SECRET: qTWz3Gp3zJCZGkB7kLaLdbR8tApisv2a1uXBkoRwSf8=
  - NEXTAUTH_URL: https://ufosport.cz
  - Cloudinary credentials configured (dq0qvtbst)
- **Deployment Scripts**:
  - deploy-to-vercel.sh: Automated production deployment with all environment variables
  - add-domain-to-vercel.sh: Custom domain configuration for ufosport.cz
- **Documentation Created**:
  - PRODUCTION_DEPLOYMENT.md: Comprehensive deployment guide with DNS configuration
  - LAUNCH_SUMMARY.md: Quick-start production launch guide
- **Test Deployment**: Live at https://alienshop-7cfqq31v1-voodoo808s-projects.vercel.app/
- **Domain**: Ready to configure ufosport.cz with DNS records for Wedos

### November 21, 2025 - UI/UX Enhancements
- **Product Grid Improvements**:
  - Standardized heart icon to 22x22px across all product displays (matching header size)
  - Added magic sparkle animation when saving products to wishlist
  - Implemented color variant display on hover (16x16px squares, 2px border-radius, 1px black stroke)
  - Made image navigation dots clickable to switch between product images on hover
- **Sort Panel Overlay**: Updated to show 50% opacity black backdrop instead of solid white background
- **Single Product Page Refinements**:
  - Widened buttons from 30vw to 36vw with 4px border-radius
  - Updated all fonts to match header typography (22px Helvetica Neue Condensed Bold for buttons, BB-Regular for body text)
  - Reduced spacing between buttons to -4px for tighter visual grouping
  - Changed "Product details" to Czech text "INFORMACE O PRODUKTU"
  - Repositioned info sections to 64px below price (removed excessive vertical spacing)
  - Added 64px bottom padding after last accordion section

### November 20, 2025 - Database and Design
- **Database Setup**: PostgreSQL database provisioned and schema pushed
- **Data Seeding**: Created admin user (admin@ufosport.cz / admin123), 4 product categories, and 40 sample products
- **Environment Configuration**: Added Cloudinary credentials and NextAuth secret
- **Design Refinements**:
  - Updated spacing in ControlBar: Product counter 12px from left edge, SEŘADIT PODLE 12px from dropdown arrow, arrow 12px from FILTROVAT button
  - Updated SearchBar: Magnifying glass 12px from left edge, search placeholder 12px from icon, matched font styling with header
  - Updated ProductCard: Reduced line height spacing by 2px, added 1px black stroke hover effect on size options, made heart icon always visible
  - Heart click functionality already implemented to save products to wishlist

## External Dependencies
- **Database**: PostgreSQL (Neon-backed)
- **Authentication**: NextAuth.js
- **Payment Gateway**: GoPay
- **Shipping Integration**: Zásilkovna (Packeta) API
- **Email Service**: Resend API
- **File Storage**: Cloudinary