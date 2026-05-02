# GoldGem ERP

Cloud-based Enterprise Resource Planning system for the jewellery industry, built with Next.js 16, TypeScript, Prisma ORM, and Tailwind CSS.

## Features

### 7 Integrated Modules
- **Dashboard Analytics** — Real-time KPIs, revenue charts, top products, activity feed
- **Inventory & Vault** — Multi-warehouse tracking, low stock alerts, stock movement audit
- **Supply Chain** — Supplier profiles, purchase order processing, shipment kanban board
- **Manufacturing** — Work order management, Bill of Materials (BOM) cards
- **Point of Sale (POS)** — Product grid, cart management, checkout with Cash/Card/Digital payment
- **E-Commerce** — Order management, KPI tracking
- **AI Insights** — Demand forecasting, inventory optimization, anomaly detection

### Design & UX
- Amber/gold jewellery-themed design throughout
- Fully responsive — works on mobile, tablet, and desktop
- Bottom navigation on mobile with "More" menu for all modules
- Safe area support for notched devices (iPhone X+)
- Touch-optimized inputs (no iOS auto-zoom on focus)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | SQLite (dev) / PostgreSQL (production via Neon) |
| ORM | Prisma 6.11 |
| State | Zustand + TanStack React Query |
| Charts | Recharts |
| Deployment | Vercel + Neon PostgreSQL |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/meghnathdutta-gif/goldgem-erp.git
cd goldgem-erp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Set up database
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/              # 17 API routes
│   │   ├── ai/forecast/  # AI demand forecasting
│   │   ├── bom/          # Bill of Materials
│   │   ├── categories/   # Product categories
│   │   ├── customers/    # Customer management
│   │   ├── dashboard/    # Dashboard KPIs
│   │   ├── ecommerce/    # E-commerce orders
│   │   ├── inventory/    # Stock tracking
│   │   ├── pos/          # Point of sale
│   │   ├── products/     # Product catalog
│   │   ├── purchase-orders/
│   │   ├── sales-orders/
│   │   ├── shipments/
│   │   ├── suppliers/
│   │   ├── warehouses/
│   │   └── work-orders/
│   ├── globals.css       # Tailwind + amber/gold theme
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Main SPA with sidebar navigation
├── components/
│   ├── modules/          # 7 feature modules
│   ├── ui/               # shadcn/ui components
│   └── providers.tsx     # React Query + Zustand providers
├── lib/
│   ├── db.ts             # Prisma client singleton
│   └── utils.ts          # Utility functions
└── store/
    └── erp-store.ts      # Zustand state management
```

## Database Models

18 Prisma models including: Product, Category, Warehouse, InventoryItem, Supplier, PurchaseOrder, SalesOrder, Customer, WorkOrder, BOM, Shipment, ECommerceOrder, POSOrder, and more.

## Cloud Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions to deploy on:
- **Vercel** (hosting) + **Neon** (PostgreSQL database) — Free tier available

## License

MIT
