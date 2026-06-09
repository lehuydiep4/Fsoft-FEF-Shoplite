// js/home.js
// Home Page catalog and filtering controller.
import { fetchProducts, fetchCategories } from './api.js';
import { updateCartBadges } from './components.js';

// Elements
const productsGrid = document.getElementById('products-grid');
const categoryContainer = document.getElementById('category-filter-container');
const loadingSkeleton = document.getElementById('loading-skeleton');
const errorAlert = document.getElementById('error-alert');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const emptyState = document.getElementById('empty-state');

// State
let allProducts = [];
let selectedCategory = 'all';
let searchQuery = '';

/**
 * Initializes the page.
 */
async function init() {
  showLoading();
  try {
    // Parallel fetching
    const [products, categories] = await Promise.all([
      fetchProducts(),
      fetchCategories()
    ]);

    allProducts = products;

    // Read search query from URL params if present
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      searchQuery = searchParam;
    }
    
    renderCategories(categories);
    renderProducts();
  } catch (error) {
    showError(error.message || 'Check your internet connection and try again.');
  }
}

/**
 * Renders the category filter pill buttons dynamically.
 */
function renderCategories(categories) {
  if (!categoryContainer) return;

  // Build the list of categories adding "All"
  const items = ['all', ...categories];

  categoryContainer.innerHTML = items.map(cat => {
    const isSelected = selectedCategory === cat;
    const activeClasses = "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-500/20";
    const inactiveClasses = "bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-100 hover:bg-indigo-50/20";
    
    // Capitalize label
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);

    return `
      <button 
        data-category="${cat}"
        class="px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer whitespace-nowrap ${isSelected ? activeClasses : inactiveClasses}"
      >
        ${label}
      </button>
    `;
  }).join('');

  // Add click listeners to filter pills
  categoryContainer.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedCategory = e.currentTarget.getAttribute('data-category');
      
      // Update pills appearance
      categoryContainer.querySelectorAll('button').forEach(b => {
        b.className = b.className.replace(/bg-indigo-600|text-white|font-semibold|shadow-sm|shadow-indigo-500\/20/g, '').trim();
        b.className += " bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-100 hover:bg-indigo-50/20";
        if (b.getAttribute('data-category') === selectedCategory) {
          b.className = b.className.replace(/bg-white|text-slate-600|hover:text-indigo-600|border|border-slate-200|hover:border-indigo-100|hover:bg-indigo-50\/20/g, '').trim();
          b.className += " bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-500/20";
        }
      });

      renderProducts();
    });
  });
}

/**
 * Helper function to generate dynamic star rating HTML.
 */
function getStarsHtml(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '';
  // Full Stars
  for (let i = 0; i < fullStars; i++) {
    stars += `<svg class="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
  }
  // Half Star
  if (hasHalfStar) {
    stars += `<svg class="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="#E2E8F0"/></linearGradient></defs><path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
  }
  // Empty Stars
  for (let i = 0; i < emptyStars; i++) {
    stars += `<svg class="w-4 h-4 text-slate-200 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
  }
  return stars;
}

/**
 * Renders the products based on category filters.
 */
function renderProducts() {
  if (!productsGrid) return;

  // Filter products by category
  let filtered = selectedCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === selectedCategory);

  // Filter products by search query
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  hideLoading();

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    productsGrid.innerHTML = '';
    return;
  }
  emptyState.classList.add('hidden');

  productsGrid.innerHTML = filtered.map(product => {
    const { id, title, price, discountPercentage, rating, thumbnail, category } = product;

    // Calc discounted price
    const hasDiscount = discountPercentage && discountPercentage > 0;
    const finalPrice = hasDiscount ? price * (1 - discountPercentage / 100) : price;

    // Format category label
    const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

    return `
      <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
        <!-- Card Image & Add to Cart Container -->
        <div class="relative aspect-video w-full bg-slate-50 overflow-hidden border-b border-slate-100/60 group">
          <!-- Image Link -->
          <a href="product.html?id=${id}" class="block w-full h-full">
            <img 
              src="${thumbnail || 'assets/placeholder.webp'}"
              alt="${title}"
              loading="lazy"
              onerror="this.onerror=null; this.src='assets/placeholder.webp';"
              class="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
            />
          </a>

          <!-- Discount badge -->
          ${hasDiscount ? `
            <span class="absolute top-3 left-3 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white shadow-xs">
              -${discountPercentage.toFixed(0)}% OFF
            </span>
          ` : ''}

          <!-- Hover Add to Cart Button Overlay -->
          <div class="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] pointer-events-none">
            <button 
              data-id="${id}"
              class="add-to-cart-btn-home pointer-events-auto px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 duration-300"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Add to Cart
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-5 flex-grow flex flex-col justify-between">
          <div class="space-y-2">
            <!-- Category & Rating -->
            <div class="flex items-center justify-between text-xs">
              <span class="text-indigo-600 font-semibold uppercase tracking-wider">${categoryLabel}</span>
              <div class="flex items-center gap-1">
                <span class="text-slate-400">(${rating.toFixed(1)})</span>
                <div class="flex">${getStarsHtml(rating)}</div>
              </div>
            </div>

            <!-- Title -->
            <h3 class="text-base font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              <a href="product.html?id=${id}">${title}</a>
            </h3>
          </div>

          <!-- Price & Actions -->
          <div class="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
            <div class="flex flex-col">
              ${hasDiscount ? `
                <span class="text-xs text-slate-400 line-through">$${price.toFixed(2)}</span>
                <span class="text-lg font-black text-slate-800 font-outfit">$${finalPrice.toFixed(2)}</span>
              ` : `
                <span class="text-lg font-black text-slate-800 font-outfit">$${price.toFixed(2)}</span>
              `}
            </div>
            
            <a 
              href="product.html?id=${id}" 
              class="px-4 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Details
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Loading handlers
function showLoading() {
  loadingSkeleton.classList.remove('hidden');
  productsGrid.classList.add('hidden');
  errorAlert.classList.add('hidden');
  emptyState.classList.add('hidden');
}

function hideLoading() {
  loadingSkeleton.classList.add('hidden');
  productsGrid.classList.remove('hidden');
}

function showError(msg) {
  loadingSkeleton.classList.add('hidden');
  productsGrid.classList.add('hidden');
  errorAlert.classList.remove('hidden');
  errorMessage.textContent = msg;
}

// Retry Button handler
if (retryBtn) {
  retryBtn.addEventListener('click', init);
}

// Listen to custom search event from header search bar
window.addEventListener('product-search', (e) => {
  searchQuery = e.detail.query;
  renderProducts();
});

// Event delegation for the product grid (Add to Cart clicks)
if (productsGrid) {
  productsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn-home');
    if (!btn) return;

    e.preventDefault();
    const productId = parseInt(btn.getAttribute('data-id'), 10);
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Retrieve and update cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + 1, product.stock || 99);
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        discountPercentage: product.discountPercentage || 0,
        thumbnail: product.thumbnail || (product.images && product.images[0]) || 'assets/placeholder.webp',
        quantity: 1,
        stock: product.stock
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadges();
    showToast(product.title);
  });
}

/**
 * Renders a premium dynamic toast notification on the screen.
 */
function showToast(title) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl shadow-lg transition-all duration-300 transform translate-y-10 opacity-0 max-w-sm pointer-events-auto';
  toast.innerHTML = `
    <svg class="h-5 w-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div class="text-xs">
      <p class="font-bold">Item Added!</p>
      <p class="text-emerald-600 mt-0.5">"${title}" added to cart.</p>
    </div>
  `;

  container.appendChild(toast);

  // Trigger animation next tick
  setTimeout(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Run on page load
init();
