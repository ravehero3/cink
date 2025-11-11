# UFO Sport E-shop

## Overview
A minimalistic black-and-white e-commerce website for UFO Sport (ufosport.cz). The project aims to deliver a high-fashion, Balenciaga-inspired user experience with a focus on clean design, enlarged typography, and generous spacing. It supports a full e-commerce workflow from product browsing to secure payment and shipping.

## Recent Changes (November 11, 2025)
- **Reklamační řád Page**: Created new dedicated page at /reklamacni-rad with complete consumer rights information
- **Footer Contact Updates**:
  - Updated phone number to +420 775 181 107
  - Updated email to ufosport@mail.com
  - Updated Instagram link to https://www.instagram.com/ufosport.cz/?hl=en
  - Updated Facebook link to https://www.facebook.com/ufosports/?locale=cs_CZ

## Previous Changes (November 10, 2025)
- **Database Setup**: PostgreSQL database provisioned and schema migrated using Prisma
- **Test Users Created**: 
  - Admin: admin@ufosport.cz / admin123
  - Regular User: user@ufosport.cz / user123
- **Login Page Redesign**: Complete redesign to match Balenciaga's minimal aesthetic with:
  - Clean centered layout with minimal borders
  - "Remember me" checkbox
  - Expandable "Need help signing in?" section
  - Password reset modal dialog
  - "Create My Profile" CTA for registration
- **Footer Updates**:
  - Added 1px top border to main footer section (footer1)
  - Changed copyright text (footer2) to use Helvetica Neue Condensed Regular font
- **VideoSection Improvements**: Updated to always render overlay container for text and buttons, allowing admin to add/edit content
- **Homepage Content**: Changed section3 default header text from "VÍME ŽE JSI ALIEN" to "TRIKA"

## User Preferences
I prefer clear, concise explanations.
I value a systematic and organized approach to development.
Please ensure all UI/UX changes strictly adhere to the defined black/white/neon green color palette and minimalistic design principles.
I prefer detailed explanations of complex architectural decisions.
Ask before making major changes to the core design system or introducing new external dependencies.

## System Architecture

### UI/UX Decisions
The design is inspired by Balenciaga's minimalist aesthetic, featuring a strict black-and-white color palette with a neon green accent for primary calls to action. No grays, shadows, or gradients are used. Typography utilizes "Helvetica Neue" (or similar sans-serif) with enlarged sizes and specific letter spacing for headlines. A generous 8px-based spacing system is applied throughout. The layout includes a max-width container (1600px) and responsive product grids (3 columns desktop, 2 tablet, 1 mobile). Buttons have sharp corners and minimal hover effects. Headers are fixed with integrated search and redesigned with a three-column grid for balanced spacing, featuring reduced icon sizes (22px) and specific font styles for navigation links. Cart and saved products drawers slide in with semi-transparent overlays.

### Technical Implementations
The project is built with Next.js 14 (App Router) and TypeScript. Styling is handled by Tailwind CSS. State management for cart, recently viewed, and saved products uses Zustand. The application includes a comprehensive checkout flow, order creation, and confirmation pages. Search functionality includes product filtering. Promo code validation and discount calculation are integrated. Video sections and category sections are customizable by an admin user with text overlays and button pairs, using a Zustand store for content (currently persisted in localStorage). UI animations are carefully crafted for a smooth user experience, such as search bar slide-down and delayed content fade-in.

### Feature Specifications
- **Product Catalog**: Displays products with images, sizes, and stock.
- **Shopping Cart**: Slide-in drawer with dimmed overlay, recently viewed products, and shipping/payment benefits.
- **Checkout Flow**: Full process from cart to order creation, including promo code application, GoPay payment integration, and Zásilkovna pickup point selection.
- **Order Management**: Creation and confirmation pages.
- **User Accounts**: Basic user authentication (credentials-based).
- **Saved Products**: Functionality to save products and view them on a dedicated page.
- **Search**: Site-wide search with filtering capabilities.
- **Admin Features**: Customizable content for video and category sections on the homepage.

### System Design Choices
- **Framework**: Next.js 14 with App Router.
- **Language**: TypeScript for type safety.
- **Styling**: Tailwind CSS for utility-first styling, strictly adhering to the design system.
- **Database**: PostgreSQL with Prisma ORM for data modeling and interaction.
- **Authentication**: NextAuth.js for secure user authentication.
- **State Management**: Zustand for client-side global state.

## External Dependencies
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js
- **Payment Gateway**: GoPay (Czech payment gateway)
- **Shipping Integration**: Zásilkovna (Packeta) API for pickup point selection
- **Email Service**: Resend API (for transactional emails)
- **File Storage**: Cloudinary (for product images)