import { createSchema } from 'graphql-yoga'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { GraphQLSchema } from 'graphql'

// Baca SDL per fitur
const userSDL = readFileSync(join(process.cwd(), 'src', 'graphql', 'schema', 'user.graphql'), 'utf-8')

// Lazy-load resolver to reduce cold-start overhead in serverless
// Each wrapper calls dynamic import on first use.
const makeLazy = (importPath: string, exportName = 'default') => {
  let cached: any = null
  return async function lazyResolver(...args: any[]) {
    if (!cached) {
      // dynamic import
      const mod = await import(importPath)
      cached = mod[exportName]
    }
    // call resolver field; if top-level object (Query/Mutation), we merge
    // but graphql-yoga expects an object of resolvers; we'll return cached
    return cached
  }
}

// Note: graphql-yoga's createSchema requires resolvers object sync or async.
// We'll import resolvers normally to keep implementation simple and reliable.
// Using dynamic import at module load would complicate schema creation; so
// for simplicity we import the resolver directly here (it's still modular).
import userResolver from './resolvers/user.resolver'

export const schema: GraphQLSchema = createSchema({
  typeDefs: [userSDL],
  resolvers: [userResolver]
})

export default schema
