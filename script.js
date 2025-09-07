// Green Earth – Vanilla JS logic
const API = {
  ALL: 'https://openapi.programming-hero.com/api/plants',
  CATS: 'https://openapi.programming-hero.com/api/categories',
  BY_CAT: (id) => `https://openapi.programming-hero.com/api/category/${id}`,
  DETAILS: (id) => `https://openapi.programming-hero.com/api/plant/${id}`,
};

// State
let state = {
  plants: [],       // currently shown plants
  categories: [],
  activeCategoryId: null,
  cart: [],         // array of {id, name, price}
};

// DOM helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const cardGrid = $('#card-grid');
const categoryList = $('#category-list');
const spinner = $('#spinner');
const cartCount = $('#cart-count');
const cartList = $('#cart-list');
const cartTotal = $('#cart-total');
const detailsModal = $('#details-modal');
const detailsContent = $('#details-content');
const cartModal = $('#cart-modal');

// Utils
const currency = (n) => (Number(n) || 0).toFixed(2);
const show = (el) => el.classList.remove('hidden');
const hide = (el) => el.classList.add('hidden');

// Theme toggle
(() => {
  const input = $('#theme-toggle');
  const root = document.documentElement;
  input.addEventListener('change', () => {
    document.documentElement.setAttribute('data-theme', input.checked ? 'dark' : 'light');
  });
})();

// Footer year
$('#year').textContent = new Date().getFullYear();

// Fetch with spinner
async function withSpinner(fn) {
  show(spinner);
  try {
    return await fn();
  } finally {
    hide(spinner);
  }
}

// Load categories
async function loadCategories() {
  const res = await fetch(API.CATS);
  const data = await res.json();
  state.categories = data?.categories || data?.data || [];
  renderCategories();
}

// Render categories as vertical buttons
function renderCategories() {
  categoryList.innerHTML = '';
  const makeBtn = (cat) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm lg:btn-md w-full btn-ghost justify-start';
    btn.dataset.id = cat.id || cat.category_id || cat._id || '';
    btn.textContent = cat.name || cat.category || 'Unknown';
    if (String(state.activeCategoryId) === String(btn.dataset.id)) {
      btn.classList.add('btn-active');
    }
    btn.addEventListener('click', () => onCategoryClick(btn.dataset.id, btn));
    return btn;
  };

  // When categories may be nested in different shapes
  state.categories.forEach(cat => categoryList.appendChild(makeBtn(cat)));
}

// Category click
async function onCategoryClick(id, buttonEl) {
  state.activeCategoryId = id;
  $$('#category-list .btn').forEach(b => b.classList.remove('btn-active'));
  if (buttonEl) buttonEl.classList.add('btn-active');
  await withSpinner(async () => {
    const res = await fetch(API.BY_CAT(id));
    const data = await res.json();
    const list = data?.plants || data?.data || [];
    state.plants = list;
    renderCards();
  });
}

// Load all plants
async function loadAllPlants() {
  await withSpinner(async () => {
    const res = await fetch(API.ALL);
    const data = await res.json();
    const list = data?.plants || data?.data || [];
    state.plants = list;
    renderCards();
  });
}

// Render cards
function renderCards() {
  cardGrid.innerHTML = '';
  if (!state.plants?.length) {
    cardGrid.innerHTML = '<div class="col-span-full text-center opacity-70">No plants found.</div>';
    return;
  }
  state.plants.forEach(p => {
    const id = p.id || p.plantId || p._id || p?.plant_id || p?.id;
    const name = p.name || p.plant_name || 'Unknown Plant';
    const img = p.image || p.img || p.thumbnail || 'https://images.unsplash.com/photo-1476887334197-56adbf254e1a?q=80&w=1200&auto=format&fit=crop';
    const desc = (p.description || p.short_description || 'Beautiful, eco-friendly plant.').toString();
    const category = p.category || p.category_name || 'General';
    const price = Number(p.price ?? p.cost ?? 0);

    const card = document.createElement('div');
    card.className = 'card bg-base-100 shadow rounded-2xl';
    card.innerHTML = `
      <figure class="aspect-[4/3] overflow-hidden">
        <img src="${img}" alt="${name}" class="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.03]" />
      </figure>
      <div class="card-body">
        <h3 class="card-title text-lg">
          <button class="link text-primary font-bold plant-name" data-id="${id}">${name}</button>
        </h3>
        <p class="text-sm opacity-80">${desc.length > 110 ? desc.slice(0, 110) + '…' : desc}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="badge badge-outline">${category}</span>
          <span class="font-semibold">$${currency(price)}</span>
        </div>
        <div class="card-actions justify-end mt-4">
          <button class="btn btn-sm btn-success text-white add-to-cart" data-id="${id}" data-name="${name}" data-price="${price}">Add to Cart</button>
        </div>
      </div>
    `;
    cardGrid.appendChild(card);
  });
}

// Delegated handlers for card actions
cardGrid.addEventListener('click', async (e) => {
  const nameBtn = e.target.closest('.plant-name');
  const addBtn = e.target.closest('.add-to-cart');

  if (nameBtn) {
    const id = nameBtn.dataset.id;
    await openDetails(id);
  }
  if (addBtn) {
    const { id, name, price } = addBtn.dataset;
    addToCart({ id, name, price: Number(price) });
  }
});

// Open details modal
async function openDetails(id) {
  await withSpinner(async () => {
    const res = await fetch(API.DETAILS(id));
    const data = await res.json();
    const p = data?.plant || data?.data || data || {};
    const name = p.name || p.plant_name || 'Unknown Plant';
    const img = p.image || p.img || 'https://images.unsplash.com/photo-1476887334197-56adbf254e1a?q=80&w=1200&auto=format&fit=crop';
    const desc = p.description || p.details || 'No description available.';
    const category = p.category || 'General';
    const price = Number(p.price ?? 0);
    const stock = p.stock ?? '—';
    const rating = p.rating ?? '—';

    detailsContent.innerHTML = \`
      <div class="grid md:grid-cols-2 gap-6 items-start">
        <img class="rounded-xl shadow" src="\${img}" alt="\${name}">
        <div class="space-y-2">
          <h3 class="text-2xl font-bold">\${name}</h3>
          <div class="flex gap-2 items-center">
            <span class="badge badge-outline">\${category}</span>
            <span class="badge">⭐ \${rating}</span>
            <span class="badge">Stock: \${stock}</span>
          </div>
          <p class="opacity-80">\${desc}</p>
          <div class="text-xl font-semibold pt-2">$ \${currency(price)}</div>
          <button class="btn btn-success text-white" id="details-add" data-id="\${p.id || p.plantId || id}" data-name="\${name}" data-price="\${price}">Add to Cart</button>
        </div>
      </div>
    \`;
  });
  detailsModal.showModal();
}

// Add from details
detailsContent.addEventListener('click', (e) => {
  const btn = e.target.closest('#details-add');
  if (btn) {
    const { id, name, price } = btn.dataset;
    addToCart({ id, name, price: Number(price) });
  }
});

// Cart logic
function addToCart(item) {
  state.cart.push(item);
  updateCartUI();
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  cartCount.textContent = state.cart.length;
  cartList.innerHTML = '';

  let total = 0;
  state.cart.forEach((it, idx) => {
    total += Number(it.price) || 0;
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-base-200 rounded-xl p-3';
    li.innerHTML = \`
      <div class="flex items-center gap-3">
        <span class="text-lg">🌱</span>
        <div>
          <div class="font-medium">\${it.name}</div>
          <div class="text-sm opacity-70">$ \${currency(it.price)}</div>
        </div>
      </div>
      <button class="btn btn-xs btn-error text-white remove-item" data-index="\${idx}">❌</button>
    \`;
    cartList.appendChild(li);
  });

  cartTotal.textContent = currency(total);
}

// Remove item (delegated)
cartList.addEventListener('click', (e) => {
  const btn = e.target.closest('.remove-item');
  if (btn) {
    const idx = Number(btn.dataset.index);
    removeFromCart(idx);
  }
});

// Clear cart
$('#clear-cart').addEventListener('click', () => {
  state.cart = [];
  updateCartUI();
});

// Open cart modal
$('#open-cart').addEventListener('click', () => cartModal.showModal());

// Search filter (client-side by name)
$('#search-input').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  const filtered = state.plants.filter(p => (p.name || p.plant_name || '').toLowerCase().includes(q));
  const backup = state.plants;
  state.plants = filtered;
  renderCards();
  state.plants = backup; // keep original
});

// Reset & Refresh handlers
$('#reset-categories').addEventListener('click', async () => {
  state.activeCategoryId = null;
  $$('#category-list .btn').forEach(b => b.classList.remove('btn-active'));
  await loadAllPlants();
});

$('#refresh-all').addEventListener('click', async () => {
  if (state.activeCategoryId) {
    await onCategoryClick(state.activeCategoryId);
  } else {
    await loadAllPlants();
  }
});

// Initial load
(async function init() {
  await loadCategories();
  await loadAllPlants();
})();