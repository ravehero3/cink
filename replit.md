# UFO Sport E-shop

## Overview
A minimalistic black-and-white e-commerce website for UFO Sport (ufosport.cz), designed with a high-fashion, Balenciaga-inspired aesthetic. The project focuses on clean design, enlarged typography, and generous spacing to deliver a premium user experience. It supports a comprehensive e-commerce workflow, from product browsing and selection to secure payment processing and shipping. The platform includes advanced admin features for customer management, email campaigns, SEO optimization, and dynamic pricing rules.

## Recent Changes (December 3, 2025)

**Admin Media Library Navigation:**
- Added "MÉDIA" link to admin sidebar navigation at `/admin/media`
- Admin can now easily access the Cloudinary-backed media library
- Media picker already integrated in product editing pages ("Vybrat z knihovny" button)

**GoPay Configuration Updates:**
- Set GOPAY_ENVIRONMENT to production mode
- Updated NEXTAUTH_URL for production to use www.ufosport.cz
- Improved error logging in order creation and payment APIs for debugging
- **IMPORTANT**: GoPay requires production credentials (GOID, Client ID, Client Secret) to be set on Vercel

**Production Domain Setup:**
- Configured NEXTAUTH_URL for production deployment to www.ufosport.cz
- Separate environment variables: development uses Replit domain, production uses www.ufosport.cz
- GoPay payment callbacks will correctly redirect to the right domain in each environment

**Cloudinary Upload Widget Improvements:**
- Added loading state indicator to upload button (shows spinner while loading)
- Button is disabled until widget is ready, preventing premature clicks
- Better error handling and feedback for users

**Cloudinary Media Sync:**
- Added Cloudinary sync functionality to import files uploaded directly via Cloudinary website
- New API endpoint: `/api/media/sync-cloudinary` - syncs images and videos from Cloudinary to database
- Added "Sync from Cloudinary" button in admin media library (`/admin/media`)
- Shows sync status with success/error feedback

**Database Fix:**
- Fixed database tables not existing error
- Ran Prisma schema push and database seeding
- Order creation now works correctly with GoPay payment integration

**Files Changed:**
- `components/admin/CloudinaryUploadButton.tsx` - Added loading state and better UX
- `app/api/media/sync-cloudinary/route.ts` - New Cloudinary sync endpoint
- `app/admin/media/page.tsx` - Added sync button with status feedback

---

## Previous Changes (December 2, 2025)

**URL Structure Improvements:**
- Changed category page URLs from `/kategorie/[slug]` to `/[slug]` for cleaner URLs
- Example: `/kategorie/voodoo808` → `/voodoo808`
- Added permanent 301 redirects for old URLs to preserve SEO and bookmarks
- Updated all internal navigation links

**Database Setup:**
- Connected to Replit PostgreSQL database
- Seeded database with 4 categories (VOODOO808, SPACE LOVE, RECREATION WELLNESS, T SHIRT GALLERY)
- Seeded database with 40 sample products

**Files Changed:**
- `app/[slug]/page.tsx` - New dynamic category route
- `next.config.js` - Added redirect rules
- `components/Header1.tsx` - Updated navigation links
- `store/categorySectionsStore.ts` - Updated default links
- `prisma/schema.prisma` - Removed directUrl for Replit database compatibility

---

## Previous Changes (November 26, 2025)

**Four Advanced Admin Features Implemented:**

### 1. Customer Management Dashboard (`/admin/customers`)
- View all customers with order history, total spending, phone contact info
- Filter by user role (regular/admin)
- Sort by name, total spending, or join date
- Click "Detail" to view individual customer profile with all their orders
- Track newsletter subscription status

**Files:**
- `app/admin/customers/page.tsx` - Main customer list view
- `app/admin/customers/[id]/page.tsx` - Individual customer detail page
- `app/api/admin/customers/route.ts` - List customers API
- `app/api/admin/customers/[id]/route.ts` - Customer detail API

### 2. Email Campaigns Manager (`/admin/email-campaigns`)
- Create, draft, and send targeted email campaigns
- Choose target audience (all subscribers, abandoned carts, VIP customers)
- Track campaign status (draft, scheduled, sent)
- View open rates and engagement metrics
- Edit or delete existing campaigns
- Create new campaign form at `/admin/email-campaigns/new`

**Files:**
- `app/admin/email-campaigns/page.tsx` - Main campaigns list
- `app/admin/email-campaigns/new/page.tsx` - Create new campaign form
- `app/api/admin/email-campaigns/route.ts` - Create/list campaigns
- `app/api/admin/email-campaigns/[id]/route.ts` - Edit/delete campaign

### 3. SEO Management (`/admin/seo-management`)
- Optimize SEO for every product with individual metadata
- Set meta title (50-60 char limit with counter)
- Set meta description (150-160 char limit with counter)
- Add target keywords
- Set OG image for social media sharing
- Alert system shows products missing SEO data
- Search and filter products for quick access

**Files:**
- `app/admin/seo-management/page.tsx` - SEO management interface
- Updated `app/api/admin/products/[id]/route.ts` - PATCH endpoint for SEO fields

### 4. Dynamic Pricing Rules (`/admin/pricing-rules`)
- Create flexible discount rules without touching code
- Rule types: volume discounts, minimum order amounts, first-time customer offers, seasonal sales
- Set discount as percentage or fixed amount
- Specify validity dates (valid from/until)
- Set minimum quantity or minimum order amount requirements
- Toggle rules active/inactive without deleting
- Full CRUD interface with professional form validation

**Files:**
- `app/admin/pricing-rules/page.tsx` - Rules management interface
- `app/api/admin/pricing-rules/route.ts` - Create/list rules
- `app/api/admin/pricing-rules/[id]/route.ts` - Edit/delete rules

**Database Schema Updates:**
- Added `EmailCampaign` model with campaign tracking (sent count, open count, status)
- Added `PricingRule` model with flexible discount configuration
- Extended `Product` model with SEO fields: `seoTitle`, `seoDescription`, `seoKeywords`, `ogImage`

**Admin Panel Color Scheme** - All green elements replaced with black:
- Cart Drawer Header - black background with white text
- Admin controls use black/white button styling
- Consistent minimalist design throughout

**Product Detail Fields** - Added 4 optional text fields to products:
- `productInfo` - Informace o produktu
- `sizeFit` - Size & Fit
- `shippingInfo` - Doprava
- `careInfo` - Péče

**Size Charts System** - Comprehensive visual sizing for different product types:
- T-shirt sizing with SVG diagram
- Hoodie sizing with measurements
- Crewneck sizing with neckline detail
- Generic item dimensions (Length, Width, Depth)
- Modal display on product pages when users click "Size & fit"

**Search Bar Thumbnails** - Added 48x48px product image previews in search results

**Category Products Fix** - Fixed case-insensitive matching for category filtering

**Order Status Translations** - Czech translations for order statuses (ČEKÁ NA VYŘÍZENÍ, ZPRACOVÁVÁ SE, etc.)

**Previous Critical Bug Fixes:**
1. Order confirmation lookup by orderNumber (guest checkout support)
2. Checkout email auto-fill synchronization
3. Safari compatibility (requestIdleCallback → setTimeout)
4. Production database connection to Neon PostgreSQL
5. Database seeding with 40+ products

## User Preferences
I prefer clear, concise explanations.
I value a systematic and organized approach to development.
Please ensure all UI/UX changes strictly adhere to the defined black/white/neon green color palette and minimalistic design principles.
I prefer detailed explanations of complex architectural decisions.
Ask before making major changes to the core design system or introducing new external dependencies.

## System Architecture

### Admin Features Architecture
**Customer Management:**
- Queries user data with nested order counts and spending calculations
- Supports multiple sorting options (name, spending, date)
- Role-based filtering for admin/regular users
- Detail pages fetch full order history for individual customers

**Email Campaigns:**
- Stores campaign metadata (subject, content, audience targeting)
- Tracks engagement (sent count, open count, open rate percentage)
- Status tracking (draft, scheduled, sent)
- Supports selective audience targeting (future: integration with Resend)

**SEO Management:**
- Per-product SEO fields stored in database
- Character count feedback for optimal tag length
- Bulk product search and filter capability
- Alert system for missing metadata

**Pricing Rules:**
- Flexible rule system with multiple discount types
- Time-based validation (valid from/until dates)
- Minimum quantity or order amount constraints
- Active/inactive toggle without deletion
- Supports percentage and fixed amount discounts

### UI/UX Decisions
The design strictly adheres to a Balenciaga-inspired minimalist aesthetic, using a black-and-white color palette with neon green accents solely for primary calls to action. The design avoids grays, shadows, and gradients. Typography features enlarged "Helvetica Neue" (or similar sans-serif) with specific letter spacing for headlines. A consistent 8px-based spacing system is used throughout. The layout includes a 1600px max-width container and responsive product grids. Buttons have sharp corners with minimal hover effects. Headers are fixed, integrating search functionality and a three-column grid layout with reduced icon sizes (22px) and specific font styles for navigation. Cart and saved products use slide-in drawers with semi-transparent overlays. Product cards include color variant display on hover and clickable image navigation dots. Single product pages feature a heart icon for saving, standardized typography for titles and buttons, and carefully adjusted spacing. Accordion sections include smooth arrow rotation and content reveal animations. Checkout flows follow a three-step process with a 33/67% split for order summary/form, and minimalist border styling. Admin dashboards feature minimalist design with 1px black dividers and 20px padding.

### Technical Implementations
The project is built using Next.js 14 (App Router) and TypeScript, with Tailwind CSS for styling. Zustand manages client-side state for the cart, recently viewed items, and saved products. The application features a comprehensive checkout flow, order creation, and confirmation. Search functionality includes product filtering. Promo code validation and discount calculations are integrated. Homepage video and category sections are customizable via an admin interface. UI animations, such as search bar slide-down, delayed content fade-in, and interactive elements (like sparkle animation on saving products), are implemented for a smooth user experience. Saved product functionality includes database synchronization for authenticated users and local storage persistence for unauthenticated users. Admin users are redirected to the admin dashboard upon login, which includes real-time revenue and order statistics with Recharts LineChart visualization, order sorting, customer phone display, inventory alerts, low stock management, bulk product operations (price, category, visibility, stock, threshold, duplicate), and new advanced features (customer management, email campaigns, SEO management, pricing rules).

### Feature Specifications
- **Product Catalog**: Display of products with images, size options, and stock levels.
- **Shopping Cart**: Slide-in drawer with recently viewed products and highlighted benefits.
- **Checkout Flow**: End-to-end process including promo code application, payment gateway integration, and shipping point selection.
- **Order Management**: Creation and confirmation of customer orders, with admin sorting capabilities.
- **User Accounts**: Basic user authentication and saved products functionality.
- **Saved Products**: Wishlist functionality with persistence.
- **Search**: Site-wide product search with filtering.
- **Admin Features**: Content management for homepage sections, product details, order statistics dashboard, inventory alerts, bulk product operations, **customer management dashboard**, **email campaign management**, **SEO optimization tools**, and **dynamic pricing rules**.

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
