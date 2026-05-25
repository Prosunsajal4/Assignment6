import { fetchPlantsByCategory, fetchPlantDetails } from './api.js';
import { cart } from './cart.js';

// Enhanced UI management functions
export function showSpinner(show = true) {
  const spinner = document.getElementById('spinner');
  const cardContainer = document.querySelector('.card-container');

  if (show) {
    spinner?.classList.remove('hidden');
    spinner?.classList.add('fade-in');
    cardContainer?.classList.add('hidden');
  } else {
    spinner?.classList.add('hidden');
    spinner?.classList.remove('fade-in');
    cardContainer?.classList.remove('hidden');
    cardContainer?.classList.add('fade-in');
  }
}

export function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type} fixed right-4 top-20 max-w-md px-4 py-3 rounded-lg shadow-lg text-white font-semibold z-50 animate-slideInRight`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('animate-fadeOut');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

export function showAlert(title, message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} m-4 animate-slideInDown`;
  alert.innerHTML = `
    <div class="alert-title">${title}</div>
    <div class="alert-message">${message}</div>
  `;
  
  const container = document.querySelector('main') || document.body;
  container.insertBefore(alert, container.firstChild);
  
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

export async function loadPlants(categoryId) {
  showSpinner(true);
  try {
    const plants = await fetchPlantsByCategory(categoryId);
    displayPlants(plants);
  } catch (error) {
    console.error('Error loading plants:', error);
    showAlert('Error', 'Failed to load plants. Please try again.', 'error');
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
      <div class="col-span-full text-center py-12">
        <h1 class="text-center md:text-5xl font-bold text-green-600 text-2xl mb-4">
          No plants found in this category
        </h1>
        <p class="text-gray-500 text-lg">Try selecting a different category</p>
      </div>
    `;
    return;
  }

  plants.forEach((plant, index) => {
    const card = document.createElement('div');
    card.className =
      'plant-card flex flex-col justify-between shadow-md hover:shadow-2xl rounded-xl p-4 col-span-1 md:col-span-4 bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-2';
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <div class="relative overflow-hidden rounded-lg mb-3 h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center cursor-pointer group">
        <img src="${plant.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${plant.name}">
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
      </div>
      <div>
        <p class="text-lg font-bold cursor-pointer hover:text-green-600 transition-colors plant-name-link" id="plant-name-${plant.id}">${plant.name}</p>
        <p class="text-sm text-gray-600 mt-1 line-clamp-2">${plant.description || ''}</p>
      </div>
      <div class="flex justify-between items-center mt-4 mb-3">
        <span class="badge badge-primary text-xs">${plant.category || 'Plant'}</span>
        <span class="font-bold text-lg text-green-600">$${(Number(plant.price) || 0).toFixed(2)}</span>
      </div>
      <button id="cart-btn-${plant.id}" class="btn-primary w-full cart-btn">
        🛒 Add To Cart
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
      showNotification(`${plant.name} added to cart!`, 'success');
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
          showNotification('Failed to load plant details', 'error');
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
      <div class="modal-box relative max-w-lg rounded-2xl shadow-2xl border border-gray-100">
        <label for="plant-modal" class="btn btn-sm btn-circle absolute right-2 top-2 hover:bg-red-100 hover:scale-110 transition-transform">✕</label>
        <h3 class="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${plant.name}</h3>
        <img src="${plant.image}" class="w-full h-56 object-cover rounded-xl mb-4 shadow-md" alt="${plant.name}" />
        <div class="space-y-3 mb-6">
          <p><span class="font-bold text-green-600">Category:</span> ${plant.category}</p>
          <p><span class="font-bold text-green-600">Price:</span> <span class="text-2xl font-bold text-green-600">$${plant.price}</span></p>
          <p><span class="font-bold text-green-600">Description:</span> ${plant.description}</p>
        </div>
        <div class="flex gap-3 mt-6">
          <button class="btn-primary flex-1" onclick="document.getElementById('plant-modal').checked = false">Close</button>
          <button class="btn-success flex-1">Add to Cart</button>
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
    showAlert('Error', 'Failed to load categories', 'error');
  }
}

export function displayCategoryButtons(categories) {
  const categoryContainer = document.getElementById('button-container');
  if (!categoryContainer) return;

  categories.forEach((category, index) => {
    const button = document.createElement('button');
    button.textContent = category.category_name;
    button.className =
      'w-full rounded-lg category-btn text-left py-2 px-4 transition-all duration-300 hover:bg-green-100 font-medium border-2 border-transparent hover:border-green-600 animate-slideInLeft';
    button.style.animationDelay = `${index * 0.1}s`;

    button.addEventListener('click', () => {
      loadPlants(category.id);

      // Update button styles with smooth transition
      document.querySelectorAll('.category-btn').forEach((btn) => {
        btn.classList.remove('bg-green-700', 'text-white', 'border-green-700');
        btn.classList.add('bg-gray-100', 'text-gray-700', 'border-transparent');
      });

      button.classList.remove('bg-gray-100', 'text-gray-700', 'border-transparent');
      button.classList.add('bg-green-700', 'text-white', 'border-green-700');
    });

    categoryContainer.appendChild(button);
  });
}
