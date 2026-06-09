// js/product.js
// Product Details rendering and interactive page controller.
import { fetchProductById } from './api.js';
import { updateCartBadges } from './components.js';
import { showToast } from './toast.js';
import { bindTemplateData } from '../utils/dom.js';

// Elements
const detailPageContainer = document.getElementById('detail-page-container');
const detailLoading = document.getElementById('detail-loading');
const detailError = document.getElementById('detail-error');
const detailErrorMessage = document.getElementById('detail-error-message');
const productDetail = document.getElementById('product-detail');

// State
let currentProduct = null;
let currentQuantity = 1;
let detailTemplate = null;

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
    const [product, detailHtml] = await Promise.all([
      fetchProductById(productId),
      fetch('components/product-detail.html').then(res => {
        if (!res.ok) throw new Error("Failed to load product detail component");
        return res.text();
      })
    ]);
    currentProduct = product;

    // Parse product detail template
    const parser = new DOMParser();
    const doc = parser.parseFromString(detailHtml, 'text/html');
    detailTemplate = doc.getElementById('product-detail-template');

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
    stars += `<svg-icon src="assets/icons/star.svg" class="w-4 h-4 text-amber-400 fill-current"></svg-icon>`;
  }
  if (hasHalfStar) {
    stars += `<svg-icon src="assets/icons/star-half.svg" class="w-4 h-4 text-amber-400 fill-current"></svg-icon>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += `<svg-icon src="assets/icons/star.svg" class="w-4 h-4 text-slate-200 fill-current"></svg-icon>`;
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

  // Clone template content
  if (!detailTemplate) return;
  const clone = detailTemplate.content.cloneNode(true);

  // Stock status class & label details
  let stockBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
  let stockLabel = "In Stock";
  if (stock === 0) {
    stockBadgeClass = "bg-rose-50 text-rose-700 border-rose-100";
    stockLabel = "Out of Stock";
  } else if (stock <= 10) {
    stockBadgeClass = "bg-amber-50 text-amber-700 border-amber-100";
    stockLabel = `Low Stock (${stock} left)`;
  }

  // Bind declarative specifications & properties
  bindTemplateData(clone, {
    '.js-detail-discount-badge': hasDiscount
      ? { className: 'js-detail-discount-badge absolute top-4 left-4 z-10 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500 text-white shadow-xs', textContent: `-${discountPercentage.toFixed(0)}% OFF` }
      : { className: 'js-detail-discount-badge hidden' },
    '.js-detail-main-img': { src: images && images.length > 0 ? images[0] : 'assets/placeholder.webp', alt: title },
    '.js-detail-category': categoryLabel,
    '.js-detail-brand': brand || 'Generic',
    '.js-detail-stock-badge': { className: `js-detail-stock-badge px-3 py-1 rounded-full text-xs font-semibold border ${stockBadgeClass}`, textContent: stockLabel },
    '.js-detail-title': title,
    '.js-detail-rating-value': rating.toFixed(1),
    '.js-detail-reviews-count': `${currentProduct.reviews ? currentProduct.reviews.length : 0} verified reviews`,
    '.js-detail-discount-wrapper': hasDiscount ? { className: 'js-detail-discount-wrapper flex items-center gap-2' } : { className: 'js-detail-discount-wrapper hidden' },
    '.js-detail-original-price': hasDiscount ? `$${price.toFixed(2)}` : null,
    '.js-detail-savings': hasDiscount ? `Save $${savings.toFixed(2)}` : null,
    '.js-detail-price': `$${finalPrice.toFixed(2)}`,
    '.js-detail-description': description,
    '.js-detail-sku': sku || 'N/A',
    '.js-detail-weight': weight ? `${weight} kg` : 'N/A',
    '.js-detail-dimensions': dimensions ? `${dimensions.width}w x ${dimensions.height}h x ${dimensions.depth}d mm` : 'N/A',
    '.js-detail-warranty': warrantyInformation || 'N/A',
    '.js-detail-shipping': shippingInformation || 'N/A',
    '.js-detail-return-policy': returnPolicy || 'N/A',
    '.js-detail-qty-minus': { disabled: stock === 0 },
    '.js-detail-qty-plus': { disabled: stock === 0 }
  });

  // Non-declarative attributes and handlers
  const mainImageEl = clone.querySelector('.js-detail-main-img');
  if (mainImageEl) mainImageEl.onerror = () => { mainImageEl.src = 'assets/placeholder.webp'; };

  const ratingStarsEl = clone.querySelector('.js-detail-rating-stars');
  if (ratingStarsEl) ratingStarsEl.innerHTML = getStarsHtml(rating);

  // Populate gallery thumbnails container
  const thumbnailsContainer = clone.querySelector('.js-detail-thumbnails-container');
  const hasMultipleImages = images && images.length > 1;
  if (thumbnailsContainer) {
    if (hasMultipleImages) {
      thumbnailsContainer.innerHTML = images.map((img, index) => `
        <button 
          class="thumbnail-btn w-18 h-18 sm:w-20 sm:h-20 border-2 ${index === 0 ? 'border-indigo-600' : 'border-slate-100 hover:border-slate-300'} bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer transition-colors"
          data-image-src="${img}"
        >
          <img src="${img}" alt="Thumbnail ${index + 1}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/placeholder.webp';">
        </button>
      `).join('');
    } else {
      thumbnailsContainer.classList.add('hidden');
    }
  }

  // Quantity input elements
  const qtyMinus = clone.querySelector('.js-detail-qty-minus');
  const qtyPlus = clone.querySelector('.js-detail-qty-plus');
  const qtyDisplay = clone.querySelector('.js-detail-qty-display');
  const addToCartBtn = clone.querySelector('.js-detail-add-to-cart-btn');

  if (qtyMinus) {
    if (stock === 0) qtyMinus.disabled = true;
    qtyMinus.addEventListener('click', () => {
      if (currentQuantity > 1) {
        currentQuantity--;
        if (qtyDisplay) qtyDisplay.textContent = currentQuantity;
      }
    });
  }

  if (qtyPlus) {
    if (stock === 0) qtyPlus.disabled = true;
    qtyPlus.addEventListener('click', () => {
      if (currentQuantity < stock) {
        currentQuantity++;
        if (qtyDisplay) qtyDisplay.textContent = currentQuantity;
      }
    });
  }

  if (addToCartBtn) {
    if (stock === 0) {
      addToCartBtn.disabled = true;
      addToCartBtn.classList.add('bg-slate-200', 'text-slate-400', 'shadow-none', 'cursor-not-allowed');
      addToCartBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700', 'cursor-pointer');
    } else {
      addToCartBtn.addEventListener('click', () => {
        // Add to localStorage cart
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
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

        // Show global toast
        showToast("Item Added!", `"${title}" added to cart.`);
      });
    }
  }

  // Clear previous and inject new content
  productDetail.innerHTML = '';
  productDetail.appendChild(clone);

  // Gallery Thumbnail Interactivity (must be set up on the live DOM after appending)
  const thumbnails = productDetail.querySelectorAll('.thumbnail-btn');
  const mainImageElLive = productDetail.querySelector('#main-product-image');
  if (mainImageElLive) {
    thumbnails.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const clickedSrc = e.currentTarget.getAttribute('data-image-src');
        mainImageElLive.src = clickedSrc;

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
