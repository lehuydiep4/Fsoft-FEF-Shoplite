// js/api.js
// Real API fetch layer for ShopLite.

const BASE_URL = 'https://dummyjson.com';

/**
 * Fetch all products from the DummyJSON API.
 * Uses limit=0 to retrieve all products for client-side filtering.
 * @returns {Promise<Array>} List of products.
 */
export async function fetchProducts() {
  try {
    const res = await fetch(`${BASE_URL}/products?limit=0`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

/**
 * Fetch a single product details by ID.
 * @param {number|string} id The product ID.
 * @returns {Promise<Object>} The product object.
 */
export async function fetchProductById(id) {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const product = await res.json();
    return product;
  } catch (error) {
    console.error(`Error fetching product ID ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch the list of categories.
 * @returns {Promise<Array>} List of category strings.
 */
export async function fetchCategories() {
  try {
    const res = await fetch(`${BASE_URL}/products/category-list`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const categories = await res.json();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

/**
 * Fetch products belonging to a specific category.
 * @param {string} categoryName The category identifier.
 * @returns {Promise<Array>} List of products in that category.
 */
export async function fetchProductsByCategory(categoryName) {
  try {
    const res = await fetch(`${BASE_URL}/products/category/${categoryName}`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error(`Error fetching products for category ${categoryName}:`, error);
    throw error;
  }
}

