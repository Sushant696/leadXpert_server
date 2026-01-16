import rateLimit from "express-rate-limit" 

const rateLimiter = rateLimit(
  {
    limit: 100,
    windowMs: 15 * 60 * 1000,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
  }
)

export default rateLimiter
