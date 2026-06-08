// js/home.js
// Home Page catalog and filtering controller.
import { fetchProducts, fetchCategories } from './api.js';

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

  // Filter products
  const filtered = selectedCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === selectedCategory);

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
        <!-- Card Image Link -->
        <a href="product.html?id=${id}" class="relative block aspect-video w-full bg-slate-50 overflow-hidden border-b border-slate-100/60">
          <!-- Discount badge -->
          ${hasDiscount ? `
            <span class="absolute top-3 left-3 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white shadow-xs">
              -${discountPercentage.toFixed(0)}% OFF
            </span>
          ` : ''}
          <img 
            src="${thumbnail || 'assets/placeholder.webp'}"
            alt="${title}"
            loading="lazy"
            onerror="this.onerror=null; this.src='assets/placeholder.webp';"
            class="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
          />
        </a>

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

// Run on page load
init();
