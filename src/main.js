import './theme.css';

// Verify routes are accessible (for debugging)
// eslint-disable-next-line no-console
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Check if pages are loading correctly
  const pages = [
    '/pages/about.html',
    '/pages/gallery.html',
    '/pages/contact.html',
    '/pages/developer.html',
  ];
  pages.forEach((page) => {
    fetch(page, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          // eslint-disable-next-line no-console
          console.log(`✓ Page accessible: ${page}`);
        } else {
          // eslint-disable-next-line no-console
          console.warn(`✗ Page not accessible: ${page} (${res.status})`);
        }
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.warn(`✗ Failed to verify ${page}: ${err.message}`));
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Payment / donation logic centralized here (used by contact page)
const donationForm = document.getElementById('donation-form');
if (donationForm) {
  donationForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Client-side validation
    const requiredFields = donationForm.querySelectorAll('input[required], select[required]');
    let isValid = true;
    requiredFields.forEach((field) => {
      if (!field.value || !field.value.toString().trim()) {
        field.classList.add('border-red-500');
        isValid = false;
      } else {
        field.classList.remove('border-red-500');
      }
    });
    if (!isValid) {
      window.alert('Please fill in all required fields.');
      return;
    }

    // Determine amount from total-amount input
    const totalAmountInput = document.getElementById('total-amount');
    let amountCents = 0;
    if (totalAmountInput && totalAmountInput.value) {
      const numeric = parseFloat(totalAmountInput.value.replace(/[^0-9.]/g, '')) || 0;
      amountCents = Math.round(numeric * 100);
    }
    if (!amountCents || amountCents <= 0) {
      window.alert('Please select a donation amount.');
      return;
    }

    // Create checkout session on server
    try {
      const res = await fetch('http://localhost:4242/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountCents }),
      });
      const data = await res.json();
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Invalid response from server', data);
        window.alert('Payment initiation failed.');
      }
    } catch (err) {
      console.error(err);
      window.alert('Payment initiation failed.');
    }
  });
}

// Update total amount when tree count changes (only on contact page)
const treeCountSelect = document.getElementById('tree-count');
if (treeCountSelect) {
  treeCountSelect.addEventListener('change', function () {
    const treeCount = parseInt(this.value, 10);
    let amount = 0;
    /* eslint-disable indent */
    switch (treeCount) {
    case 1:
      amount = 25;
      break;
    case 5:
      amount = 100;
      break;
    case 10:
      amount = 200;
      break;
    case 25:
      amount = 500;
      break;
    case 50:
      amount = 1000;
      break;
    case 100:
      amount = 2000;
      break;
    default:
      amount = 0;
    }
    /* eslint-enable indent */
    const totalAmount = document.getElementById('total-amount');
    if (totalAmount) totalAmount.value = amount > 0 ? `$${amount}` : '';
  });
}

// Donation selection helper used by buttons
window.selectDonation = function (amount, trees) {
  const treeCountSelect = document.getElementById('tree-count');
  const totalAmount = document.getElementById('total-amount');
  const donateForm = document.getElementById('donate-form');
  if (treeCountSelect) treeCountSelect.value = trees;
  if (totalAmount) totalAmount.value = `$${amount}`;
  if (donateForm) donateForm.scrollIntoView({ behavior: 'smooth' });
};
