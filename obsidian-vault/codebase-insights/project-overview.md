# Phase One Visuals — Project Overview

## Summary
Single-page real estate & construction media website for Phase One Visuals, based in Hopewell, NJ. Serves the NJ and PA market with photography, video, and 3D tour services.

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS (no framework)
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Fonts**: Google Fonts (Montserrat, Playfair Display, DM Sans, Barlow)
- **Admin**: Separate admin panel at `/admin/index.html` with auth

## File Structure

### HTML
- `index.html` — Main landing page (678 lines, single file)

### CSS (12 files in `assets/css/`)
- `global.css` — CSS variables, typography, base styles
- `navbar.css` — Sticky nav with responsive mobile menu
- `hero.css` — Hero section with animated SVG buttons
- `process-section.css` — 4-step process flow with connectors
- `sectors.css` — Real Estate + Construction dual panels
- `pricing.css` — Tab-based pricing with cards and table
- `coverage.css` — Coverage area with embedded Google Maps
- `our-story.css` — Story/CTA section
- `contact.css` — Contact form + info cards
- `footer.css` — Footer with links
- `loader.css` — Preloader animation
- `admin.css` — Admin panel styling

### JavaScript (6 files in `assets/js/`)
- `firebase-config.js` — Firebase initialization
- `main.js` — Theme toggle, navbar, booking modal, scroll, form submission
- `content-manager.js` — Fetches site content and pricing from Firestore
- `admin-auth.js` — Admin login/logout
- `admin.js` — Admin panel logic (leads, content editor, pricing manager)
- `seed-data.js` — Seed/default data for Firestore

### Design System
- Dark/Light theme support via `data-theme` attribute
- Custom SVG icons in buttons (camera, house, construction crane, etc.)
- CSS variables for consistent theming
- BEM-like class naming
- Mobile-responsive with hamburger menu

## Key Features
1. Booking modal with Real Estate (HD Photo Hub) and Construction (contact form) options
2. Dynamic pricing tables with 3 tabs (Residential, STR, Construction)
3. Content managed via Firebase Firestore (CMS-like via admin panel)
4. Contact form submissions to Firestore
5. Smooth scroll navigation
6. Intersection Observer animations
7. Scroll-to-top button
