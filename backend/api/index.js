const url = require('url');
require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const app = express();
const PORT = process.env.PORT || 5000;

// Log security info
console.log('🔒 Segurança ativa:', 'CORS, Rate Limit, Helmet, CSRF');
console.log('🌐 Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:3000');

app.use(cors());

// Compression Middleware: Reduce response size with gzip/deflate
// Compresses responses >1KB with gzip by default
const compressionOptions = {
  // Filter which responses to compress
  filter: (req, res) => {
    // Don't compress if client sends no-compression header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use default filter (compress if Accept-Encoding includes gzip)
    return compression.filter(req, res);
  },
  // Compression level: -1 (default) to 9 (best)
  // 6 is a good balance between speed and compression
  level: parseInt(process.env.COMPRESSION_LEVEL || '6'),
  // Compress responses >1KB
  threshold: 1024,
};

app.use(compression(compressionOptions));

// Helmet Security Middleware: Comprehensive security headers
// Uses industry best practices to protect against common vulnerabilities
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      // Default: restrict everything to same-origin
      defaultSrc: ["'self'"],
      
      // Scripts: self + trusted CDNs (if needed)
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for React development, consider removing in production
        "'unsafe-eval'",   // Required for some libraries, consider removing in production
        "https://cdnjs.cloudflare.com", // CDN example
      ],
      
      // Styles: self + data URIs for inline styles
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Material-UI requires this
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
      ],
      
      // Fonts: self + Google Fonts
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "data:",
      ],
      
      // Images: self + data URIs + https
      imgSrc: [
        "'self'",
        "data:",
        "https:",
      ],
      
      // API calls and WebSockets
      connectSrc: [
        "'self'",
        "https:",
      ],
      
      // Media: self + https
      mediaSrc: [
        "'self'",
        "https:",
      ],
      
      // Objects/plugins: none
      objectSrc: ["'none'"],
      
      // Form submissions: self
      formAction: ["'self'"],
      
      // Frame embedding: none (prevent clickjacking)
      frameSrc: ["'none'"],
      
      // Prevent all plugins
      pluginTypes: [],
    },
    // Report policy violations (optional)
    reportUri: '/api/csp-report',
  },
  
  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Enable XSS filter
  xssFilter: true,
  
  // Referrer policy
  referrerPolicy: {
    policy: 'no-referrer',
  },
  
  // Strict transport security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: process.env.NODE_ENV === 'production',
  },
  
  // DNS prefetch control
  dnsPrefetchControl: {
    allow: false, // Prevent DNS prefetch for privacy
  },
  
  // Disable IE compatibility
  ieNoOpen: true,
}));

// Global Rate Limiter: DDoS Protection (15 min window, 100 requests per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per windowMs
  keyGenerator: ipKeyGenerator, // Use proper IPv6-safe key generator
  handler: (req, res) => {
    res.status(429).json({
      error: 'Limite global de requisições excedido',
      message: 'Seu IP excedeu o limite de 100 requisições por 15 minutos. Tente novamente mais tarde.',
      retryAfter: req.rateLimit.resetTime,
      ip: req.ip,
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    return req.path === '/health' || req.path.startsWith('/static/');
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// API-specific Rate Limiter: Per-user rate limiting (1 min window, 10 requests)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // Limit each user to 10 requests per windowMs
  keyGenerator: (req) => {
    // Use user identifier (token or auth header) with fallback to IPv6-safe IP
    const token = req.query.token || req.headers.authorization;
    if (token) {
      return token;
    }
    // Fallback to ipKeyGenerator for IPv6 support
    return ipKeyGenerator(req);
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições',
      message: 'Você excedeu o limite de 10 requisições por minuto. Tente novamente mais tarde.',
      retryAfter: req.rateLimit.resetTime
    });
  },
  skip: (req) => {
    // Skip rate limiting for GET requests to non-AI endpoints
    return req.method === 'GET' && !req.path.includes('feedback');
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global limiter first (protects all routes)
app.use(globalLimiter);

morgan.token('url-sanitized', (req) => {
  const parsedUrl = url.parse(req.originalUrl, true);
  
  // Remove o token das queries
  if (parsedUrl.query.token) {
    parsedUrl.query.token = '***';
  }

  // Reconstrói a URL sem o token real
  const sanitizedQuery = new URLSearchParams(parsedUrl.query).toString();
  return parsedUrl.pathname + (sanitizedQuery ? `?${sanitizedQuery}` : '');
});

app.use(morgan(':method :url-sanitized :status :res[content-length] - :response-time ms'));

app.use(express.json());
app.use(cookieParser());

// HTTPS Enforcement: Redirect HTTP to HTTPS in production
const enforceHTTPS = (req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

  if (isProduction && !isSecure && !isLocalhost) {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
};

app.use(enforceHTTPS);

// CSRF Protection: Protects against Cross-Site Request Forgery
// Generates and validates CSRF tokens for state-changing operations
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Endpoint to get CSRF token for client
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Health Check Endpoint (exempted from rate limiting via globalLimiter skip)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Rate Limit Status Endpoint (per-user monitoring)
app.get('/api/rate-limit-status', (req, res) => {
  const userId = req.query.token || req.headers.authorization || req.ip || 'anonymous';
  
  res.json({
    userId,
    limits: {
      global: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
        unit: 'per 15 minutes',
      },
      api: {
        windowMs: 60 * 1000,
        maxRequests: 10,
        unit: 'per minute',
      },
    },
    info: 'Check RateLimit-* headers in response for current usage',
  });
});

// CSP Report Endpoint: Logs policy violations for monitoring
app.post('/api/csp-report', (req, res) => {
  const violation = req.body;
  console.warn('🚨 CSP Violation:', {
    documentUrl: violation['document-uri'],
    blockedUri: violation['blocked-uri'],
    violatedDirective: violation['violated-directive'],
    originalPolicy: violation['original-policy'],
    timestamp: new Date().toISOString(),
  });
  
  // Optionally send to external logging service (Sentry, DataDog, etc.)
  // logToExternalService(violation);
  
  res.status(204).send();
});

app.use('/api', apiLimiter, routes);

// CSRF Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({
      error: 'Token CSRF inválido',
      message: 'Requisição rejeitada por razões de segurança. Recarregue a página e tente novamente.'
    });
  } else {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});