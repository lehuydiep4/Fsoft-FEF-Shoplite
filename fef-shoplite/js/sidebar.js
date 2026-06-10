// js/sidebar.js
// Custom Web Component for ShopLite Sidebar (Filtering & Sorting)

import { fetchCategories } from './api.js';

class AppSidebar extends HTMLElement {
  constructor() {
    super();
    this.categories = [];
    
    // Initialize state from URL params if available, otherwise defaults
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    this.selectedCategory = categoryParam ? categoryParam.toLowerCase() : 'all';
    this.sortOption = 'default';
  }

  async connectedCallback() {
    try {
      // 1. Fetch template HTML
      const response = await fetch('components/sidebar.html');
      if (!response.ok) {
        throw new Error(`Failed to fetch sidebar component HTML (Status: ${response.status})`);
      }
      const html = await response.text();
      this.innerHTML = html;

      // 2. Fetch categories
      this.categories = await fetchCategories();

      // 3. Render categories list
      this.renderCategories();

      // 4. Setup event listeners
      this.setupListeners();

      // 5. Initial synchronization of UI elements
      this.syncUI();

      // 6. Sync externally-triggered category selection (e.g. from search suggestions)
      this._onCategorySelect = (e) => {
        const cat = e.detail.category;
        this.selectCategory(cat, false);
      };
      window.addEventListener('category-select', this._onCategorySelect);

    } catch (error) {
      console.error('Error initializing <app-sidebar>:', error);
    }
  }

  disconnectedCallback() {
    if (this._onCategorySelect) {
      window.removeEventListener('category-select', this._onCategorySelect);
    }
  }

  /**
   * Set category programmatically and update highlight.
   * @param {string} category 
   * @param {boolean} triggerEvent If true, dispatches 'filter-change' custom event
   */
  selectCategory(category, triggerEvent = true) {
    this.selectedCategory = category;
    this.updateCategoryActiveState();
    if (triggerEvent) {
      this.dispatchFilterChangeEvent();
    }
  }

  /**
   * Set sort option programmatically.
   * @param {string} sortOption 
   * @param {boolean} triggerEvent If true, dispatches 'filter-change' custom event
   */
  selectSort(sortOption, triggerEvent = true) {
    this.sortOption = sortOption;
    this.syncSortUI();
    if (triggerEvent) {
      this.dispatchFilterChangeEvent();
    }
  }

  /**
   * Renders the category buttons list.
   */
  renderCategories() {
    const categoryContainer = this.querySelector('#sidebar-categories');
    if (!categoryContainer) return;

    const items = ['all', ...this.categories];
    categoryContainer.innerHTML = items.map(cat => {
      const isSelected = this.selectedCategory === cat;
      const activeClasses = "bg-indigo-50 text-indigo-600 font-semibold";
      const inactiveClasses = "bg-transparent text-slate-600 hover:bg-slate-50/70 hover:text-indigo-600";
      const label = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      return `
        <button 
          data-category="${cat}"
          class="px-3 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer whitespace-nowrap ${isSelected ? activeClasses : inactiveClasses}"
        >
          ${label}
        </button>
      `;
    }).join('');
  }

  /**
   * Updates CSS classes to highlight the currently selected category.
   */
  updateCategoryActiveState() {
    const categoryContainer = this.querySelector('#sidebar-categories');
    if (!categoryContainer) return;

    categoryContainer.querySelectorAll('button[data-category]').forEach(btn => {
      const cat = btn.getAttribute('data-category');
      const isSel = cat === this.selectedCategory;
      
      btn.className = btn.className.replace(/bg-indigo-50|text-indigo-600|font-semibold/g, '').trim();
      btn.className = btn.className.replace(/bg-transparent|text-slate-600|hover:bg-slate-50\/70|hover:text-indigo-600/g, '').trim();
      
      btn.className += isSel 
        ? " bg-indigo-50 text-indigo-600 font-semibold" 
        : " bg-transparent text-slate-600 hover:bg-slate-50/70 hover:text-indigo-600";
    });
  }

  /**
   * Binds interaction event listeners.
   */
  setupListeners() {
    const categoryContainer = this.querySelector('#sidebar-categories');
    if (categoryContainer) {
      categoryContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-category]');
        if (!btn) return;
        const cat = btn.getAttribute('data-category');
        this.selectCategory(cat);
      });
    }

    const btnPrice = this.querySelector('#btn-sort-price');
    if (btnPrice) {
      btnPrice.addEventListener('click', () => {
        if (this.sortOption === 'price-desc') {
          this.sortOption = 'price-asc';
        } else {
          this.sortOption = 'price-desc';
        }
        this.syncSortUI();
        this.dispatchFilterChangeEvent();
      });
    }

    const btnName = this.querySelector('#btn-sort-name');
    if (btnName) {
      btnName.addEventListener('click', () => {
        if (this.sortOption === 'name-asc') {
          this.sortOption = 'name-desc';
        } else {
          this.sortOption = 'name-asc';
        }
        this.syncSortUI();
        this.dispatchFilterChangeEvent();
      });
    }
  }

  /**
   * Synchronizes UI controls with internal state.
   */
  syncUI() {
    this.updateCategoryActiveState();
    this.syncSortUI();
  }

  /**
   * Synchronizes sort buttons styling and labels based on sortOption.
   */
  syncSortUI() {
    const btnPrice = this.querySelector('#btn-sort-price');
    const labelPrice = this.querySelector('#label-sort-price');
    const arrowPrice = btnPrice ? btnPrice.querySelector('span:last-child') : null;

    const btnName = this.querySelector('#btn-sort-name');
    const labelName = this.querySelector('#label-sort-name');
    const arrowName = btnName ? btnName.querySelector('span:last-child') : null;

    const activeClasses = ["bg-indigo-600", "border-indigo-600", "text-white"];
    const inactiveClasses = ["bg-slate-50", "hover:bg-slate-100", "text-slate-600", "border-slate-200"];

    const setButtonState = (btn, arrow, isActive) => {
      if (!btn) return;
      if (isActive) {
        inactiveClasses.forEach(c => btn.classList.remove(c));
        activeClasses.forEach(c => btn.classList.add(c));
        if (arrow) {
          arrow.classList.remove('text-slate-400');
          arrow.classList.add('text-white/80');
        }
      } else {
        activeClasses.forEach(c => btn.classList.remove(c));
        inactiveClasses.forEach(c => btn.classList.add(c));
        if (arrow) {
          arrow.classList.remove('text-white/80');
          arrow.classList.add('text-slate-400');
        }
      }
    };

    // Reset both to inactive state
    setButtonState(btnPrice, arrowPrice, false);
    setButtonState(btnName, arrowName, false);

    // Apply active state and update labels
    if (this.sortOption.startsWith('price-')) {
      setButtonState(btnPrice, arrowPrice, true);
      if (this.sortOption === 'price-asc') {
        if (labelPrice) labelPrice.textContent = 'Low to High';
        if (arrowPrice) arrowPrice.textContent = '▲';
      } else {
        if (labelPrice) labelPrice.textContent = 'High to Low';
        if (arrowPrice) arrowPrice.textContent = '▼';
      }
    } else if (this.sortOption.startsWith('name-')) {
      setButtonState(btnName, arrowName, true);
      if (this.sortOption === 'name-asc') {
        if (labelName) labelName.textContent = 'A to Z';
        if (arrowName) arrowName.textContent = '▲';
      } else {
        if (labelName) labelName.textContent = 'Z to A';
        if (arrowName) arrowName.textContent = '▼';
      }
    }
  }

  /**
   * Dispatches custom event to notify parent controller.
   */
  dispatchFilterChangeEvent() {
    this.dispatchEvent(new CustomEvent('filter-change', {
      detail: {
        category: this.selectedCategory,
        sort: this.sortOption
      },
      bubbles: true
    }));
  }
}

if (!customElements.get('app-sidebar')) {
  customElements.define('app-sidebar', AppSidebar);
}
