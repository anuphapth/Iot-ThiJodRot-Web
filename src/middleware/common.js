import { ValidationError } from '../utils/errorHandler.js';

export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

export const rateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    requests.set(ip, validRequests);

    if (validRequests.length >= max) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    validRequests.push(now);
    next();
  };
};

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details[0].message);
      }
      
      req.validatedBody = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const corsHandler = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

export default {
  requestLogger,
  rateLimiter,
  validateRequest,
  corsHandler,
};
