// js/product.js
// Product Details rendering and interactive page controller.
import { fetchProductById } from './api.js';
import { updateCartBadges } from './components.js';

// Elements
const detailPageContainer = document.getElementById('detail-page-container');
const detailLoading = document.getElementById('detail-loading');
const detailError = document.getElementById('detail-error');
const detailErrorMessage = document.getElementById('detail-error-message');
const productDetail = document.getElementById('product-detail');

// State
let currentProduct = null;
let currentQuantity = 1;

/**
 * Initializes the page, parses URL ID, and fetches data.
 */
async function init() {
  showLoading();
  
  // Parse ID from URL query (?id=x)
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    showError("No product identifier provided in the URL.");
    return;
  }

  try {
    const product = await fetchProductById(productId);
    currentProduct = product;
    renderProductDetails();
  } catch (error) {
    showError(error.message || `Failed to fetch details for Product ID: ${productId}`);
  }
}

/**
 * Helper to generate rating stars.
 */
function getStarsHtml(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += `<svg class="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
  }
  if (hasHalfStar) {
    stars += `<svg class="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><defs><linearGradient id="half-detail"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="#E2E8F0"/></linearGradient></defs><path fill="url(#half-detail)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += `<svg class="w-4 h-4 text-slate-200 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
  }
  return stars;
}

/**
 * Builds the page markup and binds events.
 */
function renderProductDetails() {
  if (!productDetail) return;
  hideLoading();

  const {
    id,
    title,
    description,
    category,
    price,
    discountPercentage,
    rating,
    stock,
    brand,
    sku,
    weight,
    dimensions,
    warrantyInformation,
    shippingInformation,
    returnPolicy,
    images,
    thumbnail
  } = currentProduct;

  const hasDiscount = discountPercentage && discountPercentage > 0;
  const finalPrice = hasDiscount ? price * (1 - discountPercentage / 100) : price;
  const savings = hasDiscount ? price - finalPrice : 0;
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  // Set page document title dynamically
  document.title = `${title} — ShopLite`;

  // Image Gallery Builder
  const hasMultipleImages = images && images.length > 1;
  const mainImage = images && images.length > 0 ? images[0] : 'assets/placeholder.webp';

  const thumbnailsHtml = hasMultipleImages ? `
    <div class="flex gap-3 mt-4 overflow-x-auto pb-1 max-w-full scrollbar-none">
      ${images.map((img, index) => `
        <button 
          class="thumbnail-btn w-18 h-18 sm:w-20 sm:h-20 border-2 ${index === 0 ? 'border-indigo-600' : 'border-slate-100 hover:border-slate-300'} bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer transition-colors"
          data-image-src="${img}"
        >
          <img src="${img}" alt="Thumbnail ${index + 1}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/placeholder.webp';">
        </button>
      `).join('')}
    </div>
  ` : '';

  // Stock Badge Builder
  let stockBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
  let stockLabel = "In Stock";
  if (stock === 0) {
    stockBadgeClass = "bg-rose-50 text-rose-700 border-rose-100";
    stockLabel = "Out of Stock";
  } else if (stock <= 10) {
    stockBadgeClass = "bg-amber-50 text-amber-700 border-amber-100";
    stockLabel = `Low Stock (${stock} left)`;
  }

  productDetail.innerHTML = `
    <!-- Left Column: Gallery -->
    <div class="space-y-4">
      <div class="relative bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
        <!-- Discount banner badge -->
        ${hasDiscount ? `
          <span class="absolute top-4 left-4 z-10 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500 text-white shadow-xs">
            -${discountPercentage.toFixed(0)}% OFF
          </span>
        ` : ''}
        <img 
          id="main-product-image" 
          src="${mainImage}" 
          alt="${title}"
          onerror="this.onerror=null; this.src='assets/placeholder.webp';"
          class="object-cover w-full h-full max-h-[500px]"
        />
      </div>
      ${thumbnailsHtml}
    </div>

    <!-- Right Column: Details Info -->
    <div class="flex flex-col justify-between space-y-6">
      <div class="space-y-4">
        <!-- Brand & Category -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest">${categoryLabel}</span>
            <span class="text-slate-300 text-sm">•</span>
            <span class="text-sm font-semibold text-slate-500">${brand || 'Generic'}</span>
          </div>
          <!-- Stock status -->
          <span class="px-3 py-1 rounded-full text-xs font-semibold border ${stockBadgeClass}">
            ${stockLabel}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 leading-tight">
          ${title}
        </h1>

        <!-- Rating & Reviews count -->
        <div class="flex items-center gap-2.5">
          <div class="flex items-center bg-amber-50 px-2 py-1 rounded-md">
            <span class="text-xs font-bold text-amber-700">${rating.toFixed(1)}</span>
            <svg class="w-3.5 h-3.5 text-amber-400 fill-current ml-1" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          </div>
          <div class="flex">${getStarsHtml(rating)}</div>
          <span class="text-slate-300">|</span>
          <span class="text-xs text-slate-500 hover:underline cursor-pointer">
            ${currentProduct.reviews ? currentProduct.reviews.length : 0} verified reviews
          </span>
        </div>

        <!-- Pricing layout -->
        <div class="flex items-baseline gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div class="flex flex-col">
            ${hasDiscount ? `
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-400 line-through">$${price.toFixed(2)}</span>
                <span class="text-[10px] font-bold text-rose-500 uppercase">Save $${savings.toFixed(2)}</span>
              </div>
              <span class="text-3xl font-black text-slate-900 font-outfit">$${finalPrice.toFixed(2)}</span>
            ` : `
              <span class="text-3xl font-black text-slate-900 font-outfit">$${price.toFixed(2)}</span>
            `}
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Product Info</h2>
          <p class="text-slate-600 text-sm leading-relaxed font-light">
            ${description}
          </p>
        </div>

        <!-- Specifications Specsheet Grid -->
        <div class="border-t border-slate-100 pt-6">
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Specifications</h2>
          <div class="grid grid-cols-2 gap-y-3 gap-x-6 text-xs text-slate-500">
            <div>
              <span class="block font-medium text-slate-400 uppercase tracking-wide">SKU</span>
              <span class="text-slate-800 font-semibold">${sku || 'N/A'}</span>
            </div>
            <div>
              <span class="block font-medium text-slate-400 uppercase tracking-wide">Weight</span>
              <span class="text-slate-800 font-semibold">${weight ? `${weight} kg` : 'N/A'}</span>
            </div>
            <div>
              <span class="block font-medium text-slate-400 uppercase tracking-wide">Dimensions</span>
              <span class="text-slate-800 font-semibold">
                ${dimensions ? `${dimensions.width}w x ${dimensions.height}h x ${dimensions.depth}d mm` : 'N/A'}
              </span>
            </div>
            <div>
              <span class="block font-medium text-slate-400 uppercase tracking-wide">Warranty</span>
              <span class="text-slate-800 font-semibold">${warrantyInformation || 'N/A'}</span>
            </div>
            <div>
              <span class="block font-medium text-slate-400 uppercase tracking-wide">Shipping</span>
              <span class="text-slate-800 font-semibold">${shippingInformation || 'N/A'}</span>
            </div>
            <div>
              <span class="block font-medium text-slate-400 uppercase tracking-wide">Return Policy</span>
              <span class="text-slate-800 font-semibold">${returnPolicy || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Section: Quantities + Buttons -->
      <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <!-- Quantity input selector -->
        <div class="flex items-center justify-between border border-slate-200 rounded-xl px-2 py-1.5 bg-slate-50/50">
          <button id="qty-minus" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200 cursor-pointer text-slate-600 transition-colors" ${stock === 0 ? 'disabled' : ''}>
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
          </button>
          <span id="qty-display" class="w-12 text-center text-sm font-bold text-slate-800 select-none">1</span>
          <button id="qty-plus" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200 cursor-pointer text-slate-600 transition-colors" ${stock === 0 ? 'disabled' : ''}>
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>

        <!-- Add to cart -->
        <button 
          id="add-to-cart-btn"
          class="flex-grow flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
          ${stock === 0 ? 'disabled' : ''}
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Add to Cart
        </button>
      </div>

      <!-- Toast Success Popup Alert -->
      <div id="toast-success" class="hidden flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl mt-4">
        <svg class="h-5 w-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-xs">
          <p class="font-bold">Item Added!</p>
          <p class="text-emerald-600 mt-0.5">Successfully added to your shopping cart.</p>
        </div>
      </div>
    </div>
  `;

  // Gallery Thumbnail Interactivity
  const thumbnails = productDetail.querySelectorAll('.thumbnail-btn');
  const mainImageEl = document.getElementById('main-product-image');
  if (mainImageEl) {
    thumbnails.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const clickedSrc = e.currentTarget.getAttribute('data-image-src');
        mainImageEl.src = clickedSrc;

        // Active border toggle
        thumbnails.forEach(b => {
          b.classList.remove('border-indigo-600');
          b.classList.add('border-slate-100');
        });
        e.currentTarget.classList.remove('border-slate-100');
        e.currentTarget.classList.add('border-indigo-600');
      });
    });
  }

  // Quantity Modifier Interactivity
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const qtyDisplay = document.getElementById('qty-display');

  if (qtyMinus && qtyPlus && qtyDisplay) {
    qtyMinus.addEventListener('click', () => {
      if (currentQuantity > 1) {
        currentQuantity--;
        qtyDisplay.textContent = currentQuantity;
      }
    });

    qtyPlus.addEventListener('click', () => {
      if (currentQuantity < stock) {
        currentQuantity++;
        qtyDisplay.textContent = currentQuantity;
      }
    });
  }

  // Add To Cart Event
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const toastSuccess = document.getElementById('toast-success');

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (stock === 0) return;

      // Add to localStorage cart
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item.id === id);

      if (existingItem) {
        // Enforce max quantity limit equal to stock
        existingItem.quantity = Math.min(existingItem.quantity + currentQuantity, stock);
      } else {
        cart.push({
          id: id,
          title: title,
          price: price,
          discountPercentage: discountPercentage || 0,
          thumbnail: thumbnail || images[0] || 'assets/placeholder.webp',
          quantity: currentQuantity,
          stock: stock
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadges();

      // Show toast alert
      if (toastSuccess) {
        toastSuccess.classList.remove('hidden');
        setTimeout(() => {
          toastSuccess.classList.add('hidden');
        }, 3000);
      }
    });
  }
}

// State display management
function showLoading() {
  detailLoading.classList.remove('hidden');
  productDetail.classList.add('hidden');
  detailError.classList.add('hidden');
}

function hideLoading() {
  detailLoading.classList.add('hidden');
  productDetail.classList.remove('hidden');
}

function showError(msg) {
  detailLoading.classList.add('hidden');
  productDetail.classList.add('hidden');
  detailError.classList.remove('hidden');
  detailErrorMessage.textContent = msg;
}

// Start execution
init();
