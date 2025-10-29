import { NextApiRequest, NextApiResponse } from 'next'
import { createYoga } from 'graphql-yoga'
import schema from '../../graphql/schema'
import { createContext } from '../../graphql/context'

// Next.js API Route handler for GraphQL Yoga. This is Vercel-friendly serverless.
const yoga = createYoga<{
  req: NextApiRequest
  res: NextApiResponse
}>({
  schema,
  // Set the GraphQL endpoint path relative to the serverless function
  graphqlEndpoint: '/api/graphql',
  context: ({ req, res }) => createContext({ req, res }),
  // Disable GraphiQL in production
  graphiql: process.env.NODE_ENV !== 'production'
})

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return yoga(req, res)
}
