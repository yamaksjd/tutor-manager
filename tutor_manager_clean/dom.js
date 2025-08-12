// dom.js 
const cache = new Map();

/**
 * Gets a DOM element by its ID
 * If we've found this element before, returns it from cache
 * If not found, throws an error
 * 
 * Example: get('student-list') returns the element with id="student-list"
 */
function get(id) {
  if (cache.has(id)) return cache.get(id);
  const el = document.getElementById(id);
  if (!el) throw new Error(`DOM element #${id} not found`);
  cache.set(id, el);
  return el;
}

/**
 * Adds an event listener to an element found by ID
 * Simpler way to add events without writing addEventListener every time
 * 
 * Example: on('save-button', 'click', () => console.log('clicked'))
 */

function on(id, eventName, handler, options) {
  get(id).addEventListener(eventName, handler, options);
}

/**
 * Adds an event listener to children of a container that match a CSS selector
 * Useful when you have a list of items that all need the same click handler
 * 
 * Example: delegate('student-list', 'click', '.delete-btn', handleDelete)
 * This will handle clicks on any .delete-btn inside #student-list
 */

function delegate(containerId, eventName, selector, handler) {
  const container = get(containerId);
  container.addEventListener(eventName, (e) => {
    const target = e.target.closest(selector);
    if (target && container.contains(target)) {
      handler(e, target);
    }
  });
}

/**
 * Shows a hidden element by removing the 'hidden' class
 * Example: show('edit-form')
 */

function show(id) { get(id).classList.remove('hidden'); }
/**
 * Hides an element by adding the 'hidden' class
 * Example: hide('edit-form')
 */
function hide(id) { get(id).classList.add('hidden'); }

/**
 * Sets the HTML content of an element
 * Example: html('student-name', 'John Doe')
 */

function html(id, value) { get(id).innerHTML = value; }

/**
 * Fills a select dropdown with options from an array of items
 * - items: array of data to turn into options
 * - valueFn: function to get the option value from an item
 * - labelFn: function to get the option text from an item
 * - placeholder: first option text (usually "Select...")
 * 
 * Example: 
 * fillSelect('student-select', 
 *           students, 
 *           student => student.id,
 *           student => student.name,
 *           'Select a student...')
 */

function fillSelect(id, items, valueFn, labelFn, placeholder) {
  const value = valueFn || (x => x);
  const label = labelFn || (x => x);
  const ph = placeholder || 'Select…';

  const el = get(id);
  el.innerHTML = '';

  const p = document.createElement('option');
  p.value = '';
  p.textContent = ph;
  el.appendChild(p);

  for (const item of items) {
    const o = document.createElement('option');
    o.value = value(item);
    o.textContent = label(item);
    el.appendChild(o);
  }
}

// Export all functions as a DOM object to use in other files
export const DOM = { 
  get,      // Find elements by ID
  on,       // Add event listeners
  delegate, // Add event listeners to lists
  show,     // Show elements
  hide,     // Hide elements
  html,     // Set HTML content
  fillSelect // Fill dropdown menus
};

