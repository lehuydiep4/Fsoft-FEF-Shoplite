// js/api.js
// Mock API fetch layer for ShopLite.
// To switch to a real API in the future, simply update the URLs and parse the data accordingly.

const MOCK_URL = './mock/dummy.json';

/**
 * Fetch all products from the mock source.
 * @returns {Promise<Array>} List of products.
 */
export async function fetchProducts() {
  try {
    const res = await fetch(MOCK_URL);
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
    const products = await fetchProducts();
    const product = products.find(p => p.id === parseInt(id));
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  } catch (error) {
    console.error(`Error fetching product ID ${id}:`, error);
    throw error;
  }
}

/**
 * Extract unique categories from the product list.
 * @returns {Promise<Array>} List of unique category strings.
 */
export async function fetchCategories() {
  try {
    const products = await fetchProducts();
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}
