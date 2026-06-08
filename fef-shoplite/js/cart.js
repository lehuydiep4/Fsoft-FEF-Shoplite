// js/cart.js
// Shopping Cart page controller. Handles dynamic rendering and state modifications of the cart.
import { updateCartBadges } from './components.js';

// Elements
const cartItemsList = document.getElementById('cart-items-list');
const cartLoading = document.getElementById('cart-loading');
const cartEmpty = document.getElementById('cart-empty');
const cartSummarySection = document.getElementById('cart-summary-section');
const checkoutBtn = document.getElementById('checkout-btn');

// Summary elements
const summarySubtotal = document.getElementById('summary-subtotal');
const summaryTax = document.getElementById('summary-tax');
const summaryTotal = document.getElementById('summary-total');

// State
let cart = [];

/**
 * Initializes the cart page.
 */
function init() {
  showLoading();
  loadCart();
  renderCart();
  hideLoading();
}

/**
 * Loads the cart array from localStorage.
 */
function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
  } catch (e) {
    cart = [];
  }
}

/**
 * Saves the cart state back to localStorage.
 */
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadges();
}

/**
 * Renders the cart items and summary details.
 */
function renderCart() {
  if (cart.length === 0) {
    cartEmpty.classList.remove('hidden');
    cartItemsList.classList.add('hidden');
    cartSummarySection.classList.add('hidden');
    return;
  }

  cartEmpty.classList.add('hidden');
  cartItemsList.classList.remove('hidden');
  cartSummarySection.classList.remove('hidden');

  let subtotal = 0;

  // Build items list
  cartItemsList.innerHTML = cart.map((item, index) => {
    const { id, title, price, discountPercentage, thumbnail, quantity, stock } = item;
    
    const hasDiscount = discountPercentage && discountPercentage > 0;
    const finalPrice = hasDiscount ? price * (1 - discountPercentage / 100) : price;
    const itemSubtotal = finalPrice * quantity;
    subtotal += itemSubtotal;

    return `
      <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-xs hover:shadow-md transition-shadow">
        <!-- Image -->
        <a href="product.html?id=${id}" class="w-24 h-24 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
          <img 
            src="${thumbnail || 'assets/placeholder.webp'}" 
            alt="${title}"
            onerror="this.onerror=null; this.src='assets/placeholder.webp';"
            class="w-full h-full object-cover"
          />
        </a>

        <!-- Details -->
        <div class="flex-grow text-center sm:text-left space-y-1 w-full min-w-0">
          <h3 class="font-bold text-slate-800 hover:text-indigo-600 transition-colors text-base truncate">
            <a href="product.html?id=${id}">${title}</a>
          </h3>
          <div class="flex items-center justify-center sm:justify-start gap-2">
            ${hasDiscount ? `
              <span class="text-sm font-black text-slate-800">$${finalPrice.toFixed(2)}</span>
              <span class="text-xs text-slate-400 line-through">$${price.toFixed(2)}</span>
            ` : `
              <span class="text-sm font-semibold text-slate-800">$${price.toFixed(2)}</span>
            `}
          </div>
        </div>

        <!-- Controls (Quantity + Delete) -->
        <div class="flex flex-row items-center justify-between sm:justify-end gap-6 w-full sm:w-auto flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-50">
          <!-- Quantity adjuster -->
          <div class="flex items-center border border-slate-200 rounded-xl px-1 py-1 bg-slate-50/50">
            <button 
              data-index="${index}"
              class="qty-minus w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 cursor-pointer text-slate-500 transition-colors"
              ${quantity <= 1 ? 'disabled' : ''}
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
            </button>
            <span class="w-9 text-center text-xs font-bold text-slate-800 select-none">${quantity}</span>
            <button 
              data-index="${index}"
              class="qty-plus w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 cursor-pointer text-slate-500 transition-colors"
              ${quantity >= (stock || 99) ? 'disabled' : ''}
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>

          <!-- Total price & Delete -->
          <div class="flex items-center gap-4">
            <span class="text-base font-extrabold text-slate-800 font-outfit min-w-[70px] text-right">
              $${itemSubtotal.toFixed(2)}
            </span>
            <button 
              data-index="${index}"
              class="delete-item-btn p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-all"
              aria-label="Remove item"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind adjuster event listeners
  cartItemsList.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      if (cart[idx].quantity > 1) {
        cart[idx].quantity--;
        saveCart();
        renderCart();
      }
    });
  });

  cartItemsList.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      const maxStock = cart[idx].stock || 99;
      if (cart[idx].quantity < maxStock) {
        cart[idx].quantity++;
        saveCart();
        renderCart();
      }
    });
  });

  cartItemsList.querySelectorAll('.delete-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      cart.splice(idx, 1);
      saveCart();
      renderCart();
    });
  });

  // Calculate taxes and totals
  const taxRate = 0.08; // 8% Tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Update Summary DOM
  summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
  summaryTax.textContent = `$${tax.toFixed(2)}`;
  summaryTotal.textContent = `$${total.toFixed(2)}`;
}

// State display management
function showLoading() {
  cartLoading.classList.remove('hidden');
  cartItemsList.classList.add('hidden');
  cartSummarySection.classList.add('hidden');
}

function hideLoading() {
  cartLoading.classList.add('hidden');
}

// Checkout Button handler
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    alert("Checkout functionality would be implemented in Day 5/6! Cart details successfully parsed.");
  });
}

// Run on page load
init();
