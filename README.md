# 🥛 Neyyar Dairy System

A mobile-first Progressive Web App (PWA) for managing dairy inventory, sales, and logistics.

Built with **Next.js 14**, **Supabase**, and **TanStack Query**.

---

## 🎯 Project Overview

**Target Users:**
- **Salesmen** (Mobile users with low internet connectivity)
- **Admins** (Desktop users for reporting and logistics)

**Core Flow:**
```
Factory → Main Store (GVM) → Branch (VEN) → Salesman → Customer
```

---

## 🎨 Brand Identity

| Element | Value |
|---------|-------|
| **Primary Color (Violet)** | `#3E2758` |
| **Accent Color (Yellow)** | `#FACC15` |
| **Background** | `#F3F4F6` |
| **Surface** | `#FFFFFF` |
| **Font** | Inter / Sans-serif |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database:** Supabase (PostgreSQL)
- **State Management:** TanStack Query (React Query)
- **Styling:** Tailwind CSS (Mobile-first)
- **Icons:** Lucide React
- **PWA:** next-pwa (Webpack-based)

---

## 📱 Key Features

### Salesman Interface (Mobile)
- **POS (Point of Sale):** Touch-optimized product selection with quantity steppers
- **Offline Support:** Cached shop list and debt tracking
- **Route Management:** View assigned shops in route order
- **Cash Collection:** Record payments and update shop balances
- **Expense Tracking:** Log fuel and other expenses
- **Damage Reporting:** Report broken/leaked items

### Admin Portal (Desktop)
- **Stock Receiving:** Process daily factory arrivals with GVM/VEN split
- **Trip Planning:** Assign salesmen to routes with vehicle tracking
- **Inventory Dashboard:** Real-time stock levels across warehouses
- **Analytics:** Daily reports, P&L, debtor lists with Excel export
- **User Management:** Create and manage salesman accounts

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+ 
npm / yarn / pnpm
Supabase account
```

### Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Installation
```bash
npm install
# or
yarn install
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

---

## 📐 Project Structure

```
neyyar-app/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout with providers
│   │   ├── login/            # Authentication
│   │   ├── pos/              # Point of Sale (Salesman)
│   │   ├── route/            # Shop list
│   │   └── admin/            # Admin portal
│   ├── components/
│   │   ├── ui/               # Reusable UI primitives
│   │   └── ToastContext.tsx  # Toast notification system
│   ├── lib/
│   │   ├── supaClient.ts     # Supabase client
│   │   └── utils.ts          # Utility functions
│   └── providers/
│       ├── QueryProvider.tsx # TanStack Query setup
│       └── SupabaseProvider.tsx # Auth state management
├── public/
│   ├── manifest.json         # PWA manifest
│   └── favicon.png           # Logo asset
└── tailwind.config.ts
```

---

## 🗄️ Database Schema (Supabase)

### Core Tables
- `storehouses` - GVM (ID: 1) and VEN (ID: 2)
- `products` - Product catalog with pricing
- `shops` - Customer shops with debt tracking
- `inventory` - Stock levels per warehouse
- `sales` - Transaction records
- `sale_items` - Line items for each sale
- `trips` - Daily route assignments
- `expenses` - Salesman expense logs
- `damage_logs` - Broken/leaked item tracking

### Key RPC Functions
- `process_sale_transaction()` - Handles sale with inventory deduction
- `process_daily_arrival()` - Logs factory stock and splits to warehouses
- `collect_payment()` - Updates shop balance
- `report_damage()` - Records damaged items
- `get_daily_report()` - Time-machine analytics

---

## 📱 PWA Configuration

### Meta Tags (in `app/layout.tsx`)
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#3E2758">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Manifest Settings
```json
{
  "display": "standalone",
  "background_color": "#3E2758",
  "theme_color": "#3E2758"
}
```

---

## 🎯 Design Principles

### Mobile-First (Salesman View)
- **Layout:** Single column, stacked cards
- **Navigation:** Bottom tab bar (fixed)
- **Touch Targets:** Minimum 44px height
- **Minimalism:** Hide secondary info behind "Details" clicks

### Desktop (Admin View)
- **Layout:** Sidebar + Data Grid
- **Density:** Higher information density with generous whitespace
- **Responsiveness:** Tailwind breakpoints (md:, lg:)

### Clean UI Guidelines
- Use **Skeletons** for loading states (no spinners)
- Use **Toast notifications** for feedback (no alerts)
- Icons with labels only when necessary
- Generous padding on touch targets

---

## ✅ Deployment Checklist

### 1. Database
- [ ] Run `neyyar_golden_master.sql` in Supabase
- [ ] Verify Storehouses (ID: 1=GVM, 2=VEN)
- [ ] Create admin user with `role='admin'`

### 2. PWA Setup
- [ ] Configure `manifest.json` with standalone display
- [ ] Add apple-mobile-web-app meta tags
- [ ] Generate 192x192 and 512x512 icons

### 3. Frontend Logic
- [ ] Implement POS stock validation (qty ≤ inventory)
- [ ] Configure React Query cache for offline support
- [ ] Restrict number inputs to positive integers

### 4. Operations Test
- [ ] Morning: Admin receives 100 items
- [ ] Sales: Salesman sells 10 items
- [ ] Damage: Report 1 damaged item
- [ ] Verify: Dashboard shows 89 remaining
- [ ] Cash: Reconciliation matches physical money

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 📄 License

Proprietary - Neyyar Dairy System © 2024
