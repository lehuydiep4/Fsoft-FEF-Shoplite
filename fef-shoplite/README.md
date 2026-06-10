# ShopLite — Premium Client-Side E-Commerce

Welcome to **ShopLite**, a responsive, multi-page client-side shopping website built with semantic HTML, native CSS, modern JavaScript (ES Modules), and Fake Store API (integrated via DummyJSON).

## 🚀 Live Demo & Deployment
- **Deployment URL:** [ShopLite Live on GitHub Pages](https://lehuydiep4.github.io/Fsoft-FEF-Shoplite/)

---

## 📦 Project Structure

```
Assignment/
├── package.json            # Node project configuration (Tailwind, devDependencies)
├── package-lock.json       # Dependency lock file
├── tailwind-config/        # Tailwind CSS input styles
│   └── input.css           # Tailwind source entry point
└── fef-shoplite/           # Main Web Application folder
    ├── index.html          # Home Page (Product List Catalog)
    ├── product.html        # Product Details page (Dynamic by query string)
    ├── cart.html           # Shopping Cart page
    ├── register.html       # User Registration & validation page
    ├── css/
    │   └── style.css       # Compiled Tailwind CSS styles
    ├── components/         # Reusable HTML template components
    │   ├── navbar.html
    │   ├── footer.html
    │   ├── sidebar.html    # Categories & sort sidebar layout
    │   ├── searchbar.html  # Autocomplete searchbar markup
    │   ├── product-card.html
    │   ├── product-detail.html
    │   └── toast.html
    ├── js/
    │   ├── api.js          # Fetch layer using async/await, try/catch
    │   ├── components.js   # Global UI renderer & tab sync
    │   ├── search.js       # Debounced autocomplete search
    │   ├── home.js         # Catalog controller
    │   ├── sidebar.js      # <app-sidebar> Web Component logic
    │   ├── pagination.js   # Decoupled sliding pagination
    │   ├── product.js      # Detail viewer & add-to-cart controller
    │   ├── register.js     # Realtime form validator
    │   ├── cart.js         # Cart list controller & event delegation
    │   ├── toast.js        # Global action alerts
    │   └── services/       # Decoupled business rule models
    │       ├── cartService.js  # Cart operations
    │       └── storage.js      # LocalStorage wrapper
    └── README.md           # Project documentation
```

---

## ✨ Features Implemented

- **Custom `<app-sidebar>` Web Component**: Completely decoupled Custom Element (`<app-sidebar>`) housing both the categories wrapped filters and the active toggle sort buttons. It handles its own template loading, category fetching, and URL state sync.
- **Dynamic Autocomplete Search Suggestions**: The search bar contains a debounced input handler (250ms). It queries categories and products lazily and groups them into a suggestions dropdown box.
  - Click a Category suggestion to filter by it immediately.
  - Click a Product suggestion to navigate to the product detail view immediately.
  - Handles focus and click-away to auto-close.
- **Advanced Product Sorting & Toggles**: Interactive, stateful toggle buttons for sorting by **Price** (toggles between *High to Low* `▼` and *Low to High* `▲`) and **Name** (toggles between *A to Z* `▲` and *Z to A* `▼`) housed on top of the sidebar, combined simultaneously with search and category filters.
- **Dynamic & Modern Pagination**: Catalog grid is limited to 9 items per page. The pagination component displays a sliding window (2 pages before and 2 pages after the active page with `...` placeholders) and provides a **Go to** text input field for jumping directly to any page. Includes smooth scroll back to catalog start.
- **Cross-Tab Synchronisation**: Uses standard Window `storage` events to update the cart badge count instantly across all open tabs/pages whenever the cart in localStorage is updated.
- **Robust Event Delegation**: Native click actions for the dynamic product grid and the shopping cart lists are handled by single event listeners on parent elements for optimal memory usage and clean code.
- **Local Storage Cart**: Full cart state management synced across pages (cart detail adjustments, delete rows, subtotal, 8% tax calculation, and totals update immediately).
- **Graceful Loading & Error States**: Includes custom skeletal loading grids and error alerts with manual retry handlers for network stability.
- **Semantic Layout**: Implements semantic layout wrappers (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) to promote SEO and standard document outlines.
- **Dynamic Product Details**: Dynamic routes reading `?id=X` from the URL, fetching detailed specifications, stock status badges (In Stock / Out of Stock / Low Stock), and populating a thumbnail gallery.
- **Client-Side Validation**: Rich validation on focus/blur for Name, Email, Password, Phone Number, select dropdowns, and checkboxes with customized Vietnamese patterns.

---

## 🛠️ How to Run Locally

Since the codebase uses modern **ES Modules** (`import/export`) and fetches HTML components dynamically via the browser's Fetch API, running directly from local filesystem (`file://`) will trigger CORS blocks. You **must** serve it using a local development server.

### Option 1: VS Code Live Server (Recommended)
1. Open the project root folder `fef-shoplite` in VS Code.
2. Click **"Go Live"** in the status bar at the bottom right.
3. Your browser will open the page automatically at `http://127.0.0.1:5500`.

### Option 2: Node.js (Simple HTTP Server)
If you have Node.js installed, run this command in your terminal from the `fef-shoplite` folder:
```bash
npx -y http-server -p 5500
```
Then visit `http://localhost:5500`.
