import { fetchPlantsByCategory, fetchPlantDetails } from './api.js';
import { cart } from './cart.js';

// UI management functions
export function showSpinner(show = true) {
  const spinner = document.getElementById('spinner');
  const cardContainer = document.querySelector('.card-container');

  if (show) {
    spinner?.classList.remove('hidden');
    cardContainer?.classList.add('hidden');
  } else {
    spinner?.classList.add('hidden');
    cardContainer?.classList.remove('hidden');
  }
}

export async function loadPlants(categoryId) {
  showSpinner(true);
  try {
    const plants = await fetchPlantsByCategory(categoryId);
    displayPlants(plants);
  } catch (error) {
    console.error('Error loading plants:', error);
    displayPlants([]);
  }
  showSpinner(false);
}

export function displayPlants(plants) {
  const cardContainer = document.querySelector('.card-container');
  if (!cardContainer) return;

  cardContainer.innerHTML = '';

  if (plants.length === 0) {
    cardContainer.innerHTML = `
      <h1 class="text-center md:text-5xl font-bold text-green-600 col-span-full items-center text-xl flex">
        No plants found in this category
      </h1>
    `;
    return;
  }

  plants.forEach((plant) => {
    const card = document.createElement('div');
    // Use md:col-span-4 so each card occupies 4 columns in a 12-column grid (3 cards per row)
    card.className =
      'card flex flex-col justify-between shadow-sm hover:shadow-md rounded-md p-4 col-span-1 md:col-span-4 bg-white';

    card.innerHTML = `
      <img src="${plant.image}" class="w-full h-40 object-cover mb-3 rounded-md" alt="${plant.name}">
      <div>
        <p class="text-xl font-bold cursor-pointer hover:text-green-600 transition-colors" id="plant-name-${plant.id}">${plant.name}</p>
        <p class="text-sm text-gray-600 mt-1">${plant.description || ''}</p>
      </div>
      <div class="flex justify-between items-center mt-3">
        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-xl text-sm">${plant.category || ''}</span>
        <span class="font-semibold text-lg">$${(Number(plant.price) || 0).toFixed(2)}</span>
      </div>
      <button id="cart-btn-${plant.id}" class="btn btn-primary w-full mt-3 cart-btn">
        Add To Cart
      </button>
    `;

    card.querySelector('.cart-btn').addEventListener('click', () => {
      const item = {
        id: plant.id,
        name: plant.name,
        price: Number(plant.price) || 0,
        description: plant.description || '',
        quantity: 1,
        currency: 'usd',
      };
      cart.addItem(item);
    });

    card
      .querySelector(`#plant-name-${plant.id}`)
      .addEventListener('click', async () => {
        try {
          const plantDetails = await fetchPlantDetails(plant.id);
          if (plantDetails) {
            showPlantModal(plantDetails);
          }
        } catch (error) {
          console.error('Error loading plant details:', error);
        }
      });

    cardContainer.appendChild(card);
  });
}

export function showPlantModal(plant) {
  const modalContainer = document.getElementById('plant-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <input type="checkbox" id="plant-modal" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box relative max-w-lg">
        <label for="plant-modal" class="btn btn-sm btn-circle absolute right-2 top-2 hover:bg-red-100">✕</label>
        <h3 class="text-2xl font-bold mb-3 text-green-700">${plant.name}</h3>
        <img src="${plant.image}" class="w-full h-48 object-cover rounded-md mb-3" alt="${plant.name}" />
        <div class="space-y-2">
          <p><strong class="text-green-600">Category:</strong> ${plant.category}</p>
          <p><strong class="text-green-600">Price:</strong> ৳${plant.price}</p>
          <p><strong class="text-green-600">Description:</strong> ${plant.description}</p>
        </div>
      </div>
    </div>
  `;
  document.getElementById('plant-modal').checked = true;
}

export async function initializeCategories() {
  try {
    const { fetchCategories } = await import('./api.js');
    const categories = await fetchCategories();
    displayCategoryButtons(categories);
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
}

export function displayCategoryButtons(categories) {
  const categoryContainer = document.getElementById('button-container');
  if (!categoryContainer) return;

  categories.forEach((category) => {
    const button = document.createElement('button');
    button.textContent = category.category_name;
    button.className =
      'w-full rounded-lg category-btn text-left py-2 px-3 transition-colors hover:bg-green-100';

    button.addEventListener('click', () => {
      loadPlants(category.id);

      // Update button styles
      document.querySelectorAll('.category-btn').forEach((btn) => {
        btn.classList.remove('bg-green-700', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
      });

      button.classList.remove('bg-gray-100', 'text-gray-700');
      button.classList.add('bg-green-700', 'text-white');
    });

    categoryContainer.appendChild(button);
  });
}
