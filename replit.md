# UFO Sport E-shop

## Overview
A minimalistic black-and-white e-commerce website for UFO Sport (ufosport.cz) built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS (strict black/white palette)
- **Database**: PostgreSQL with Prisma ORM ✓ configured
- **Authentication**: NextAuth.js (to be configured)
- **Payment**: GoPay integration (Czech payment gateway)
- **Email**: Resend API for transactional emails
- **Shipping**: Zásilkovna (Packeta) API integration
- **File Storage**: Cloudinary for product images

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
/app                 # Next.js App Router
  /api/test-db      # Database connection test endpoint
  /globals.css      # Global styles with Tailwind
  layout.tsx        # Root layout
  page.tsx          # Homepage
/components          # Reusable components (to be created)
/lib                 # Utility functions
  prisma.ts         # Prisma client instance
/prisma              # Database schema
  schema.prisma     # Prisma schema with all models
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

## Next Steps
1. ~~Set up PostgreSQL database and Prisma~~ ✓ Done
2. Create core layout components (Header1, Header2, Footer)
3. Build product listing and detail pages
4. Implement shopping cart and checkout flow
5. Set up authentication with NextAuth.js
6. Build admin panel
7. Integrate external services (GoPay, Zásilkovna, Resend, Cloudinary)
