# VyaparDesk — Inventory & Billing Management System

VyaparDesk is a complete, production-grade Inventory & Billing Management application built for small local businesses, retailers, wholesalers, and vendors in India.

## Key Features

- 📊 **Executive Dashboard**: Real-time sales summary, daily bill count, low stock warnings, outstanding customer credit (Udhar), and Recharts revenue trend graph.
- ⚡ **POS Billing Interface**: Built for fast billing with barcode scanner support, live product search, cart management, GST tax calculations, discounts, payment modes (Cash, UPI, Card, Udhar), and cash change calculation.
- 🧾 **Printable Tax Invoices**: Automated invoice number generation (`INV-YYYY-XXXXXX`) with thermal and A4 print options including GSTIN and business header/footer.
- 📦 **Inventory & Stock Management**: Real-time stock levels, low-stock threshold alerts, manual stock adjustments with audit reasons, and complete transaction history logs (Stock In / Stock Out).
- 🏷️ **Products & Categories**: Product catalog with SKU, barcode, category organization, cost price, selling price, GST tax slabs (0%, 5%, 12%, 18%, 28%), and stock units.
- 👥 **Customer Udhar Ledger**: Track customer purchase history, outstanding credit balances, and record partial/full credit payments (Jama) with payment receipts.
- 🚚 **Supplier & Purchase Orders**: Supplier directory, purchase order creation with automatic stock restocking upon order receipt.
- 📈 **Business Intelligence Reports**: Sales report, gross profit estimate (`Selling Price - Cost Price`), inventory valuation, top-selling items, and credit ledger reports.
- ⚙️ **Shop Settings**: Configure legal shop name, address, GSTIN, phone, invoice prefix, and invoice footer notes.
- 🔐 **Role-Based Authorization**: Role enforcement distinguishing Admin (full access, cost price visibility, stock adjustment, reports) vs. Cashier (POS billing, sales history, customer lookup).

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS & Lucide React
- **Charts**: Recharts
- **Form Validation**: Zod

---

## Getting Started

### 1. Prerequisites

Ensure you have Node.js 18+ and npm installed.

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@ep-sample-123456.us-east-2.aws.neon.tech/vyapardesk?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-in"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup & Seeding

```bash
# Push Prisma schema to your Neon PostgreSQL database
npm run db:push

# Seed initial categories, suppliers, products, customers, purchases, and sales
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Commands

- `npm run db:push` — Push schema updates to database
- `npm run db:seed` — Run seed script (`prisma/seed.ts`)
- `npm run db:studio` — Open Prisma Studio GUI
