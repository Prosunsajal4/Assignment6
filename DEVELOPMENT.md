# 🚀 Development Guide

Comprehensive guide for developing and extending Green Earth.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Project Architecture](#project-architecture)
3. [Code Organization](#code-organization)
4. [Development Workflow](#development-workflow)
5. [Common Patterns](#common-patterns)
6. [Debugging](#debugging)
7. [Performance](#performance)
8. [Deployment](#deployment)

## Environment Setup

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd Assignment6

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Verify setup
npm run lint
npm run test
```

### VS Code Extensions

Recommended extensions:

- ESLint
- Prettier - Code formatter
- React DevTools
- Tailwind CSS IntelliSense
- Thunder Client (API testing)

## Project Architecture

### Frontend Architecture

```
React App
├── Error Boundary (ErrorBoundary.jsx)
├── Router/Layout
├── Pages
│   ├── Home (index.html)
│   ├── About (pages/about.html)
│   ├── Gallery (pages/gallery.html)
│   ├── Contact (pages/contact.html)
│   └── Developer (pages/developer.html)
└── Shared Resources
    ├── Utilities (utils.js)
    ├── Hooks (hooks.js)
    ├── Constants (constants.js)
    └── Services (logger, validation, etc.)
```

### Backend Architecture

```
Express Server (server.js)
├── Routes
│   ├── /api/trees
│   ├── /api/donations
│   └── /api/contact
├── Middleware
│   ├── CORS
│   ├── Error handling
│   └── Logging
└── Services
    ├── Stripe integration
    └── Email service
```

### Data Flow

```
User Interaction
  ↓
React Component
  ↓
Custom Hook / Utility
  ↓
HTTP Client
  ↓
Backend API
  ↓
Response Handler
  ↓
State Update
  ↓
UI Render
```

## Code Organization

### Directory Structure

```
src/
├── components/        # React components (future)
├── pages/            # Page components
├── hooks/            # Custom hooks
├── utils/            # Utility functions
├── constants.js      # Global constants
├── logger.js         # Logging utility
├── validation.js     # Form validation
├── httpClient.js     # API client
├── storage.js        # Storage management
├── accessibility.js  # A11y utilities
├── performance.js    # Performance monitoring
├── security.js       # Security config
└── ErrorBoundary.jsx # Error handling
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `MyComponent.jsx` |
| Hooks | useXxx | `useFetch()` |
| Functions | camelCase | `formatDate()` |
| Constants | UPPER_SNAKE_CASE | `API_URL` |
| Files | camelCase or PascalCase | `utils.js`, `Gallery.jsx` |
| CSS Classes | kebab-case | `btn-primary` |

## Development Workflow

### Starting Development

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run start-server

# Open browser at http://localhost:3000
```

### Making Changes

1. **Create branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Edit files in `src/`
   - Changes auto-reload (HMR)

3. **Check quality**
   ```bash
   npm run lint      # Check for issues
   npm run format    # Format code
   npm run test      # Run tests
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

### Hot Module Replacement (HMR)

- Changes to `src/` files auto-reload
- Component state is preserved
- Styles update instantly
- No manual refresh needed

## Common Patterns

### Adding a Utility Function

```javascript
// src/utils.js
/**
 * Format price with currency
 * @param {number} amount - Price amount
 * @returns {string} Formatted price
 */
export function formatPrice(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

// Using it
import { formatPrice } from '@/utils';
const price = formatPrice(19.99); // "$19.99"
```

### Adding a Custom Hook

```javascript
// src/hooks.js
export function useMyFeature() {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup
    };
  }, []);

  return { state, setState };
}

// Using it
import { useMyFeature } from '@/hooks';
function MyComponent() {
  const { state } = useMyFeature();
  return <div>{state}</div>;
}
```

### Fetching Data

```javascript
import { useFetch } from '@/hooks';

function Gallery() {
  const { data: trees, loading, error } = useFetch('/api/trees');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading trees</div>;

  return (
    <div>
      {trees.map((tree) => (
        <div key={tree.id}>{tree.name}</div>
      ))}
    </div>
  );
}
```

### Using Local Storage

```javascript
import { useLocalStorage } from '@/hooks';

function Cart() {
  const [items, setItems] = useLocalStorage('cart', []);

  const addItem = (item) => {
    setItems((prev) => [...prev, item]);
  };

  return (
    <div>
      <button onClick={() => addItem(item)}>Add to Cart</button>
    </div>
  );
}
```

### Form Validation

```javascript
import { validateEmail, validateRequired } from '@/validation';

function ContactForm() {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (validateRequired(name, 'Name')) {
      newErrors.name = 'Name is required';
    }

    if (validateEmail(email)) {
      newErrors.email = validateEmail(email);
    }

    setErrors(newErrors);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} />
      {errors.name && <span>{errors.name}</span>}
    </form>
  );
}
```

### Error Handling

```javascript
import ErrorBoundary from '@/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MainContent />
    </ErrorBoundary>
  );
}
```

### Logging

```javascript
import { logger } from '@/logger';

logger.debug('Debug message', data);
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
logger.performance('Operation', duration);
```

### Performance Monitoring

```javascript
import { performanceMonitor } from '@/performance';

performanceMonitor.startTimer('fetch');
// ... do work
performanceMonitor.endTimer('fetch');

performanceMonitor.trackEvent('user_clicked_button', {
  buttonId: 'donate-btn',
});
```

### Accessibility

```javascript
import { createFormFieldA11y } from '@/accessibility';

function FormField() {
  const a11yAttrs = createFormFieldA11y('email', 'Email', true);

  return <input {...a11yAttrs} placeholder="Email" />;
}
```

## Debugging

### Debug Mode

Enable debugging in `.env.local`:

```env
VITE_ENABLE_DEBUG=true
```

Then check console for detailed logs.

### Browser DevTools

1. **React DevTools**
   - Inspect components
   - Check props and state
   - Profile performance

2. **Network Tab**
   - Monitor API calls
   - Check request/response
   - Analyze loading times

3. **Console**
   - View logs
   - Execute code
   - Test functions

### Common Issues

**HMR not working**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**Linting errors**
```bash
npm run lint -- --fix  # Auto-fix issues
```

**Test failures**
```bash
npm run test -- --watch  # Debug in watch mode
```

## Performance

### Optimization Tips

1. **Code Splitting**
   - Use dynamic imports
   - Lazy load components
   - Split routes

2. **Memoization**
   ```javascript
   import { useMemo, useCallback } from 'react';

   const memoizedValue = useMemo(() => {
     return expensiveComputation(a, b);
   }, [a, b]);

   const memoizedFn = useCallback(() => {
     doSomething(a, b);
   }, [a, b]);
   ```

3. **Debouncing & Throttling**
   ```javascript
   import { debounce, throttle } from '@/utils';

   const debouncedSearch = debounce((query) => {
     // search API call
   }, 300);
   ```

4. **Image Optimization**
   - Use modern formats (WebP)
   - Lazy load images
   - Responsive images

### Measuring Performance

```bash
# Build analysis
npm run build

# Check bundle size
ls -lh dist/assets/
```

## Deployment

### Build for Production

```bash
npm run build
# Output in: dist/
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### Deploy to Other Platforms

1. **GitHub Pages**
   ```bash
   npm run build
   # Push dist/ to gh-pages branch
   ```

2. **Netlify**
   - Connect repository
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Custom Server**
   ```bash
   npm run build
   # Copy dist/ to server
   # Configure web server to serve index.html
   ```

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] No ESLint errors
- [ ] Build succeeds
- [ ] Bundle size acceptable
- [ ] Environment variables set
- [ ] Security headers configured

---

Happy developing! 🚀
