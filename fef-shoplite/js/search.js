// js/search.js
// Dedicated logic for search synchronization and events.

/**
 * Initializes the search feature across all elements with the class `.js-search-input`.
 */
export function initSearchFeature() {
  const searchInputs = document.querySelectorAll('.js-search-input');
  if (searchInputs.length === 0) return;

  // Read the initial query string ?search=... and pre-populate search inputs
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search') || '';
  
  searchInputs.forEach(input => {
    input.value = searchParam;
  });

  // Bind event listeners to each search input
  searchInputs.forEach(input => {
    // Sync values automatically
    input.addEventListener('input', (e) => {
      const query = e.target.value;
      
      // Update all other search inputs with the same value
      searchInputs.forEach(otherInput => {
        if (otherInput !== input) {
          otherInput.value = query;
        }
      });

      // Dispatch global CustomEvent 'product-search'
      window.dispatchEvent(new CustomEvent('product-search', { detail: { query } }));
    });

    // Handle keydown Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value;
        const page = window.location.pathname.split('/').pop() || 'index.html';
        if (page !== 'index.html' && page !== '') {
          // Programmatically redirect to index.html with the query parameter
          window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  });
}
