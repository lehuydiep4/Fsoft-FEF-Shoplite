// js/services/cartService.js
// Use Case Layer: Handles UI-agnostic cart business rules.

import { getFromStorage, saveToStorage } from './storage.js';

const CART_KEY = 'cart';

/**
 * Retrieves the cart from storage.
 * @returns {Array}
 */
export function getCart() {
  return getFromStorage(CART_KEY, []);
}

/**
 * Saves the cart to storage.
 * @param {Array} cart
 */
export function saveCart(cart) {
  saveToStorage(CART_KEY, cart);
}

/**
 * Gets the total item count (sum of quantities) in the cart.
 * @returns {number}
 */
export function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

/**
 * Calculates pricing details for a single product.
 * @param {Object} product
 * @returns {Object} { hasDiscount, finalPrice, savings }
 */
export function getProductPriceInfo(product) {
  const price = product.price || 0;
  const discountPercentage = product.discountPercentage || 0;
  const hasDiscount = discountPercentage > 0;
  const finalPrice = hasDiscount ? price * (1 - discountPercentage / 100) : price;
  const savings = hasDiscount ? price - finalPrice : 0;

  return {
    hasDiscount,
    finalPrice,
    savings
  };
}

/**
 * Adds an item to the cart, checking stock.
 * @param {Object} product
 * @param {number} quantity
 * @returns {Array} Updated cart
 */
export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  const stock = product.stock !== undefined ? product.stock : 99;

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, stock);
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      discountPercentage: product.discountPercentage || 0,
      thumbnail: product.thumbnail || (product.images && product.images[0]) || 'assets/placeholder.webp',
      quantity: quantity,
      stock: stock
    });
  }

  saveCart(cart);
  return cart;
}

/**
 * Updates quantity of an item by index, checking stock bounds.
 * @param {number} index
 * @param {number} delta
 * @returns {Array} Updated cart
 */
export function updateItemQuantity(index, delta) {
  const cart = getCart();
  if (cart[index]) {
    const maxStock = cart[index].stock || 99;
    const newQty = cart[index].quantity + delta;
    if (newQty >= 1 && newQty <= maxStock) {
      cart[index].quantity = newQty;
      saveCart(cart);
    }
  }
  return cart;
}

/**
 * Removes an item from the cart by index.
 * @param {number} index
 * @returns {Array} Updated cart
 */
export function removeItem(index) {
  const cart = getCart();
  if (cart[index]) {
    cart.splice(index, 1);
    saveCart(cart);
  }
  return cart;
}

/**
 * Calculates subtotal, tax, and total.
 * Returns an object containing the decorated items and calculations.
 * @returns {Object} { items, subtotal, tax, total }
 */
export function calculateTotals() {
  const cart = getCart();
  const taxRate = 0.08; // 8% Tax

  const items = cart.map(item => {
    const { hasDiscount, finalPrice } = getProductPriceInfo(item);
    const itemSubtotal = finalPrice * (item.quantity || 1);
    return {
      ...item,
      hasDiscount,
      finalPrice,
      itemSubtotal
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.itemSubtotal, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    items,
    subtotal,
    tax,
    total
  };
}
