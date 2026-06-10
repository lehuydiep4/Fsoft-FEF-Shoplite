// js/home.js
// Home Page catalog and filtering controller.
import { fetchProducts } from './api.js';
import { updateCartBadges } from './components.js';
import { showToast } from './toast.js';
import { bindTemplateData } from '../utils/dom.js';
import { addToCart, getProductPriceInfo } from './services/cartService.js';
import { renderPagination } from './pagination.js';
import './sidebar.js';

// Elements
const productsGrid = document.getElementById('products-grid');
const loadingSkeleton = document.getElementById('loading-skeleton');
const errorAlert = document.getElementById('error-alert');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const emptyState = document.getElementById('empty-state');

// State
let allProducts = [];
let selectedCategory = 'all';
let searchQuery = '';
let sortOption = 'default';
let currentPage = 1;
const ITEMS_PER_PAGE = 9;
let cardTemplate = null;

/**
 * Initializes the page.
 */
async function init() {
  showLoading();
  try {
    // Parallel fetching of products and product card HTML
    const [products, cardHtml] = await Promise.all([
      fetchProducts(),
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

    // Read initial filters from URL params (e.g. for deep linking or redirects)
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      searchQuery = searchParam;
    }
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      selectedCategory = categoryParam.toLowerCase();
    }

    // Wait for the app-sidebar Web Component to register and render
    await customElements.whenDefined('app-sidebar');
    const sidebar = document.querySelector('app-sidebar');
    if (sidebar) {
      // Initialize state from sidebar component (which reads from URL parameters itself)
      selectedCategory = sidebar.selectedCategory;
      sortOption = sidebar.sortOption;

      // Listen to filter/sort changes from sidebar component
      sidebar.addEventListener('filter-change', (e) => {
        selectedCategory = e.detail.category;
        sortOption = e.detail.sort;
        currentPage = 1;
        renderProducts();
      });
    }

    renderProducts();

  } catch (error) {
    showError(error.message || 'Check your internet connection and try again.');
  }
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
 * Renders the products based on category filters, search, sorting, and pagination.
 */
function renderProducts() {
  if (!productsGrid) return;

  // 1. Filter products by category
  let filtered = selectedCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === selectedCategory);

  // 2. Filter products by search query
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  // 3. Sort products
  if (sortOption === 'price-asc') {
    filtered.sort((a, b) => {
      const priceA = getProductPriceInfo(a).finalPrice;
      const priceB = getProductPriceInfo(b).finalPrice;
      return priceA - priceB;
    });
  } else if (sortOption === 'price-desc') {
    filtered.sort((a, b) => {
      const priceA = getProductPriceInfo(a).finalPrice;
      const priceB = getProductPriceInfo(b).finalPrice;
      return priceB - priceA;
    });
  } else if (sortOption === 'name-asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === 'name-desc') {
    filtered.sort((a, b) => b.title.localeCompare(a.title));
  }

  hideLoading();

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    productsGrid.innerHTML = '';
    renderPagination(0);
    return;
  }
  emptyState.classList.add('hidden');
  productsGrid.innerHTML = '';

  // 4. Paginate products
  const totalFilteredCount = filtered.length;
  const totalPages = Math.ceil(totalFilteredCount / ITEMS_PER_PAGE);
  if (currentPage > totalPages) {
    currentPage = Math.max(1, totalPages);
  }
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  paginatedItems.forEach(product => {
    const { id, title, price, discountPercentage, rating, thumbnail, category } = product;

    // Calc discounted price
    const { hasDiscount, finalPrice } = getProductPriceInfo(product);

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

  // Render pagination buttons using decoupled component
  renderPagination({
    containerId: 'pagination-container',
    totalItems: totalFilteredCount,
    itemsPerPage: ITEMS_PER_PAGE,
    currentPage: currentPage,
    onPageChange: (newPage) => {
      currentPage = newPage;
      renderProducts();
      
      // Scroll smoothly to catalog start
      const catalogEl = document.getElementById('products-list');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}

// Loading handlers
function showLoading() {
  loadingSkeleton.classList.remove('hidden');
  productsGrid.classList.add('hidden');
  errorAlert.classList.add('hidden');
  emptyState.classList.add('hidden');
}

// Hide skeleton and reveal products grid
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
  currentPage = 1;
  renderProducts();
});

// Listen to custom category-select event from header search bar dropdown suggestions
window.addEventListener('category-select', (e) => {
  selectedCategory = e.detail.category;
  currentPage = 1;
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

    addToCart(product, 1);
    updateCartBadges();
    showToast("Item Added!", `"${product.title}" added to cart.`);
  });
}

// Run on page load
init();
