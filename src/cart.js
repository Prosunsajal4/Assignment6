// Cart management
/**
 * Cart class for managing plant purchases
 * Handles adding/removing items, calculating totals, and UI updates
 */
class Cart {
  /**
   * Initialize an empty cart
   */
  constructor() {
    this.items = [];
    this.totalPrice = 0;
  }

  /**
   * Add a plant item to the cart
   * @param {Object} plant - Plant object with id, name, price, description
   * @returns {void}
   */
  addItem(plant) {
    this.items.push(plant);
    this.totalPrice += plant.price;
    this.updateUI();
  }

  /**
   * Remove an item from the cart by index
   * @param {number} index - Index of the item to remove
   * @returns {void}
   */
  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.totalPrice -= this.items[index].price;
      this.items.splice(index, 1);
      this.updateUI();
    }
  }

  /**
   * Get all items currently in the cart
   * @returns {Array} Array of plant items
   */
  getItems() {
    return this.items;
  }

  /**
   * Get the total price of all items in the cart
   * @returns {number} Total price in dollars
   */
  getTotalPrice() {
    return this.totalPrice;
  }

  /**
   * Clear all items from the cart
   * @returns {void}
   */
  clear() {
    this.items = [];
    this.totalPrice = 0;
    this.updateUI();
  }

  /**
   * Update the DOM to reflect current cart state
   * Renders cart items, total price, and action buttons
   * Guards against execution in non-browser environments
   * @returns {void}
   */
  updateUI() {
    // Guard against document being undefined in test/node environments
    if (typeof document === 'undefined') return;

    const cartContainer = document.querySelector('.cart-container');
    if (!cartContainer) return;

    cartContainer.innerHTML =
      '<h1 class="text-2xl font-bold text-left px-2 my-3">Your Cart</h1>';

    if (this.items.length === 0) {
      cartContainer.innerHTML += '<p class="px-2">Cart is empty</p>';
      return;
    }

    this.items.forEach((plant, index) => {
      const div = document.createElement('div');
      div.className =
        'bg-green-50 rounded-md p-2 my-1 flex justify-between items-center mx-4';
      div.innerHTML = `
        <div class="flex items-center justify-between gap-8 w-full">
          <div>
            <span class="font-semibold">${plant.name}</span><br>
            <span class="text-sm text-gray-600">$${(Number(plant.price) || 0).toFixed(2)} × ${plant.quantity || 1}</span>
          </div>
          <div>
            <button class="text-gray-700 font-bold remove-btn hover:text-red-600 transition-colors">X</button>
          </div>
        </div>
      `;

      div.querySelector('.remove-btn').addEventListener('click', () => {
        this.removeItem(index);
      });

      cartContainer.appendChild(div);
    });

    const totalDiv = document.createElement('div');
    totalDiv.className =
      'flex flex-col gap-2 mt-4 p-4 border-t border-gray-100';

    const row = document.createElement('div');
    row.className = 'flex justify-between items-center font-semibold';
    row.innerHTML = `<span>Total:</span> <span>$${Number(this.getTotalPrice() || 0).toFixed(2)}</span>`;
    totalDiv.appendChild(row);

    const actions = document.createElement('div');
    actions.className = 'flex gap-2 mt-3';

    const checkoutBtn = document.createElement('button');
    checkoutBtn.className = 'btn btn-primary w-full';
    checkoutBtn.textContent = 'Checkout';
    checkoutBtn.addEventListener('click', async () => {
      if (this.items.length === 0) return;

      // Build items payload for server (unit_amount in cents)
      const payloadItems = this.items.map((it) => ({
        name: it.name,
        description: it.description || '',
        unit_amount: Math.round(
          parseFloat(String(it.price).replace(/[^0-9.]/g, '')) * 100
        ),
        quantity: it.quantity || 1,
        currency: it.currency || 'usd',
      }));

      const serverBase = window.SERVER_BASE || 'http://localhost:4242';

      try {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Redirecting...';

        const res = await fetch(`${serverBase}/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: payloadItems }),
        });

        // Read response as text to safely handle non-JSON errors
        const text = await res.text();
        if (!res.ok) {
          console.error('Checkout server error', res.status, text);
          window.alert('Failed to start checkout (server error).');
          checkoutBtn.disabled = false;
          checkoutBtn.textContent = 'Checkout';
          return;
        }

        let data;
        try {
          data = JSON.parse(text || '{}');
        } catch (parseErr) {
          console.error(
            'Invalid JSON from create-checkout-session:',
            parseErr,
            text
          );
          window.alert('Failed to start checkout (invalid server response).');
          checkoutBtn.disabled = false;
          checkoutBtn.textContent = 'Checkout';
          return;
        }

        if (data && data.url) {
          window.location.href = data.url;
        } else {
          console.error('Checkout failed', data, text);
          window.alert('Failed to start checkout.');
          checkoutBtn.disabled = false;
          checkoutBtn.textContent = 'Checkout';
        }
      } catch (err) {
        console.error('Network error starting checkout', err);
        window.alert('Failed to start checkout (network error).');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Checkout';
      }
    });

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-ghost w-full';
    clearBtn.textContent = 'Clear Cart';
    clearBtn.addEventListener('click', () => this.clear());

    actions.appendChild(checkoutBtn);
    actions.appendChild(clearBtn);
    totalDiv.appendChild(actions);

    cartContainer.appendChild(totalDiv);
  }
}

export const cart = new Cart();
