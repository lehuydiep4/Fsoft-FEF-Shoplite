// js/toast.js
// Reusable dynamic toast system module.
import { bindTemplateData } from '../utils/dom.js';

let cachedToastTemplate = null;

/**
 * Fetch and return the toast HTML template content.
 * Caches the response in memory for performance.
 * @returns {Promise<string>} The toast HTML content.
 */
async function getToastTemplate() {
  if (cachedToastTemplate) {
    return cachedToastTemplate;
  }
  
  try {
    const response = await fetch('components/toast.html');
    if (!response.ok) {
      throw new Error(`Failed to load toast template (Status: ${response.status})`);
    }
    cachedToastTemplate = await response.text();
    return cachedToastTemplate;
  } catch (error) {
    console.error("Error fetching toast component:", error);
    // Fallback static HTML in case of network issue
    return `
      <div class="js-toast-element flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl shadow-lg transition-all duration-300 transform translate-y-10 opacity-0 max-w-sm pointer-events-auto">
        <div class="text-xs">
          <p class="js-toast-title font-bold"></p>
          <p class="js-toast-desc text-emerald-600 mt-0.5"></p>
        </div>
      </div>
    `;
  }
}

/**
 * Renders and animates a toast notification on the screen.
 * @param {string} title The toast bold title.
 * @param {string} description The description message.
 */
export async function showToast(title, description) {
  // Ensure container exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  // Load template HTML
  const html = await getToastTemplate();
  
  // Create a parsing helper
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const toastNode = doc.querySelector('.js-toast-element');
  
  if (!toastNode) return;

  // Clone node for actual insertion
  const toast = toastNode.cloneNode(true);
  
  // Update dynamic values safely
  bindTemplateData(toast, {
    '.js-toast-title': title,
    '.js-toast-desc': description
  });

  container.appendChild(toast);

  // Trigger animation next tick
  setTimeout(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
  }, 10);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
