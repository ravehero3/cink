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

## Recent Changes (December 5, 2025)

### Mobile Video/Image Display Improvements
**Fixed Black Bar Issue on Mobile:**
- VideoSection.tsx: On mobile (screen width < 768px), the section now uses `height: 100vw` to create a perfect square container
- Videos/images use `object-cover` to fill the square and crop the sides (no more black bars)
- Desktop maintains `80vh` height for the full-width banner experience

**White Background for Video Sections:**
- Changed all video section backgrounds from black to white on the main page
- Updated text colors accordingly (from white to black) for visibility
- Admin buttons now use consistent black border styling

**Image Sections (ProductShowcaseSection):**
- Applied same mobile cropping logic: square container (100vw height) with object-cover
- Images center and crop sides on mobile for a clean square display

**CategoryHero Title Panel:**
- Reduced title bar height from 6x header height (264px) to 4x header height (176px)
- Text remains centered vertically and horizontally
- Hero media section background changed from black to white

### Category Page Media Upload Fix
**Fixed "Upravit médium" Button Upload:**
- Fixed API endpoint path in CategoryClientPage.tsx: changed from non-existent `/api/admin/media/upload` to correct `/api/media/upload`
- CategoryHero.tsx now supports both video and image display (previously only showed images)
- Video detection uses file extension matching (.mp4, .webm, .mov, .m4v) or Cloudinary video path
- Safe fallback: shows image while video loads, falls back to image if video fails
- Works for all category pages: VOODOO808, SPACE LOVE, RECREATION WELLNESS, T SHIRT GALLERY

**Removed Grayscale Filter:**
- Removed `filter: grayscale(1) contrast(1.2)` from CategoryHero.tsx - banners now display in full color

**Technical Notes:**
- All media APIs (`/api/hero-sections`, `/api/category-sections`, `/api/categories`) are public - no admin authentication required
- Admin-only content is limited to "Edit" buttons, not the media itself

### Czech Text Diacritics Updates
- Mobile menu: Changed "ULOZENE POLOZKY" to "ULOŽENÉ POLOŽKY" (proper Czech diacritics)
- Saved items page (/ulozeno): Changed page title from "ULOŽENÉ PRODUKTY" to "ULOŽENÉ POLOŽKY"

### Video Section Improvements
**Removed Placeholder Text:**
- Removed "No video uploaded" placeholder text from VideoSection.tsx - looks more professional when no video is set
- Section now displays cleanly with just the title and buttons when no video is uploaded

**Admin Text Color Control:**
- Added `textColor` field to HeroSection database model (prisma/schema.prisma)
- Admins can now select black or white text color for video sections via the Edit Video modal
- Text color option appears as radio buttons with visual color swatches
- Applies to both header text and button borders
- Default is black text; white option available for dark video backgrounds
- Files updated: VideoSection.tsx, HomePageContent.tsx, EditSectionModal.tsx, app/api/hero-sections/route.ts

**Database Migration Required:**
- The textColor field was added to the HeroSection model
- A database migration needs to be run on production: `npx prisma migrate dev` or `npx prisma db push`

### Dynamic Homepage Section Management
**Admin Section Controls:**
- Admins can now add, delete, and reorder homepage sections dynamically
- Each section displays an X button (top-left corner) to delete the section
- The last section displays a + button (bottom-right corner) to add a new section
- Delete confirmation modal prevents accidental deletion

**Section Type Toggle:**
- EditSectionModal now includes VIDEO/IMAGE type toggle
- Admins can switch any section between video and image types
- Type change is persisted to the database immediately

**API Changes:**
- `/api/hero-sections` GET endpoint now returns ordered array instead of object map
- Added DELETE endpoint that reindexes remaining sections after deletion
- POST endpoint supports creating new sections with automatic order assignment

**State Initialization Fix:**
- HomePageContent now initializes heroSections with defaultHeroSectionsArray
- Prevents blank page on first render before API response arrives
- Default sections show category titles (VOODOO808, SPACE LOVE, etc.) even without media

### Admin Orders Statistics Update
**CANCELLED Orders Exclusion:**
- Admin orders page now filters CANCELLED orders from revenue calculations
- Sales graph (Recharts LineChart) only shows data from active orders
- Total revenue and order count statistics exclude cancelled orders
- Uses `activeOrders` array filtered from all orders