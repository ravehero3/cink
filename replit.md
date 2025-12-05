# UFO Sport E-shop

## Overview
A minimalistic black-and-white e-commerce website for UFO Sport (ufosport.cz), designed with a high-fashion, Balenciaga-inspired aesthetic. The project focuses on clean design, enlarged typography, and generous spacing to deliver a premium user experience. It supports a comprehensive e-commerce workflow, from product browsing and selection to secure payment processing and shipping. The platform includes advanced admin features for customer management, email campaigns, SEO optimization, and dynamic pricing rules. The business vision is to provide a premium, visually striking online retail experience that stands out in the sport e-commerce market.

## User Preferences
I prefer clear, concise explanations.
I value a systematic and organized approach to development.
Please ensure all UI/UX changes strictly adhere to the defined black/white/neon green color palette and minimalistic design principles.
I prefer detailed explanations of complex architectural decisions.
Ask before making major changes to the core design system or introducing new external dependencies.

## System Architecture

### UI/UX Decisions
The design strictly adheres to a Balenciaga-inspired minimalist aesthetic, utilizing a black-and-white color palette with neon green accents for primary calls to action. It avoids grays, shadows, and gradients. Typography features enlarged "Helvetica Neue" with specific letter spacing for headlines. A consistent 8px-based spacing system is used, with a 1600px max-width container and responsive product grids. Buttons have sharp corners with minimal hover effects. Headers are fixed, integrating search functionality and a three-column grid. Cart and saved products use slide-in drawers. Product cards include color variant display on hover and clickable image navigation dots. Single product pages feature a heart icon for saving, standardized typography, and adjusted spacing. Accordion sections have smooth arrow rotation and content reveal animations. Checkout flows are a three-step process with a 33/67% split. Admin dashboards use minimalist design with 1px black dividers and 20px padding. Mobile responsiveness is fully implemented with a breakpoint at 768px, featuring a hamburger menu, slide-out navigation, and accordion-style footer sections. Video display on category pages now supports both video and image with graceful fallbacks. Unpaid orders in the account page display a "ZAPLATIT OBJEDNÁVKU" button.

### Technical Implementations
The project is built using Next.js 14 (App Router) and TypeScript, with Tailwind CSS for styling. Zustand manages client-side state for the cart, recently viewed items, and saved products. The application features a comprehensive checkout flow, order creation, payment page integration (redirecting to `/platba`), and confirmation. Search functionality includes product filtering. Promo code validation and discount calculations are integrated. Homepage video and category sections are customizable via an admin interface. UI animations enhance user experience. Saved product functionality includes database synchronization for authenticated users and local storage persistence for unauthenticated users. Admin users are redirected to a dashboard with real-time revenue and order statistics (Recharts LineChart), order sorting, customer phone display, inventory alerts, low stock management, bulk product operations, and advanced features. iOS Safari video compatibility is ensured with `playsInline` and `translateZ(0)`. URL structures are clean (e.g., `/[slug]`), with 301 redirects for old paths. Order URLs now include a `securityToken` for GDPR-compliant access. Error logging includes unique IDs (ORD-xxx, PAY-xxx) and detailed, timestamped logs with specific Prisma error handling and Czech messages. Client-side and server-side validation prevent `NaN` values, particularly for `totalPrice`. Mobile-optimized videos and images are supported, switching based on screen size.

### Feature Specifications
- **Product Catalog**: Display of products with images, size options, stock levels, and detailed information fields (`productInfo`, `sizeFit`, `shippingInfo`, `careInfo`). Includes comprehensive visual size charts.
- **Shopping Cart**: Slide-in drawer with recently viewed products and highlighted benefits, full-screen on mobile.
- **Checkout Flow**: End-to-end process including promo code application, payment gateway integration, shipping point selection, and a dedicated payment page.
- **Order Management**: Creation and confirmation of customer orders, with admin sorting capabilities and Czech status translations. Enhanced security with `securityToken` for order access.
- **User Accounts**: Basic user authentication and saved products functionality.
- **Saved Products**: Wishlist functionality with persistence.
- **Search**: Site-wide product search with filtering and product image previews.
- **Admin Features**: Content management for homepage sections, product details, order statistics dashboard, inventory alerts, bulk product operations, customer management (queries user data, sorting, role-based filtering, detailed profiles), email campaign management (metadata, tracking engagement, targeting), SEO optimization tools (per-product fields, character count feedback, missing metadata alerts), and dynamic pricing rules (flexible rule system, time-based validation, constraints). Includes Cloudinary media library integration with sync functionality.
- **Homepage Content**: HeroSection and CategorySection content (videos/images) stored in the database via dedicated API endpoints, configurable through the admin panel.

### System Design Choices
- **Framework**: Next.js 14 (App Router).
- **Language**: TypeScript.
- **Styling**: Tailwind CSS.
- **Database**: PostgreSQL (Prisma ORM), migrated to Replit's internal PostgreSQL.
- **Authentication**: NextAuth.js.
- **State Management**: Zustand for client-side global state.

## External Dependencies
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payment Gateway**: GoPay
- **Shipping Integration**: Zásilkovna (Packeta) API
- **Email Service**: Resend API
- **File Storage**: Cloudinary / Vercel Blob