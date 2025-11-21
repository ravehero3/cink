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