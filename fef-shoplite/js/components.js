// js/components.js
// Shared UI components (Navbar & Footer) for ShopLite.
// Automatically executed on DOMContentLoaded.

/**
 * Gets the current cart item count from localStorage.
 */
function getCartItemCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  } catch (e) {
    return 0;
  }
}

/**
 * Renders the shared Navbar.
 */
function renderNavbar() {
  const container = document.getElementById('navbar-placeholder');
  if (!container) return;

  const activePage = window.location.pathname.split('/').pop() || 'index.html';
  const cartCount = getCartItemCount();

  const isHome = activePage === 'index.html' || activePage === '';
  const isCart = activePage === 'cart.html';
  const isRegister = activePage === 'register.html';

  const navClass = "px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md";
  const activeClass = "text-indigo-600 bg-indigo-50 font-semibold";
  const inactiveClass = "text-slate-600 hover:text-indigo-600 hover:bg-slate-50";

  container.innerHTML = `
    <header class="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <a href="index.html" class="flex items-center gap-2 group">
              <div class="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:bg-indigo-700 transition-colors">S</div>
              <span class="text-xl font-bold tracking-tight text-slate-800">Shop<span class="text-indigo-600">Lite</span></span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex space-x-4 items-center">
            <a href="index.html" class="${navClass} ${isHome ? activeClass : inactiveClass}">Home</a>
            <a href="register.html" class="${navClass} ${isRegister ? activeClass : inactiveClass}">Register</a>
            <a href="cart.html" class="relative ${navClass} ${isCart ? activeClass : inactiveClass} flex items-center gap-1.5">
              <span>Cart</span>
              <span id="cart-badge" class="${cartCount > 0 ? 'flex' : 'hidden'} items-center justify-center h-5 px-1.5 rounded-full text-xs font-bold bg-indigo-600 text-white min-w-5">
                ${cartCount}
              </span>
            </a>
          </nav>

          <!-- Mobile menu button -->
          <div class="flex items-center md:hidden">
            <button id="mobile-menu-btn" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 focus:outline-hidden" aria-controls="mobile-menu" aria-expanded="false">
              <span class="sr-only">Open main menu</span>
              <!-- Icon Closed -->
              <svg id="menu-icon-closed" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <!-- Icon Open -->
              <svg id="menu-icon-open" class="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div id="mobile-menu" class="hidden md:hidden border-b border-slate-200 bg-white">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="index.html" class="block ${navClass} ${isHome ? activeClass : inactiveClass}">Home</a>
          <a href="register.html" class="block ${navClass} ${isRegister ? activeClass : inactiveClass}">Register</a>
          <a href="cart.html" class="block ${navClass} ${isCart ? activeClass : inactiveClass} flex items-center justify-between">
            <span>Cart</span>
            <span id="mobile-cart-badge" class="${cartCount > 0 ? 'inline-flex' : 'hidden'} items-center justify-center h-5 px-1.5 rounded-full text-xs font-bold bg-indigo-600 text-white min-w-5">
              ${cartCount}
            </span>
          </a>
        </div>
      </div>
    </header>
  `;

  // Toggle Menu Event
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const iconClosed = document.getElementById('menu-icon-closed');
  const iconOpen = document.getElementById('menu-icon-open');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !isExpanded);
      menu.classList.toggle('hidden');
      iconClosed.classList.toggle('hidden');
      iconOpen.classList.toggle('hidden');
    });
  }
}

/**
 * Renders the shared Footer.
 */
function renderFooter() {
  const container = document.getElementById('footer-placeholder');
  if (!container) return;

  container.innerHTML = `
    <footer class="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <!-- Col 1: Brand -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg">S</div>
              <span class="text-xl font-bold tracking-tight text-white">Shop<span class="text-indigo-500">Lite</span></span>
            </div>
            <p class="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your lightweight, premium, client-side e-commerce store. Powered by modern web technologies and vanilla JavaScript.
            </p>
            <div class="flex gap-4 pt-2">
              <!-- Mock Social Icons -->
              <a href="#" class="text-slate-500 hover:text-white transition-colors" aria-label="Facebook">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="#" class="text-slate-500 hover:text-white transition-colors" aria-label="Twitter">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" class="text-slate-500 hover:text-white transition-colors" aria-label="GitHub">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              </a>
            </div>
          </div>

          <!-- Col 2: Navigation -->
          <div>
            <h3 class="text-sm font-semibold text-white tracking-wider uppercase mb-4">Quick Links</h3>
            <ul class="space-y-2.5 text-sm">
              <li><a href="index.html" class="hover:text-white transition-colors">Home</a></li>
              <li><a href="register.html" class="hover:text-white transition-colors">Register / Contact</a></li>
              <li><a href="cart.html" class="hover:text-white transition-colors">Shopping Cart</a></li>
            </ul>
          </div>

          <!-- Col 3: Details -->
          <div>
            <h3 class="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact Info</h3>
            <ul class="space-y-2.5 text-sm">
              <li class="flex items-center gap-2">
                <svg class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>FPT Software, Hanoi, Vietnam</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span>support@shoplite.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-slate-800 text-xs text-center text-slate-500 flex flex-col sm:flex-row sm:justify-between gap-4">
          <p>&copy; 2026 ShopLite Inc. All rights reserved.</p>
          <div class="flex justify-center gap-6">
            <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Public method to refresh the cart badge count from outside.
 * Used when items are added to cart.
 */
export function updateCartBadges() {
  const cartCount = getCartItemCount();
  const badge = document.getElementById('cart-badge');
  const mobileBadge = document.getElementById('mobile-cart-badge');

  if (badge) {
    badge.textContent = cartCount;
    if (cartCount > 0) {
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    } else {
      badge.classList.remove('flex');
      badge.classList.add('hidden');
    }
  }

  if (mobileBadge) {
    mobileBadge.textContent = cartCount;
    if (cartCount > 0) {
      mobileBadge.classList.remove('hidden');
      mobileBadge.classList.add('inline-flex');
    } else {
      mobileBadge.classList.remove('inline-flex');
      mobileBadge.classList.add('hidden');
    }
  }
}

// Automatically render placeholders on load
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
});
