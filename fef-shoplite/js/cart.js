// js/cart.js
// Shopping Cart page controller. Handles dynamic rendering and state modifications of the cart.
import { updateCartBadges } from './components.js';
import { bindTemplateData } from '../utils/dom.js';

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
let cartItemTemplate = null;

/**
 * Initializes the cart page.
 */
async function init() {
  showLoading();
  try {
    const res = await fetch('components/cart-item.html');
    if (!res.ok) throw new Error("Failed to load cart item component");
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    cartItemTemplate = doc.getElementById('cart-item-template');
    
    loadCart();
    renderCart();
  } catch (error) {
    console.error("Error loading cart page templates:", error);
  } finally {
    hideLoading();
  }
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
  cartItemsList.innerHTML = '';

  // Iterate and clone dynamic row templates
  cart.forEach((item, index) => {
    const { id, title, price, discountPercentage, thumbnail, quantity, stock } = item;
    
    const hasDiscount = discountPercentage && discountPercentage > 0;
    const finalPrice = hasDiscount ? price * (1 - discountPercentage / 100) : price;
    const itemSubtotal = finalPrice * quantity;
    subtotal += itemSubtotal;

    if (!cartItemTemplate) return;
    const clone = cartItemTemplate.content.cloneNode(true);

    bindTemplateData(clone, {
      '.js-cart-item-link': { href: `product.html?id=${id}` },
      '.js-cart-item-title-link': { href: `product.html?id=${id}`, textContent: title },
      '.js-cart-item-img': { src: thumbnail || 'assets/placeholder.webp', alt: title },
      '.js-cart-item-price': `$${finalPrice.toFixed(2)}`,
      '.js-cart-item-original-price': hasDiscount
        ? { className: 'js-cart-item-original-price text-xs text-slate-400 line-through', textContent: `$${price.toFixed(2)}` }
        : { className: 'js-cart-item-original-price hidden' },
      '.js-cart-item-qty-minus': { 'data-index': index, disabled: quantity <= 1 },
      '.js-cart-item-qty-display': quantity,
      '.js-cart-item-qty-plus': { 'data-index': index, disabled: quantity >= (stock || 99) },
      '.js-cart-item-subtotal': `$${itemSubtotal.toFixed(2)}`,
      '.js-cart-item-delete-btn': { 'data-index': index }
    });

    const img = clone.querySelector('.js-cart-item-img');
    if (img) img.onerror = () => { img.src = 'assets/placeholder.webp'; };

    cartItemsList.appendChild(clone);
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

// Bind dynamic event listeners using Event Delegation on cartItemsList
if (cartItemsList) {
  cartItemsList.addEventListener('click', (e) => {
    // Minus Adjustment
    const minusBtn = e.target.closest('.js-cart-item-qty-minus');
    if (minusBtn) {
      const idx = parseInt(minusBtn.getAttribute('data-index'), 10);
      if (cart[idx] && cart[idx].quantity > 1) {
        cart[idx].quantity--;
        saveCart();
        renderCart();
      }
      return;
    }

    // Plus Adjustment
    const plusBtn = e.target.closest('.js-cart-item-qty-plus');
    if (plusBtn) {
      const idx = parseInt(plusBtn.getAttribute('data-index'), 10);
      if (cart[idx]) {
        const maxStock = cart[idx].stock || 99;
        if (cart[idx].quantity < maxStock) {
          cart[idx].quantity++;
          saveCart();
          renderCart();
        }
      }
      return;
    }

    // Remove Item
    const deleteBtn = e.target.closest('.js-cart-item-delete-btn');
    if (deleteBtn) {
      const idx = parseInt(deleteBtn.getAttribute('data-index'), 10);
      if (cart[idx]) {
        cart.splice(idx, 1);
        saveCart();
        renderCart();
      }
      return;
    }
  });
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
