#!/usr/bin/env node
const endpoint = process.env.ENDPOINT || 'http://localhost:3000/api/graphql'

let fetchFn
if (typeof fetch === 'function') {
  fetchFn = fetch
} else {
  try {
    // node-fetch v3 is ESM-only; require will work in CommonJS if installed as a shim.
    // If not present, instruct the user to use Node 18+ or install node-fetch.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fetchFn = require('node-fetch')
  } catch (err) {
    console.error('No fetch available. Run this with Node 18+ or install node-fetch (npm i -D node-fetch).')
    process.exit(2)
  }
}

const headers = { 'Content-Type': 'application/json' }

async function post(query, variables = undefined) {
  const body = variables ? JSON.stringify({ query, variables }) : JSON.stringify({ query })
  const res = await fetchFn(endpoint, { method: 'POST', headers, body })
  return res.json()
}

async function run() {
  console.log('Endpoint:', endpoint)

  const usersQuery = '{ users { id username email createdAt updatedAt } }'
  console.log('\n1) Fetching users...')
  console.log(JSON.stringify(await post(usersQuery), null, 2))

  // create a user with timestamped email to avoid unique-constraint collisions
  const ts = Date.now()
  const createMutation = `mutation CreateUser($username: String!, $email: String!, $password: String!){ createUser(username: $username, email: $email, password: $password) { id username email } }`
  const variables = { username: `Auto-${ts}`, email: `auto+${ts}@example.com`, password: `secret${ts}` }

  console.log('\n2) Creating a user...')
  console.log(JSON.stringify(await post(createMutation, variables), null, 2))

  console.log('\n3) Fetching users again...')
  console.log(JSON.stringify(await post(usersQuery), null, 2))

  // Mahasiswa test
  const mahasiswaQuery = '{ mahasiswas { id nim nama email angkatan } }'
  console.log('\n4) Fetching mahasiswas...')
  console.log(JSON.stringify(await post(mahasiswaQuery), null, 2))

  const createMahasiswaMutation = `mutation CreateMahasiswa($input: CreateMahasiswaInput!){ createMahasiswa(input: $input) { id nim nama email angkatan } }`
  const mahasiswaVars = { input: { nim: `NIM${ts}`, nama: `Mahasiswa ${ts}`, jurusan: 'Teknik', angkatan: 2023, email: `mhs+${ts}@example.com` } }
  console.log('\n5) Creating a mahasiswa...')
  console.log(JSON.stringify(await post(createMahasiswaMutation, mahasiswaVars), null, 2))
}

run().catch((err) => {
  console.error('Test script failed:', err)
  process.exit(1)
})
