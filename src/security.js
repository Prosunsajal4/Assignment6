/**
 * Security Headers Configuration
 * Implements modern web security best practices
 */

export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',

  // MIME type sniffing prevention
  'X-Content-Type-Options': 'nosniff',

  // XSS protection
  'X-XSS-Protection': '1; mode=block',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy':
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com",
    "form-action 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join('; '),

  // Enforce HTTPS (in production)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Configure security headers in server
 */
export function applySecurityHeaders(app) {
  app.use((req, res, next) => {
    Object.entries(securityHeaders).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
    next();
  });
}

export default securityHeaders;
