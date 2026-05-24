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
  const [showDebug, setShowDebug] = useState(false);

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
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className="md:col-span-2">
        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Categories</h2>
          <div className="flex flex-col gap-2">
            {catLoading ? (
              <div className="flex justify-center py-6">
                <div
                  className="spinner"
                  role="status"
                  aria-label="Loading categories"
                ></div>
              </div>
            ) : (
              categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full rounded-lg text-left py-2 px-3 transition-colors ${selected === c.id ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {c.category_name}
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      <section className="md:col-span-7">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-green-600">
            {categories.find((x) => x.id === selected)?.category_name ||
              'Gallery'}
          </h1>
           <div className="flex items-start gap-3">
             <button
               key="all"
               onClick={() => {
                 setSelected('all');
                 fetchAllPlants();
               }}
               className={`w-full rounded-lg text-left py-2 px-3 transition-colors ${selected === 'all' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'}`}
             >
               All Trees
             </button>
           </div>

         {error ? (
           <div className="py-16 text-center text-red-600">
             <p>Failed to load plants. Please try again later.</p>
             <button
               onClick={() => {
                 setError(null);
                 if (selected) {
                   setLoading(true);
                   fetchPlantsByCategory(selected)
                     .then((p) => setPlants(p))
                     .catch(() => setPlants([]))
                     .finally(() => setLoading(false));
                 } else {
                   fetchAllPlants();
                 }
               }}
               className="btn btn-outline mt-4"
             >
               Retry
             </button>
           </div>
          ) : (
            <div className="py-16 text-center">Loading…</div>
          )}
        </div>
       </section>

      <aside className="md:col-span-3">
        <div className="bg-white rounded-lg shadow-lg p-4 sticky top-6">
          <h3 className="font-semibold text-green-700 mb-2">Your Cart</h3>
          {cart.items.length === 0 ? (
            <p className="text-gray-500">Cart is empty</p>
          ) : (
            <div className="space-y-2">
              {cart.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-sm text-gray-600">
                      ${Number(it.price).toFixed(2)} × {it.quantity}
                    </div>
                  </div>
                  <button
                    className="text-red-500"
                    onClick={() => cart.remove(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold mb-3">
                  {' '}
                  <span>Total</span> <span>${cart.total().toFixed(2)}</span>
                </div>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleCheckout}
                >
                  Checkout
                </button>
                <button
                  className="btn btn-ghost w-full mt-2"
                  onClick={() => cart.clear()}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-700 mb-2">
            Why Plant Trees?
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Absorbs CO₂ from the atmosphere</li>
            <li>• Provides habitat for wildlife</li>
            <li>• Prevents soil erosion</li>
            <li>• Improves air quality</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

const root = createRoot(document.getElementById('gallery-root'));
root.render(<GalleryApp />);
