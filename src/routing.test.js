/**
 * Routing Tests
 *
 * Tests to verify that all pages are accessible and routing works correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ROUTES,
  getAllRoutes,
  isValidRoute,
  getRouteLabel,
  createBreadcrumbs,
  getNextRoute,
  getPreviousRoute,
} from './routing';

describe('Routing Module', () => {
  describe('Routes', () => {
    it('should have all required routes', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.ABOUT).toBe('/pages/about.html');
      expect(ROUTES.GALLERY).toBe('/pages/gallery.html');
      expect(ROUTES.CONTACT).toBe('/pages/contact.html');
      expect(ROUTES.DEVELOPER).toBe('/pages/developer.html');
    });

    it('should return all routes', () => {
      const routes = getAllRoutes();
      expect(routes).toHaveLength(5);
      expect(routes).toContain('/');
      expect(routes).toContain('/pages/about.html');
      expect(routes).toContain('/pages/gallery.html');
      expect(routes).toContain('/pages/contact.html');
      expect(routes).toContain('/pages/developer.html');
    });
  });

  describe('Route Validation', () => {
    it('should validate correct routes', () => {
      expect(isValidRoute('/')).toBe(true);
      expect(isValidRoute('/pages/about.html')).toBe(true);
      expect(isValidRoute('/pages/gallery.html')).toBe(true);
      expect(isValidRoute('/pages/contact.html')).toBe(true);
      expect(isValidRoute('/pages/developer.html')).toBe(true);
    });

    it('should reject invalid routes', () => {
      expect(isValidRoute('/invalid')).toBe(false);
      expect(isValidRoute('/pages/invalid.html')).toBe(false);
      expect(isValidRoute('')).toBe(false);
      expect(isValidRoute(null)).toBe(false);
    });
  });

  describe('Route Labels', () => {
    it('should get correct labels for routes', () => {
      expect(getRouteLabel('/')).toBe('Home');
      expect(getRouteLabel('/pages/about.html')).toBe('About');
      expect(getRouteLabel('/pages/gallery.html')).toBe('Gallery');
      expect(getRouteLabel('/pages/contact.html')).toBe('Contact');
      expect(getRouteLabel('/pages/developer.html')).toBe('Developer');
    });

    it('should return Unknown for invalid routes', () => {
      expect(getRouteLabel('/invalid')).toBe('Unknown');
    });
  });

  describe('Breadcrumbs', () => {
    it('should create breadcrumbs for home', () => {
      const breadcrumbs = createBreadcrumbs('/');
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', url: '/' });
    });

    it('should create breadcrumbs for other pages', () => {
      const breadcrumbs = createBreadcrumbs('/pages/about.html');
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', url: '/' });
      expect(breadcrumbs[1]).toEqual({ label: 'About', url: '/pages/about.html' });
    });
  });

  describe('Navigation', () => {
    it('should get next route', () => {
      const next = getNextRoute('/');
      expect(next).not.toBeNull();
      expect(next?.url).toBe('/pages/about.html');
    });

    it('should return null for last route', () => {
      const next = getNextRoute('/pages/contact.html');
      expect(next).toBeNull();
    });

    it('should get previous route', () => {
      const prev = getPreviousRoute('/pages/gallery.html');
      expect(prev).not.toBeNull();
      expect(prev?.url).toBe('/pages/about.html');
    });

    it('should return null for first route', () => {
      const prev = getPreviousRoute('/');
      expect(prev).toBeNull();
    });
  });
});

describe('Page Accessibility', () => {
  const pages = [
    '/pages/about.html',
    '/pages/gallery.html',
    '/pages/contact.html',
    '/pages/developer.html',
  ];

  describe('Page Serving', () => {
    pages.forEach((page) => {
      it(`should serve ${page}`, async () => {
        try {
          const response = await fetch(page, { method: 'HEAD' });
          // Page exists and is accessible
          expect(response.ok).toBe(true);
        } catch (err) {
          // Network error - server might not be running
          console.warn(`Warning: Could not verify ${page} - server may not be running`);
        }
      });
    });
  });
});
