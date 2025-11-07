# Test Credentials for UFO Sport E-shop

## Environment Setup

The following environment variables have been configured in `.env.local`:

- `NEXTAUTH_SECRET`: Secure random secret for NextAuth.js
- `NEXTAUTH_URL`: Set to your Replit domain

## Database

Database is connected and synced with Prisma schema. All tables have been created successfully.

## Test Users

### Admin User
- **Email**: `admin@ufosport.cz`
- **Password**: `admin123`
- **Role**: ADMIN
- **Access**: Can access admin dashboard at `/admin`

### Regular User
- **Email**: `user@ufosport.cz`
- **Password**: `user123`
- **Role**: USER
- **Access**: Can place orders and manage account

## Testing Login

1. Navigate to `/prihlaseni` to access the login page
2. Use the credentials above to test different user roles
3. Admin users will have access to the admin dashboard with order management

## Admin Dashboard Features

The admin dashboard includes the following pages:

### Main Dashboard
- **Route**: `/admin`
- **Features**: Overview statistics, total orders, revenue, active promo codes, newsletter subscribers

### Order Management
- **Route**: `/admin/objednavky`
- **Features**: View all orders, filter by status, manage order fulfillment
- **Detail View**: `/admin/objednavky/[id]` - View individual order details, update status, tracking info

### Product Management
- **Route**: `/admin/produkty`
- **Features**: View all products, create/edit/delete products, manage inventory
- **Create Product**: `/admin/produkty/novy` - Add new products
- **Edit Product**: `/admin/produkty/[id]` - Edit existing product details

### Promo Codes
- **Route**: `/admin/promo-kody`
- **Features**: Create and manage discount codes, set validity periods, usage limits

### Newsletter Subscribers
- **Route**: `/admin/newsletter`
- **Features**: View and manage newsletter subscribers

## Security Notes

- All passwords are hashed using bcrypt
- JWT-based session management via NextAuth.js
- Role-based access control (ADMIN vs USER)
- Protected admin routes check user role before granting access
