// js/pagination.js
// Decoupled reusable Pagination component.

/**
 * Renders and initializes pagination controls inside a container.
 * @param {Object} options Configuration options.
 * @param {string} options.containerId Selector or element ID where pagination is rendered.
 * @param {number} options.totalItems Total count of filtered items.
 * @param {number} options.itemsPerPage Number of items shown per page.
 * @param {number} options.currentPage Current active page.
 * @param {function} options.onPageChange Callback function triggered on page selection.
 */
export function renderPagination({ containerId, totalItems, itemsPerPage, currentPage, onPageChange }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  
  // Previous button
  const prevDisabled = currentPage === 1;
  html += `
    <button 
      class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:border-slate-200 cursor-pointer"
      data-page="${currentPage - 1}"
      ${prevDisabled ? 'disabled' : ''}
    >
      Prev
    </button>
  `;

  // Start & End of page numbers window (current page +/- 2)
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  // Left ellipsis
  if (startPage > 1) {
    html += `
      <span class="w-8 h-8 flex items-center justify-center text-slate-400 text-xs select-none">...</span>
    `;
  }

  // Page buttons
  for (let i = startPage; i <= endPage; i++) {
    const isActive = i === currentPage;
    const btnClass = isActive
      ? "bg-indigo-600 text-white border border-indigo-600 shadow-sm"
      : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600";
    html += `
      <button 
        class="w-8 h-8 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer ${btnClass}"
        data-page="${i}"
      >
        ${i}
      </button>
    `;
  }

  // Right ellipsis
  if (endPage < totalPages) {
    html += `
      <span class="w-8 h-8 flex items-center justify-center text-slate-400 text-xs select-none">...</span>
    `;
  }

  // Next button
  const nextDisabled = currentPage === totalPages;
  html += `
    <button 
      class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:border-slate-200 cursor-pointer"
      data-page="${currentPage + 1}"
      ${nextDisabled ? 'disabled' : ''}
    >
      Next
    </button>
  `;

  // Jump to input
  html += `
    <div class="flex items-center gap-2 border-l border-slate-100 pl-3 ml-2">
      <span class="text-xs text-slate-400 font-medium whitespace-nowrap">Go to:</span>
      <input 
        type="number" 
        id="pagination-jump-input" 
        min="1" 
        max="${totalPages}" 
        value="${currentPage}" 
        class="w-12 px-2 py-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-xs font-bold text-slate-700 text-center outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
      />
    </div>
  `;

  container.innerHTML = html;

  // Bind click events to page buttons
  container.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = parseInt(e.currentTarget.getAttribute('data-page'), 10);
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    });
  });

  // Bind input change events for Jump to
  const jumpInput = document.getElementById('pagination-jump-input');
  if (jumpInput) {
    const triggerJump = () => {
      const page = parseInt(jumpInput.value, 10);
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      } else {
        // Reset to current page if out of bounds
        jumpInput.value = currentPage;
      }
    };

    jumpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerJump();
      }
    });

    jumpInput.addEventListener('blur', () => {
      triggerJump();
    });
  }
}
