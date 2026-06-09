// js/home.js
// Home Page catalog and filtering controller.
import { fetchProducts, fetchCategories } from './api.js';
import { updateCartBadges } from './components.js';
import { showToast } from './toast.js';
import { bindTemplateData } from '../utils/dom.js';

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
let cardTemplate = null;

/**
 * Initializes the page.
 */
async function init() {
  showLoading();
  try {
    // Parallel fetching
    const [products, categories, cardHtml] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetch('components/product-card.html').then(res => {
        if (!res.ok) throw new Error("Failed to load product card component");
        return res.text();
      })
    ]);

    allProducts = products;

    // Parse product card template
    const parser = new DOMParser();
    const doc = parser.parseFromString(cardHtml, 'text/html');
    cardTemplate = doc.getElementById('product-card-template');

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
    stars += `<svg-icon src="assets/icons/star.svg" class="w-4 h-4 text-amber-400 fill-current"></svg-icon>`;
  }
  // Half Star
  if (hasHalfStar) {
    stars += `<svg-icon src="assets/icons/star-half.svg" class="w-4 h-4 text-amber-400 fill-current"></svg-icon>`;
  }
  // Empty Stars
  for (let i = 0; i < emptyStars; i++) {
    stars += `<svg-icon src="assets/icons/star.svg" class="w-4 h-4 text-slate-200 fill-current"></svg-icon>`;
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
  productsGrid.innerHTML = '';

  filtered.forEach(product => {
    const { id, title, price, discountPercentage, rating, thumbnail, category } = product;

    // Calc discounted price
    const hasDiscount = discountPercentage && discountPercentage > 0;
    const finalPrice = hasDiscount ? price * (1 - discountPercentage / 100) : price;

    // Format category label
    const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

    // Clone template content
    if (!cardTemplate) return;
    const clone = cardTemplate.content.cloneNode(true);

    bindTemplateData(clone, {
      '.js-card-img-link': { href: `product.html?id=${id}` },
      '.js-card-img': { src: thumbnail || 'assets/placeholder.webp', alt: title },
      '.js-card-discount-badge': hasDiscount
        ? { className: 'js-card-discount-badge absolute top-3 left-3 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white shadow-xs', textContent: `-${discountPercentage.toFixed(0)}% OFF` }
        : { className: 'js-card-discount-badge hidden' },
      '.js-card-category': categoryLabel,
      '.js-card-rating-text': `(${rating.toFixed(1)})`,
      '.js-card-title-link': { href: `product.html?id=${id}`, textContent: title },
      '.js-card-original-price': hasDiscount
        ? { className: 'js-card-original-price text-xs text-slate-400 line-through', textContent: `$${price.toFixed(2)}` }
        : { className: 'js-card-original-price hidden' },
      '.js-card-price': `$${finalPrice.toFixed(2)}`,
      '.js-card-details-btn': { href: `product.html?id=${id}` },
      '.js-card-add-to-cart-btn': { 'data-id': id }
    });

    // Image fallback load error handler
    const img = clone.querySelector('.js-card-img');
    if (img) img.onerror = () => { img.src = 'assets/placeholder.webp'; };

    // Stars HTML injection
    const starsContainer = clone.querySelector('.js-card-stars');
    if (starsContainer) starsContainer.innerHTML = getStarsHtml(rating);

    productsGrid.appendChild(clone);
  });
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
    const btn = e.target.closest('.js-card-add-to-cart-btn');
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
    showToast("Item Added!", `"${product.title}" added to cart.`);
  });
}

// Run on page load
init();
