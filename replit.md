# UFO Sport E-shop

## Overview
A minimalistic black-and-white e-commerce website for UFO Sport (ufosport.cz) built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 14 with App Router and TypeScript ✓
- **Styling**: Tailwind CSS (strict black/white palette) ✓
- **Database**: PostgreSQL with Prisma ORM ✓ configured and seeded
- **Authentication**: NextAuth.js ✓ configured (credentials-based)
- **Payment**: GoPay integration (Czech payment gateway) - needs API keys
- **Email**: Resend API for transactional emails - needs API key
- **Shipping**: Zásilkovna (Packeta) API integration - needs API key
- **File Storage**: Cloudinary for product images - needs API keys

## Design System
### Color Palette (STRICT)
- **Background**: Pure white (#FFFFFF)
- **Text/Lines/Borders**: Pure black (#000000)
- **NO grays, shadows, or gradients**

### Typography
- **Font**: System font stack (Arial, Helvetica, sans-serif)
- **Sizes**:
  - Body text: 14px
  - Product names: 16px
  - Headers: 18px
  - Main titles: 24px
- **Weight**: Regular (400) for most text, Bold (700) for emphasis only
- **Line height**: 1.4

### Layout System
- **Lines**: All separating lines are exactly 1px thick, pure black
- **Spacing**: Consistent padding/margins (16px, 24px, 32px increments)
- **Grid**: 4 products per row on desktop (2 on tablet, 1 on mobile)
- **All rectangles**: 1px black border
- **Buttons**: Only black or white with opposite text color

## Project Structure
```
/app                        # Next.js App Router
  /api                      # API routes
    /auth/[...nextauth]     # NextAuth authentication endpoint
    /gopay                  # GoPay payment integration
      /create-payment       # Create payment endpoint
      /webhook              # Payment status webhook
    /orders                 # Order management
      /create               # Create new order
    /test-db                # Database connection test
  /hledat                   # Search results page
  /oblibene                 # Category page (favorites)
  /pokladna                 # Checkout page
  /potvrzeni/[orderNumber]  # Order confirmation page
  /produkt/[slug]           # Product detail page
  /ulozeno                  # Saved products page
  /globals.css              # Global styles with Tailwind
  layout.tsx                # Root layout with headers/footer
  page.tsx                  # Homepage
/components                 # Reusable components
  CartWindow.tsx            # Shopping cart slide-in drawer
  Footer.tsx                # Site footer
  Header1.tsx               # Main navigation header
  Header2.tsx               # Search and user actions header
  ProductCard.tsx           # Product grid item component
  SavedProductsWindow.tsx   # Saved products slide-in drawer
/lib                        # Utility functions
  prisma.ts                 # Prisma client instance
  zasilkovna-widget.ts      # Zásilkovna pickup point selector
/prisma                     # Database schema
  schema.prisma             # Complete database schema
  seed.ts                   # Database seeding (40 products, 4 categories)
```

## Database
The PostgreSQL database is configured with the following models:
- **User**: User accounts with authentication
- **Product**: Product catalog with images, sizes, stock
- **Category**: Product categories (VOODOO808, SPACE LOVE, etc.)
- **Order**: Customer orders with payment and shipping info
- **PromoCode**: Discount codes and promotions
- **NewsletterSubscriber**: Newsletter email subscriptions

**Commands:**
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Development
- **Port**: 5000 (configured for Replit)
- **Host**: 0.0.0.0 (allows Replit proxy)
- **Run**: `npm run dev`

## Recent Changes
- **2025-11-05**: 
  - Initial project setup with Next.js 14, TypeScript, and Tailwind CSS configured with strict black/white design system
  - Configured development server to run on port 5000 for Replit environment
  - Set up PostgreSQL database with Prisma ORM
  - Created complete database schema with all models (User, Product, Category, Order, PromoCode, NewsletterSubscriber)
  - Successfully tested database connection
  - Created basic homepage placeholder

- **2025-11-06**:
  - Created comprehensive database seed with 40 products across 4 categories (VOODOO808, SPACE LOVE, RECREATION WELLNESS, T SHIRT GALLERY)
  - Implemented complete checkout flow with order creation API endpoint
  - Created order confirmation page (/potvrzeni/[orderNumber]) showing order details and payment status
  - Set up PostgreSQL database with full schema migration
  - Configured NextAuth with secure secret and URL
  - Created admin user for testing: admin@ufosport.cz / admin123
  - Refactored NextAuth to use shared Prisma client for better connection management
  - Verified all core functionality: homepage, headers, categories, product listings, APIs
  - Built saved products page (/ulozeno) with grid layout matching design system
  - Implemented search results page (/hledat) with product filtering
  - Created SavedProductsWindow component with slide-in animation
  - Integrated GoPay payment gateway (webhook + payment creation endpoints with mandatory target/goid)
  - Added Zásilkovna widget integration in checkout for pickup point selection
  - Implemented promo code functionality in checkout with automatic validation and discount calculation
  - Fixed all TypeScript errors and code quality issues
  - All components strictly follow black/white design system with no grays or shadows

## Completed Features
1. ✅ Database schema and Prisma ORM setup
2. ✅ Core layout components (Header1, Header2, Footer)
3. ✅ Product listing and category pages
4. ✅ Product detail pages with size selection
5. ✅ Shopping cart with slide-in drawer
6. ✅ Complete checkout flow with order creation
7. ✅ Order confirmation page
8. ✅ Saved products functionality
9. ✅ Search functionality
10. ✅ Promo code system
11. ✅ GoPay payment integration
12. ✅ Zásilkovna shipping integration
13. ✅ Database seeding with realistic product data

## Environment Variables Needed
Set these environment variables for full functionality:
- `NEXTAUTH_SECRET` - Random secret for NextAuth.js session encryption
- `NEXTAUTH_URL` - Full URL of the site (e.g., https://your-domain.replit.dev)
- `GOPAY_GOID` - GoPay merchant ID (GOID)
- `GOPAY_CLIENT_ID` - GoPay OAuth client ID
- `GOPAY_CLIENT_SECRET` - GoPay OAuth client secret
- `GOPAY_ENVIRONMENT` - Set to "production" for live payments (default: sandbox)
- `NEXT_PUBLIC_ZASILKOVNA_API_KEY` - Zásilkovna API key for pickup widget
- `RESEND_API_KEY` - Resend API key for transactional emails
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name for image storage
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## Next Steps
1. Set up environment variables for production integrations
2. Configure NextAuth.js authentication providers
3. Build admin panel for product/order management
4. Implement Resend email notifications (order confirmations, shipping updates)
5. Set up Cloudinary for product image uploads
6. Add user account pages (profile, order history)
7. Implement product reviews and ratings
8. Deploy to production and configure custom domain
