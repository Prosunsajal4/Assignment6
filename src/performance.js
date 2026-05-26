/**
 * Performance Monitoring & Analytics
 * Track app performance and user interactions
 */

import { logger } from './logger.js';
import { FEATURE_FLAGS } from './constants.js';

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.eventLog = [];
    this.enabled = FEATURE_FLAGS.ENABLE_PERFORMANCE_MONITORING;
  }

  /**
   * Start timing a task
   */
  startTimer(label) {
    if (!this.enabled) return;

    this.metrics[label] = {
      startTime: performance.now(),
      startMark: `${label}-start`,
    };

    performance.mark(this.metrics[label].startMark);
  }

  /**
   * End timing and log result
   */
  endTimer(label) {
    if (!this.enabled || !this.metrics[label]) return;

    const metric = this.metrics[label];
    const endMark = `${label}-end`;
    performance.mark(endMark);

    try {
      performance.measure(label, metric.startMark, endMark);
      const measure = performance.getEntriesByName(label)[0];
      const duration = Math.round(measure.duration * 100) / 100;

      logger.performance(label, duration);

      return {
        label,
        duration,
        startTime: metric.startTime,
        endTime: performance.now(),
      };
    } catch (error) {
      logger.error(`Performance measurement failed: ${label}`, error);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName, eventData = {}) {
    if (!this.enabled) return;

    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      data: eventData,
      userAgent: navigator.userAgent,
    };

    this.eventLog.push(event);
    logger.debug(`Event tracked: ${eventName}`, eventData);
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals() {
    if (!this.enabled) return null;

    const vitals = {
      LCP: null, // Largest Contentful Paint
      FID: null, // First Input Delay (deprecated, use INP)
      CLS: null, // Cumulative Layout Shift
      INP: null, // Interaction to Next Paint
    };

    // Try to get PerformanceObserver data
    try {
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'largest-contentful-paint') {
              vitals.LCP = entry.renderTime || entry.loadTime;
            }
            if (entry.name === 'first-input') {
              vitals.FID = entry.processingDuration;
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              vitals.CLS = (vitals.CLS || 0) + entry.value;
            }
            if (entry.entryType === 'event' && entry.name === 'pointerdown') {
              vitals.INP = entry.duration;
            }
          }
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'event'] });
      }
    } catch (error) {
      logger.error('Error getting Web Vitals', error);
    }

    return vitals;
  }

  /**
   * Get page load metrics
   */
  getPageLoadMetrics() {
    if (!this.enabled) return null;

    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (!navigation) return null;

      return {
        dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
        tcp: Math.round(navigation.connectEnd - navigation.connectStart),
        ttfb: Math.round(navigation.responseStart - navigation.requestStart),
        download: Math.round(navigation.responseEnd - navigation.responseStart),
        domInteractive: Math.round(navigation.domInteractive - navigation.fetchStart),
        domComplete: Math.round(navigation.domComplete - navigation.fetchStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      };
    } catch (error) {
      logger.error('Error getting page load metrics', error);
      return null;
    }
  }

  /**
   * Get resource metrics
   */
  getResourceMetrics() {
    if (!this.enabled) return [];

    try {
      return performance.getEntriesByType('resource').map((entry) => ({
        name: entry.name,
        duration: Math.round(entry.duration),
        size: entry.transferSize || 0,
        type: entry.initiatorType,
      }));
    } catch (error) {
      logger.error('Error getting resource metrics', error);
      return [];
    }
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage() {
    if (!this.enabled || !performance.memory) return null;

    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      percentage: Math.round(
        (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      ),
    };
  }

  /**
   * Get all collected metrics
   */
  getMetrics() {
    return {
      vitals: this.getCoreWebVitals(),
      pageLoad: this.getPageLoadMetrics(),
      resources: this.getResourceMetrics(),
      memory: this.getMemoryUsage(),
      events: this.eventLog,
    };
  }

  /**
   * Send metrics to analytics service
   */
  async sendMetrics(endpoint) {
    if (!this.enabled) return;

    try {
      const metrics = this.getMetrics();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });

      if (!response.ok) {
        logger.warn(`Failed to send metrics: ${response.status}`);
      }
    } catch (error) {
      logger.error('Error sending metrics', error);
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = {};
    this.eventLog = [];
    performance.clearMarks();
    performance.clearMeasures();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

export { PerformanceMonitor };

export default performanceMonitor;
