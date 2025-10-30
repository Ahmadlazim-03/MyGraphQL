import pino from 'pino'

// Create a lightweight logger. In production use pino; in development use
// a small console-based fallback to avoid transport resolution issues
const isProduction = process.env.NODE_ENV === 'production'
const level = process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug')

let logger: any
if (isProduction) {
  // Use pino in production (no pretty transport)
  logger = pino({ level })
} else {
  // Dev fallback: simple console wrapper with pino-like API to avoid
  // pino transport issues during Next.js bundling in development.
  const make = (fn: 'debug' | 'info' | 'warn' | 'error') => (...args: any[]) => console[fn](...args)
  logger = {
    debug: make('debug'),
    info: make('info'),
    warn: make('warn'),
    error: make('error'),
    child: () => logger
  }
}

export default logger
