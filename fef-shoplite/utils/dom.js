// fef-shoplite/utils/dom.js
// Centralized DOM template binding helper.

/**
 * Declaratively updates texts, properties, and attributes on template nodes.
 * @param {DocumentFragment|Element} clone The cloned template node.
 * @param {Object} selectors Mapping of CSS selectors to configuration strings or objects.
 */
export function bindTemplateData(clone, selectors) {
  if (!clone || !selectors) return;

  Object.entries(selectors).forEach(([selector, config]) => {
    const el = clone.querySelector(selector);
    if (!el) return;

    if (config !== null && config !== undefined && typeof config === 'object') {
      Object.entries(config).forEach(([attr, val]) => {
        if (attr === 'textContent') {
          el.textContent = val;
        } else if (attr === 'className') {
          el.className = val;
        } else if (attr === 'disabled') {
          el.disabled = !!val;
        } else if (val === false || val === null || val === undefined) {
          el.removeAttribute(attr);
        } else {
          el.setAttribute(attr, val);
        }
      });
    } else {
      // Simple text mapping if the configuration is a primitive
      el.textContent = (config !== null && config !== undefined) ? config : '';
    }
  });
}
