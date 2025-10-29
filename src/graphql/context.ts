import prisma from '../lib/prisma'
import logger from '../lib/logger'
import type { NextApiRequest, NextApiResponse } from 'next'

// Bentuk context yang akan di-inject ke tiap resolver
export type Context = {
  prisma: typeof prisma
  logger: typeof logger
  req?: NextApiRequest
  res?: NextApiResponse
}

export function createContext({ req, res }: { req?: NextApiRequest; res?: NextApiResponse }): Context {
  return {
    prisma,
    logger,
    req,
    res
  }
}
