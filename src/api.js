// API utilities
const API_BASE = 'https://openapi.programming-hero.com/api';

/**
 * Fetch all plant categories from the API
 * @async
 * @returns {Promise<Array>} Array of category objects with id and category_name
 * @throws Logs error but returns empty array on failure
 * @example
 * const categories = await fetchCategories();
 * // Returns: [{id: 'plants', category_name: 'All Plants'}, ...]
 */
export async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await response.json();
    // API may return categories in different shapes; normalize defensively
    let list = data?.categories || data?.data || data || [];
    if (!Array.isArray(list)) {
      // sometimes API returns an object with keys
      list = Object.values(list);
    }

    const normalized = list.filter(Boolean).map((c) => {
      if (typeof c === 'string') return { id: c, category_name: c };
      return {
        id: String(
          c.id || c._id || c.category_id || c.key || c.slug || c.name
        ).trim(),
        category_name:
          c.category_name ||
          c.name ||
          c.title ||
          c.category ||
          c.label ||
          String(c).slice(0, 50),
      };
    });

    console.debug('fetchCategories ->', normalized);
    return normalized;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch all plants in a specific category
 * @async
 * @param {string} categoryId - The category ID to filter by
 * @returns {Promise<Array>} Array of plant objects with details
 * @throws Logs error but returns empty array on failure
 * @example
 * const plants = await fetchPlantsByCategory('plants');
 * // Returns: [{id: '1', name: 'Oak Tree', price: 50, image: '...', ...}, ...]
 */
export async function fetchPlantsByCategory(categoryId) {
  try {
    if (!categoryId) return [];

    const response = await fetch(`${API_BASE}/category/${categoryId}`);
    const data = await response.json();
    let list = data?.plants || data?.data || data || [];
    if (!Array.isArray(list)) list = Object.values(list);

    const normalized = list.filter(Boolean).map((p) => ({
      id: String(
        p.id ||
          p._id ||
          p.plant_id ||
          p.key ||
          p.slug ||
          p.name ||
          Math.random()
      ).trim(),
      name: p.name || p.title || 'Plant',
      image: p.image || p.thumbnail || p.img || '',
      description: p.description || p.summary || p.about || '',
      price: p.price || p.amount || p.cost || 0,
      category: p.category || p.category_name || null,
    }));

    console.debug('fetchPlantsByCategory', categoryId, normalized.length);
    return normalized;
  } catch (error) {
    console.error('Error fetching plants:', error);
    return [];
  }
}

/**
 * Fetch detailed information about a specific plant
 * @async
 * @param {string} plantId - The plant ID to fetch details for
 * @returns {Promise<Array|null>} Array of plant details or null on error
 * @throws Logs error but returns null on failure
 * @example
 * const details = await fetchPlantDetails('1');
 */
export async function fetchPlantDetails(plantId) {
  try {
    const response = await fetch(`${API_BASE}/plant/${plantId}`);
    const data = await response.json();
    return data.plants;
  } catch (error) {
    console.error('Error fetching plant details:', error);
    return null;
  }
}
