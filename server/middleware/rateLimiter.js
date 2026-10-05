import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many auth attempts. Take a breather — and maybe a snack.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const tutorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => req.user?._id?.toString() ?? req.ip,
  message: { error: 'You\'ve hit the tutor rate limit (20 msgs/hour). Give your brain a rest too!' },
  standardHeaders: true,
  legacyHeaders: false,
});
