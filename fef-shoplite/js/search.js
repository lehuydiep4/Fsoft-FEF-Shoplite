// js/search.js
// Dedicated logic for search synchronization, debounce, and autocomplete suggestions.

// Cache for products and categories to prevent repeated network requests
let cachedProducts = [];
let cachedCategories = [];
let isFetchingIndex = false;

/**
 * Lazy-loads the search index from the API if not already cached.
 */
async function ensureSearchIndex() {
  if (cachedProducts.length > 0 && cachedCategories.length > 0) {
    return { products: cachedProducts, categories: cachedCategories };
  }
  if (isFetchingIndex) {
    // Wait until fetching is complete
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isFetchingIndex) {
          clearInterval(interval);
          resolve({ products: cachedProducts, categories: cachedCategories });
        }
      }, 50);
    });
  }

  isFetchingIndex = true;
  try {
    const { fetchProducts, fetchCategories } = await import('./api.js');
    const [products, categories] = await Promise.all([
      fetchProducts(),
      fetchCategories()
    ]);
    cachedProducts = products;
    cachedCategories = categories;
  } catch (error) {
    console.error("Failed to build search index:", error);
  } finally {
    isFetchingIndex = false;
  }

  return { products: cachedProducts, categories: cachedCategories };
}

/**
 * Debounce utility to rate-limit execution of a function.
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Initializes the search feature across all elements with the class `.js-search-input`.
 */
export function initSearchFeature() {
  const searchInputs = document.querySelectorAll('.js-search-input');
  if (searchInputs.length === 0) return;

  // Pre-populate search inputs with the initial search query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search') || '';
  searchInputs.forEach(input => {
    input.value = searchParam;
  });

  // Global event listener to close all suggestion boxes when clicking outside
  document.addEventListener('click', (e) => {
    const inWrapper = e.target.closest('.js-search-wrapper');
    if (!inWrapper) {
      document.querySelectorAll('.js-search-suggestions').forEach(box => {
        box.classList.add('hidden');
      });
    }
  });

  searchInputs.forEach(input => {
    const wrapper = input.closest('.js-search-wrapper');
    const suggestionsBox = wrapper ? wrapper.querySelector('.js-search-suggestions') : null;

    if (!suggestionsBox) return;

    // Handle suggestion rendering as user types
    const handleInput = async () => {
      const query = input.value.trim().toLowerCase();
      if (!query || query.length < 1) {
        suggestionsBox.classList.add('hidden');
        suggestionsBox.innerHTML = '';
        return;
      }

      const { products, categories } = await ensureSearchIndex();
      
      // Filter matches
      const matchedCategories = categories.filter(cat => cat.toLowerCase().includes(query)).slice(0, 3);
      const matchedProducts = products.filter(prod => 
        prod.title.toLowerCase().includes(query) || 
        (prod.brand && prod.brand.toLowerCase().includes(query))
      ).slice(0, 5);

      if (matchedCategories.length === 0 && matchedProducts.length === 0) {
        suggestionsBox.innerHTML = `
          <div class="p-3 text-xs text-slate-400 font-light text-center">
            No suggestions found for "${input.value}"
          </div>
        `;
        suggestionsBox.classList.remove('hidden');
        return;
      }

      let html = '';

      // 1. Render Categories suggestions
      if (matchedCategories.length > 0) {
        html += `
          <div>
            <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</div>
            <div class="flex flex-col gap-0.5 mt-1">
        `;
        matchedCategories.forEach(cat => {
          const capName = cat.charAt(0).toUpperCase() + cat.slice(1);
          html += `
            <button 
              type="button" 
              class="js-suggest-category w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
              data-category="${cat}"
            >
              <svg-icon src="assets/icons/home.svg" class="w-3.5 h-3.5 text-slate-400"></svg-icon>
              <span>${capName}</span>
            </button>
          `;
        });
        html += `
            </div>
          </div>
        `;
      }

      // Divider between Categories and Products if both exist
      if (matchedCategories.length > 0 && matchedProducts.length > 0) {
        html += `<div class="border-t border-slate-100 my-2"></div>`;
      }

      // 2. Render Products suggestions
      if (matchedProducts.length > 0) {
        html += `
          <div>
            <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Products</div>
            <div class="flex flex-col gap-0.5 mt-1">
        `;
        matchedProducts.forEach(prod => {
          html += `
            <a 
              href="product.html?id=${prod.id}"
              class="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3"
            >
              <img src="${prod.thumbnail || 'assets/placeholder.webp'}" class="w-7 h-7 rounded-md object-cover bg-slate-50 flex-shrink-0" onerror="this.onerror=null; this.src='assets/placeholder.webp';">
              <div class="overflow-hidden">
                <p class="font-semibold truncate">${prod.title}</p>
                <p class="text-[10px] text-slate-400 font-light truncate">${prod.brand || 'Generic'}</p>
              </div>
            </a>
          `;
        });
        html += `
            </div>
          </div>
        `;
      }

      suggestionsBox.innerHTML = html;
      suggestionsBox.classList.remove('hidden');

      // Bind dynamic click events to category suggestions
      suggestionsBox.querySelectorAll('.js-suggest-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const category = e.currentTarget.getAttribute('data-category');
          suggestionsBox.classList.add('hidden');
          input.value = '';
          
          const page = window.location.pathname.split('/').pop() || 'index.html';
          if (page === 'index.html' || page === '') {
            // Dispatch dynamic event to filter list
            window.dispatchEvent(new CustomEvent('category-select', { detail: { category } }));
          } else {
            // Redirect to home page with category query param
            window.location.href = `index.html?category=${encodeURIComponent(category)}`;
          }
        });
      });
    };

    // Attach debounced handler on input event
    const debouncedInput = debounce(handleInput, 250);
    input.addEventListener('input', debouncedInput);

    // Sync input values across multiple search input elements (e.g. desktop & mobile)
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      searchInputs.forEach(other => {
        if (other !== input) other.value = val;
      });
    });

    // Handle focus showing suggestions if not empty
    input.addEventListener('focus', () => {
      if (input.value.trim().length > 0) {
        handleInput();
      }
    });

    // Keydown handling for submitting search (Enter key)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = input.value.trim();
        suggestionsBox.classList.add('hidden');

        const page = window.location.pathname.split('/').pop() || 'index.html';
        if (page === 'index.html' || page === '') {
          // On Home Page: Dispatch search event to filter grid
          window.dispatchEvent(new CustomEvent('product-search', { detail: { query } }));
        } else {
          // On other pages: Redirect to index.html with search param
          window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  });
}
