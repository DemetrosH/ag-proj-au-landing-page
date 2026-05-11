# Location Web App Specifications

This document serves as a reference for the development of the Location division web app.

## Core Requirements
- **Landing Page**: Dedicated landing page with a festive, minimalist, and premium visual style.
- **Custom Header**: Independent header featuring:
  - Logo (Artéfact Urbain)
  - Search bar
  - Rental date selection (Start/End)
  - Account & Cart (Soumission) access
- **Categories**: 
  - 13 Public Expertise categories (filtered from 17 total).
  - Keyword-based mapping from Rentman inventory to expertise areas.
- **Product Integration**:
  - Live fetch from Rentman API (`/equipment`).
  - Secure server-side handling of `RENTMAN_API_TOKEN`.
  - Filtered by `in_shop === true`.
  - Dynamic product detail pages with real-time pricing based on duration.
- **Rental Logic**:
  - `RentalContext` for global date management.
  - `CartContext` for persistent "Soumission" (quote) management.
  - Automatic duration calculation and price estimation.

## Implementation Details
- **Tech Stack**: Next.js (App Router), Tailwind CSS, React Context.
- **Data Mapping**: 
  - Uses keywords (e.g., 'tente', 'slush', 'haut-parleur') to categorize items.
  - **Description Priority**: Long Webshop Description > Short Webshop Description > Internal Description.
  - **Featured Status**: Maps `shop_featured` to `isFeatured`.
  - **Exclusions**: SEO titles and keywords are currently excluded from import.
- **Persistence**: Rental dates and cart items are stored in `localStorage`.

## Current Status
- [x] Rentman API Integration established.
- [x] Product catalog mapped to public categories.
- [x] Landing Page, Category Pages, and Product Pages are live with real data.
- [x] Quote (Soumission) workflow implemented.
- [ ] Finalize real-time availability endpoint parameters.
- [ ] Implement quote submission form (Email/API).

## Design System
- **Palette**: White, Gold (#E7A128), Peach (brand-surface).
- **Typography**: Geist (Sans/Mono).
- **Components**: Rounded corners (`rounded-[2.5rem]`), soft shadows, glassmorphism headers.
