# UFO Sport E-shop

## Overview
A minimalistic black-and-white e-commerce website for UFO Sport (ufosport.cz). The project aims to deliver a high-fashion, Balenciaga-inspired user experience with a focus on clean design, enlarged typography, and generous spacing. It supports a full e-commerce workflow from product browsing to secure payment and shipping.

## Recent Changes (November 17, 2025)
- **Cloudinary Media Library Implementation**:
  - Added complete media management system for images and videos
  - Created Media database model with Cloudinary integration
  - Built admin media library page (/admin/media) with upload, browse, and delete functionality
  - Implemented MediaSelector component for easy media selection throughout the app
  - Integrated media selector into EditSectionModal for homepage content management
  - Added security: admin-only API access, file type validation (JPEG, PNG, WebP, GIF, MP4, WebM, MOV), 100MB size limit
  - Created comprehensive documentation in MEDIA_LIBRARY_GUIDE.md

## Previous Changes (November 13, 2025)
- **Input Field Border Radius Update**:
  - Updated all input fields and buttons from 2px to 4px border radius across the entire app
  - Applied to login, order tracking, returns, and saved products pages
  - Ensures consistent, slightly more rounded corners throughout the user interface
- **Saved Products Navigation Change**:
  - Changed saved products/wishlist from popup modal to dedicated page
  - Heart icon in header now navigates to /ulozeno page instead of opening SavedProductsWindow modal
  - Provides better user experience with full-page layout for managing saved items
- **Vertical Lines Repositioning**:
  - Repositioned vertical guide lines 40px wider on each side (from 33.33%/66.66% to calc(33.33% - 40px)/calc(66.66% + 40px))
  - Extended vertical lines to touch header (top: 0) and reach footer (bottom: 0)
  - Updated all footer pages to fit content within vertical lines with 8px spacing
- **Button Standardization**:
  - Standardized all buttons with 4px border radius (previously 2px)
  - Consistent button height across app: padding: 13.8px 25.6px
- **Login Page Refinements**:
  - Updated Google login button to use black G logo (currentColor for proper hover states)
  - Updated all input fields to have 4px rounded corners and 1/3 page width
  - Confirmed labels positioned 2px above input fields
- **Newsletter Window Updates**:
  - Moved email input field 40px lower (from marginTop 40px to 80px)
  - Updated slide-in animation to match cart drawer (300ms duration with ease-in-out)
  - Fixed email validation to show red border and bilingual error message
  - Reverted footer newsletter button to underlined text style (instead of white button)
  - Updated spacing: E-mail label 4px above field, description text centered, consent text 24px below field
- **Legal Page Redesign**:
  - Redesigned právní informace page with clean, minimalist Balenciaga-inspired layout
  - Added numbered sections for better readability
  - Improved typography and spacing throughout
- **New Reusable Components**:
  - Created PageFrame component with vertical lines (at 1/3 and 2/3 width, from 40px below top to 50% viewport height)
  - Created Accordion component for collapsible FAQ sections with smooth animations and chevron icons
- **Page Redesigns**:
  - Redesigned vrácení zboží page with Balenciaga-inspired form (email + order number fields, clean centered layout)
  - Redesigned doručení page with collapsible accordion FAQ (6 delivery-related sections)
  - Applied PageFrame with vertical lines to all 9 footer-linked pages for consistent design

## Previous Changes (November 11, 2025)
- **Reklamační řád Page**: Created new dedicated page at /reklamacni-rad with complete consumer rights information
- **Footer Contact Updates**:
  - Updated phone number to +420 775 181 107
  - Updated email to ufosport@mail.com
  - Updated Instagram link to https://www.instagram.com/ufosport.cz/?hl=en
  - Updated Facebook link to https://www.facebook.com/ufosports/?locale=cs_CZ

## Earlier Changes (November 10, 2025)
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