// js/components.js
// Shared UI components (Navbar & Footer) for ShopLite.
// Automatically executed on DOMContentLoaded.

import { initSearchFeature } from './search.js';
import { getCartCount } from './services/cartService.js';


/**
 * Asynchronously fetches an HTML component file and injects it into a placeholder DOM element.
 * @param {string} placeholderId The ID of the container element.
 * @param {string} filePath Relative path to the component's HTML file.
 */
async function loadComponent(placeholderId, filePath) {
  const container = document.getElementById(placeholderId);
  if (!container) return false;

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch component: ${filePath} (Status: ${response.status})`);
    }
    const html = await response.text();
    container.innerHTML = html;
    return true;
  } catch (error) {
    console.error("Error loading component:", error);
    return false;
  }
}

/**
 * Asynchronously fetches searchbar.html and inserts it into desktop and mobile placeholder elements.
 */
async function loadSearchbar() {
  const desktopPlaceholder = document.getElementById('searchbar-desktop-placeholder');
  const mobilePlaceholder = document.getElementById('searchbar-mobile-placeholder');
  if (!desktopPlaceholder && !mobilePlaceholder) return;

  try {
    const response = await fetch('components/searchbar.html');
    if (!response.ok) {
      throw new Error(`Failed to fetch searchbar.html (Status: ${response.status})`);
    }
    const html = await response.text();
    if (desktopPlaceholder) {
      desktopPlaceholder.innerHTML = html;
    }
    if (mobilePlaceholder) {
      mobilePlaceholder.innerHTML = html;
    }
  } catch (error) {
    console.error("Error loading searchbar:", error);
  }
}

/**
 * Evaluates the current page, styles navbar links dynamically, and binds responsive drawer events.
 */
function initNavbarLogic() {
  const activePage = window.location.pathname.split('/').pop() || 'index.html';

  const isHome = activePage === 'index.html' || activePage === '';
  const isCart = activePage === 'cart.html';
  const isRegister = activePage === 'register.html';

  const activeClasses = ["text-indigo-600", "bg-indigo-50", "font-semibold"];
  const inactiveClasses = ["text-slate-600", "hover:text-indigo-600", "hover:bg-slate-50"];

  const applyStyles = (elementId, isActive) => {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (isActive) {
      inactiveClasses.forEach(cls => el.classList.remove(cls));
      activeClasses.forEach(cls => el.classList.add(cls));
    } else {
      activeClasses.forEach(cls => el.classList.remove(cls));
      inactiveClasses.forEach(cls => el.classList.add(cls));
    }
  };

  // Apply to Desktop Navigation Links
  applyStyles('nav-home', isHome);
  applyStyles('nav-cart', isCart);
  applyStyles('nav-register', isRegister);

  // Apply to Mobile Navigation Links
  applyStyles('nav-mobile-home', isHome);
  applyStyles('nav-mobile-cart', isCart);
  applyStyles('nav-mobile-register', isRegister);

  // Bind responsive mobile menu drawer events
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const iconClosed = document.getElementById('menu-icon-closed');
  const iconOpen = document.getElementById('menu-icon-open');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !isExpanded);
      menu.classList.toggle('hidden');
      if (iconClosed) iconClosed.classList.toggle('hidden');
      if (iconOpen) iconOpen.classList.toggle('hidden');
    });
  }

  // Initial call to set cart badges
  updateCartBadges();
}

/**
 * Public method to refresh the cart badge count from outside.
 * Safely calculates totals and toggles badge visibility.
 */
export function updateCartBadges() {
  const cartCount = getCartCount();
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

// Orchestrator initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Fetch and load navbar.html and footer.html
  const loadedNavbar = await loadComponent('navbar-placeholder', 'components/navbar.html');
  await loadComponent('footer-placeholder', 'components/footer.html');

  // 2. Once the navbar is successfully injected, fetch and nest searchbar.html
  if (loadedNavbar) {
    await loadSearchbar();
    
    // 3. Execute navbar styling and toggle logic
    initNavbarLogic();
    
    // 4. Trigger the search functionality logic
    initSearchFeature();
  }
});

// Custom Web Component to dynamically load and inline SVG files
const svgCache = new Map();

class SvgIcon extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute('src');
    if (!src) return;
    try {
      let svgText = svgCache.get(src);
      if (!svgText) {
        const response = await fetch(src);
        if (response.ok) {
          svgText = await response.text();
          svgCache.set(src, svgText);
        } else {
          console.error(`Failed to load SVG icon: ${src} (Status: ${response.status})`);
          return;
        }
      }
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      if (svgElement) {
        // Copy all attributes from <svg-icon> to the new <svg>
        for (const attr of this.attributes) {
          if (attr.name !== 'src') {
            if (attr.name === 'class') {
              const existingClass = svgElement.getAttribute('class') || '';
              svgElement.setAttribute('class', (existingClass + ' ' + attr.value).trim());
            } else {
              svgElement.setAttribute(attr.name, attr.value);
            }
          }
        }
        this.replaceWith(svgElement);
      }
    } catch (e) {
      console.error('Error parsing/replacing SVG:', src, e);
    }
  }
}

if (!customElements.get('svg-icon')) {
  customElements.define('svg-icon', SvgIcon);
}

