import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/main.css';
import { fetchCategories, fetchPlantsByCategory } from './api.js';

function formatPrice(p) {
  const n = Number(p) || 0;
  return n.toFixed(2);
}

function useCart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // persist in localStorage
    const raw = localStorage.getItem('cart_items');
    if (raw) setItems(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  function add(item) {
    setItems((s) => [...s, item]);
  }
  function remove(index) {
    setItems((s) => s.filter((_, i) => i !== index));
  }
  function clear() {
    setItems([]);
  }
  function total() {
    return items.reduce(
      (sum, it) => sum + Number(it.price || 0) * (it.quantity || 1),
      0
    );
  }
  return { items, add, remove, clear, total };
}

function GalleryApp() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [error, setError] = useState(null);
  const cart = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    setCatLoading(true);
    setError(null);
    fetchCategories()
      .then((cats) => {
        if (!cats || cats.length === 0) {
          setError('No categories available');
        }
        setCategories(cats);
      })
      .catch((err) => {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
        setCategories([]);
      })
      .finally(() => setCatLoading(false));
  }, []);

  // Fetch all plants across categories (de-duplicated)
  async function fetchAllPlants() {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        categories.map((c) => fetchPlantsByCategory(c.id))
      );
      // flatten and dedupe by id
      const flat = results.flat();
      const map = new Map();
      flat.forEach((p) => {
        if (p && p.id) map.set(p.id, p);
      });
      const deduped = Array.from(map.values());
      if (deduped.length === 0) {
        setError('No plants found');
      }
      setPlants(deduped);
    } catch (e) {
      console.error('Failed to fetch all plants', e);
      setError('Failed to load plants');
      setPlants([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    fetchPlantsByCategory(selected)
      .then((p) => {
        if (!p || p.length === 0) {
          setError('No plants in this category');
        }
        setPlants(p || []);
      })
      .catch((err) => {
        console.error('Error loading plants:', err);
        setError('Failed to load plants');
        setPlants([]);
      })
      .finally(() => setLoading(false));
  }, [selected]);

  useEffect(() => {
    // Initialize with first category
    if (categories.length > 0 && !selected) setSelected(categories[0].id);
  }, [categories]);

  async function handleCheckout() {
    if (cart.items.length === 0) {
      alert('Cart is empty');
      return;
    }

    setIsCheckingOut(true);

    const payloadItems = cart.items.map((it) => ({
      name: it.name || 'Plant',
      description: it.description || '',
      unit_amount: Math.round(Math.max(0, Number(it.price) || 0) * 100),
      quantity: Math.max(1, it.quantity || 1),
      currency: (it.currency || 'usd').toLowerCase(),
    }));

    try {
      const serverBase = window.SERVER_BASE || 'http://localhost:4242';
      const res = await fetch(`${serverBase}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const text = await res.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid server response');
      }

      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL provided');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(`Checkout failed: ${err.message || 'Unknown error'}`);
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className="md:col-span-2">
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6 z-40 border border-gray-100">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            🏷️ Categories</h2>
          <div className="flex flex-col gap-2">
            {catLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-red-600 p-4 bg-red-50 rounded-lg">
                Unable to load categories. Please refresh the page.
              </div>
            ) : (
              categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full rounded-lg text-left py-3 px-4 font-semibold transition-all duration-200 transform hover:scale-105 ${selected === c.id ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {c.category_name}
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      <section className="md:col-span-7">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {categories.find((x) => x.id === selected)?.category_name ||
                'Gallery'}
            </h1>
            <button
              key="all"
              onClick={() => {
                setSelected('all');
                fetchAllPlants();
              }}
              className={`rounded-full py-2 px-6 font-semibold transition-all transform hover:scale-105 whitespace-nowrap ${selected === 'all' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              🌳 All Trees
            </button>
          </div>

          {error ? (
            <div className="py-16 text-center">
              <div className="inline-block bg-red-50 border-2 border-red-300 rounded-xl p-6 shadow-lg">
                <p className="text-red-600 font-semibold mb-4 text-lg">
                  ⚠️ Failed to load plants
                </p>
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    if (selected && selected !== 'all') {
                      setLoading(true);
                      fetchPlantsByCategory(selected)
                        .then((p) => setPlants(p))
                        .catch(() => setPlants([]))
                        .finally(() => setLoading(false));
                    } else {
                      fetchAllPlants();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full transition-all transform hover:scale-105"
                >
                  🔄 Retry
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="py-16 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-green-600 mb-4"></div>
                <p className="text-gray-600 font-medium">
                  🌱 Loading amazing plants...
                </p>
              </div>
            </div>
          ) : plants.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-500 text-lg">
                No plants found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:transform hover:scale-105 border border-gray-100 flex flex-col"
                >
                  <div className="relative h-40 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                    {plant.image ? (
                      <img
                        src={plant.image}
                        alt={plant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-5xl group-hover:scale-125 transition-transform duration-300">🌿</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {plant.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {plant.description ||
                        'A beautiful plant for your garden.'}
                    </p>
                    <div className="flex items-center justify-between mb-4 mt-auto">
                      <span className="text-2xl font-bold text-green-600">
                        ${formatPrice(plant.price)}
                      </span>
                      {plant.stock && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
                          In Stock
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => cart.add(plant)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <aside className="md:col-span-3">
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20 z-40 border border-gray-100 max-h-screen overflow-y-auto">
          <h3 className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            🛒 Your Cart</h3>
          {cart.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-3">
              {cart.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{it.name}</div>
                    <div className="text-sm text-gray-600">
                      ${Number(it.price).toFixed(2)} × {it.quantity || 1}
                    </div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 font-bold hover:scale-110 transition-transform"
                    onClick={() => cart.remove(idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="border-t-2 border-green-200 pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg mb-4 text-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                  <span>Total:</span>
                  <span className="text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
                    ${cart.total().toFixed(2)}
                  </span>
                </div>
                <button
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? '⏳ Processing...' : '🛍️ Checkout'}
                </button>
                <button
                  className="w-full border-2 border-gray-300 text-gray-700 hover:text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all hover:border-gray-400 hover:bg-gray-50"
                  onClick={() => cart.clear()}
                >
                  🗑️ Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h3 className="font-bold text-lg text-green-700 mb-3">
            🌱 Why Plant Trees?
          </h3>
          <ul className="text-sm text-gray-700 space-y-2 font-medium">
            <li>🌍 Absorbs CO₂ from the atmosphere</li>
            <li>🦅 Provides habitat for wildlife</li>
            <li>🏜️ Prevents soil erosion</li>
            <li>💨 Improves air quality</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

const root = createRoot(document.getElementById('gallery-root'));
root.render(<GalleryApp />);
