# UFO Sport E-shop

## Overview
A minimalistic black-and-white e-commerce website for UFO Sport (ufosport.cz), designed with a high-fashion, Balenciaga-inspired aesthetic. The project focuses on clean design, enlarged typography, and generous spacing to deliver a premium user experience. It supports a comprehensive e-commerce workflow, from product browsing and selection to secure payment processing and shipping. The platform includes advanced admin features for customer management, email campaigns, SEO optimization, and dynamic pricing rules. The business vision is to provide a premium, visually striking online retail experience that stands out in the sport e-commerce market.

## Recent Changes (December 5, 2025)

### Cross-Browser & Mobile Fixes (Latest Update)
**Chrome Order Creation Fix:**
- Fixed Chrome-specific issue where order creation failed due to NaN totalPrice values
- Added client-side validation to sanitize numeric values before API submission
- Added server-side validation to reject and log invalid totalPrice payloads
- Chrome's locale-sensitive number parsing could cause NaN propagation; now properly guarded

**Safari Video Fix:**
- Improved video playback compatibility for Safari browsers
- Added explicit H.264 codec specification for better Safari support
- Added webkit-playsinline attribute for iOS compatibility
- Implemented video error handling with graceful fallback
- Videos now auto-retry playback if initial attempt fails

**Mobile Video/Image Cutout Support:**
- Added `mobileVideoUrl` prop to VideoSection component for mobile-optimized videos
- Added `mobileImageUrl` prop to ProductShowcaseSection component for mobile-optimized images
- Components detect screen size and automatically switch to mobile assets when provided
- Desktop layouts remain unchanged when mobile assets are not specified

### Mobile Responsiveness - Phase 5 (Additional UI Fixes)
**Product Grid Mobile:**
- Further reduced gap between product image and text to 4px on mobile (pt-1)

**Info Pages Mobile Width:**
- All 7 info pages now use full width with 16px padding on mobile
- Pattern: `w-full px-4 md:w-1/3 md:px-0`
- Pages fixed: sledování objednávky, FAQ, vrácení zboží, právní informace, ochrana osobních údajů, cookies, nastavení cookies

**Doručení Page Mobile Text:**
- Fixed text width on mobile - now uses 90% width instead of 33.33%
- Prevents excessive text wrapping on narrow screens

**Cookie Settings Button:**
- Mobile: Shows "ULOŽIT" (shorter text fits better)
- Desktop: Shows "ULOŽIT NASTAVENÍ" (full text)

---

### Mobile Responsiveness - Phase 4 (Additional Fixes)
**Return Policy Update:**
- Changed return policy from 30 days to 14 days in product page accordion

**Mobile Menu Czech Characters:**
- Fixed "PRIHLASIT SE" → "PŘIHLÁSIT SE"
- Fixed "MUJ UCET" → "MŮJ ÚČET"

**Sort Panel Mobile:**
- Made "seřadit podle" popup fill whole screen on mobile (w-full md:w-1/3)

**Product Grid Mobile:**
- Reduced gap between product image and text to 16px on mobile (pt-4) → Later changed to 8px (pt-2)

**New Doručení Page:**
- Created app/doruceni/page.tsx with delivery information
- Includes free shipping info, delivery times, Zásilkovna details

**Video Section Mobile:**
- Made video section responsive with min-h-[50vh] md:h-[80vh]

**Vertical Lines Hidden on Mobile (Additional Pages):**
- FAQ, sledování objednávky, vrácení objednávky, pravní informace
- ochrana osobních údajů, cookies, nastavení cookies, doručení

---

### Mobile Responsiveness - Phase 3 (Verification & Fixes)
**Vertical Lines Hidden on Mobile:**
- All pages now consistently use `hidden md:block` for vertical decorative lines
- Updated `app/platba/page.tsx` from `hidden lg:block` to `hidden md:block` for consistency

**Verified Mobile-Ready Features:**
- ProductCard: Text positioned below image on mobile (`relative`), overlaid on desktop (`md:absolute`)
- Single Product Page: Dot indicators at `bottom: 24px` confirmed working
- košík and uloženo pages: Already have responsive layouts and hidden vertical lines

---

## Recent Changes (December 4, 2025)

### Mobile Responsiveness - Phase 2
**Product Grid Mobile:**
- 2 products per row on mobile (grid-cols-2)
- 4 products per row on desktop (lg:grid-cols-4)

**Filter Popup Mobile:**
- Full-screen width on mobile (w-full md:w-1/3)
- Same responsive behavior as cart drawer

**Single Product Page Mobile:**
- Image carousel at top with left/right arrow navigation
- Dot indicators showing current image position
- Heart icon for saving products on image
- Text content (title, price, buttons, accordions) displayed below image
- Responsive widths: full width on mobile, 36vw on desktop
- Desktop layout preserved (50/50 split with images left, info right)

**Files Changed:**
- `components/ProductsGrid.tsx` - 2 columns on mobile
- `components/FilterWindow.tsx` - Full-screen on mobile
- `app/produkty/[slug]/page.tsx` - Mobile image carousel and responsive layout

---

## User Preferences
I prefer clear, concise explanations.
I value a systematic and organized approach to development.
Please ensure all UI/UX changes strictly adhere to the defined black/white/neon green color palette and minimalistic design principles.
I prefer detailed explanations of complex architectural decisions.
Ask before making major changes to the core design system or introducing new external dependencies.

## System Architecture

### Admin Features Architecture
- **Customer Management:** Queries user data with nested order counts and spending, supports sorting and role-based filtering, and provides detailed customer profiles.
- **Email Campaigns:** Manages campaign metadata, tracks engagement (sent count, open rate), supports status tracking (draft, scheduled, sent), and allows selective audience targeting.
- **SEO Management:** Stores per-product SEO fields, provides character count feedback, enables bulk product search/filter, and alerts for missing metadata.
- **Pricing Rules:** Implements a flexible rule system for various discount types, includes time-based validation, minimum quantity/order amount constraints, and active/inactive toggles.

### UI/UX Decisions
The design strictly adheres to a Balenciaga-inspired minimalist aesthetic, utilizing a black-and-white color palette with neon green accents for primary calls to action. It avoids grays, shadows, and gradients. Typography features enlarged "Helvetica Neue" with specific letter spacing for headlines. A consistent 8px-based spacing system is used, with a 1600px max-width container and responsive product grids. Buttons have sharp corners with minimal hover effects. Headers are fixed, integrating search functionality and a three-column grid. Cart and saved products use slide-in drawers. Product cards include color variant display on hover and clickable image navigation dots. Single product pages feature a heart icon for saving, standardized typography, and adjusted spacing. Accordion sections have smooth arrow rotation and content reveal animations. Checkout flows are a three-step process with a 33/67% split. Admin dashboards use minimalist design with 1px black dividers and 20px padding. Mobile responsiveness is fully implemented with a breakpoint at 768px, featuring a hamburger menu, slide-out navigation, and accordion-style footer sections.

### Technical Implementations
The project is built using Next.js 14 (App Router) and TypeScript, with Tailwind CSS for styling. Zustand manages client-side state for the cart, recently viewed items, and saved products. The application features a comprehensive checkout flow, order creation, payment page integration (redirecting to `/platba`), and confirmation. Search functionality includes product filtering. Promo code validation and discount calculations are integrated. Homepage video and category sections are customizable via an admin interface. UI animations enhance user experience. Saved product functionality includes database synchronization for authenticated users and local storage persistence for unauthenticated users. Admin users are redirected to a dashboard with real-time revenue and order statistics (Recharts LineChart), order sorting, customer phone display, inventory alerts, low stock management, bulk product operations, and advanced features. iOS Safari video compatibility is ensured with `playsInline` and `translateZ(0)`. URL structures are clean (e.g., `/[slug]`), with 301 redirects for old paths.

### Feature Specifications
- **Product Catalog**: Display of products with images, size options, stock levels, and detailed information fields (`productInfo`, `sizeFit`, `shippingInfo`, `careInfo`). Includes comprehensive visual size charts.
- **Shopping Cart**: Slide-in drawer with recently viewed products and highlighted benefits, full-screen on mobile.
- **Checkout Flow**: End-to-end process including promo code application, payment gateway integration, shipping point selection, and a dedicated payment page.
- **Order Management**: Creation and confirmation of customer orders, with admin sorting capabilities and Czech status translations.
- **User Accounts**: Basic user authentication and saved products functionality.
- **Saved Products**: Wishlist functionality with persistence.
- **Search**: Site-wide product search with filtering and product image previews.
- **Admin Features**: Content management for homepage sections, product details, order statistics dashboard, inventory alerts, bulk product operations, customer management, email campaign management, SEO optimization tools, and dynamic pricing rules. Includes Cloudinary media library integration with sync functionality.

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