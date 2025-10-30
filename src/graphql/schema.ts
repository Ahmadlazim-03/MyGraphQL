import { createSchema } from 'graphql-yoga'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { GraphQLSchema } from 'graphql'

// Baca SDL per fitur
const userSDL = readFileSync(join(process.cwd(), 'src', 'graphql', 'schema', 'user.graphql'), 'utf-8')
const mahasiswaSDL = readFileSync(join(process.cwd(), 'src', 'graphql', 'schema', 'mahasiswa.graphql'), 'utf-8')
const alumniSDL = readFileSync(join(process.cwd(), 'src', 'graphql', 'schema', 'alumni.graphql'), 'utf-8')
const pekerjaanSDL = readFileSync(join(process.cwd(), 'src', 'graphql', 'schema', 'pekerjaanAlumni.graphql'), 'utf-8')
const fileSDL = readFileSync(join(process.cwd(), 'src', 'graphql', 'schema', 'file.graphql'), 'utf-8')

// Static resolver imports
import userResolver from './resolvers/user.resolver'
import mahasiswaResolver from './resolvers/mahasiswa.resolver'
import alumniResolver from './resolvers/alumni.resolver'
import pekerjaanResolver from './resolvers/pekerjaanAlumni.resolver'
import fileResolver from './resolvers/file.resolver'

export const schema: GraphQLSchema = createSchema({
  typeDefs: [userSDL, mahasiswaSDL, alumniSDL, pekerjaanSDL, fileSDL],
  resolvers: [userResolver, mahasiswaResolver, alumniResolver, pekerjaanResolver, fileResolver]
})

export default schema
