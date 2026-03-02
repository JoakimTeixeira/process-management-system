/**
 * Standardized Chevron Component
 * Creates consistent chevron icons using Feather Icons
 * @param {string} direction - 'down' (default), 'right', 'up', 'left'
 * @param {string} classes - Additional CSS classes
 * @param {string} id - Element ID
 * @param {number} size - Size in pixels (default: 20)
 * @returns {string} HTML string for the chevron icon
 */
function createChevron(direction = "down", classes = "", id = "") {
  const iconName = `chevron-${direction}`;
  const baseClasses =
    "h-4 w-4 text-gray-400 ml-1 transition-transform duration-200";
  const allClasses = classes ? `${baseClasses} ${classes}` : baseClasses;
  const idAttr = id ? `id="${id}"` : "";

  return `<i data-feather="${iconName}" class="${allClasses}" ${idAttr}></i>`;
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createChevron };
} else if (typeof window !== "undefined") {
  window.createChevron = createChevron;
}
