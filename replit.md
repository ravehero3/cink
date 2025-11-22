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

### November 22, 2025 - Font Standardization & Heart Icon Alignment
- **Heart Icon Design Standardization**: 
  - Updated ProductCard heart icon from 24px to 22px to match header heart size
  - Changed from filled heart design to stroke-based design (matching header's aesthetic)
  - Heart starts as white with black stroke, becomes filled black when saved
  - Scale Pop animation preserved with same easing: cubic-bezier(0.175, 0.885, 0.32, 1.275)
- **Single Product View Font Updates**:
  - Product name (h1): Changed to BB-CondBold at 14px (from "Helvetica Neue Condensed Bold" at 16px)
  - Price and body text: Uses BB-Regular at 14px
  - Accordion section headers ("INFORMACE O PRODUKTU", "Size & fit", "Doprava zdarma, vrácení zdarma", "Péče o produkt"): BB-CondBold at 14px
  - Accordion content (expanded sections): BB-Regular at 14px
  - "PŘIDAT DO KOŠÍKU" button: BB-CondBold at 14px (updated from "Helvetica Neue Condensed Bold" 22px)
- **Database & Seed**: Created PostgreSQL database with full seed data
  - Admin user: admin@ufosport.cz / admin123
  - Test user: user@ufosport.cz / user123
  - 4 product categories and 40 sample products
- **Bug Fixes**: Fixed JSX syntax errors in product detail page
  - Added 3 missing closing `</div>` tags in component structure
  - Fixed self-closing div tags (changed `<div />` to `<div></div>`)
  - Application now compiles successfully

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