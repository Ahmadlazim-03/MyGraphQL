export const typeDefs = `
  scalar JSON

  type User {
    id: Int!
    username: String!
    email: String!
    role: String!
    isActive: Boolean!
  }

  type Mahasiswa {
    id: Int!
    nim: String!
    nama: String!
    jurusan: String!
    angkatan: Int!
    email: String!
  }

  type Alumni {
    id: Int!
    nim: String!
    nama: String!
    jurusan: String!
    angkatan: Int!
    tahunLulus: Int!
    email: String!
    pekerjaans: [PekerjaanAlumni!]!
  }

  type PekerjaanAlumni {
    id: Int!
    namaPerusahaan: String!
    posisiJabatan: String!
    bidangIndustri: String!
    lokasiKerja: String!
    tanggalMulaiKerja: String!
    tanggalSelesaiKerja: String
    statusPekerjaan: String!
  }

  type MonitoringResult {
    connectTimeMs: Int
    sampleQueryMs: Int
    ok: Boolean!
    details: JSON
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    mahasiswa(id: Int!): Mahasiswa
    alumni(id: Int!): Alumni
    searchMahasiswa(query: String!, limit: Int = 20): [Mahasiswa!]!
    getMonitoringHistory(limit: Int = 50): [JSON!]!
    analyticsDaily(rangeDays: Int = 30): [JSON!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    runCheck(provider: String!, url: String!): MonitoringResult!
    saveConfig(provider: String!, url: String!): Boolean!
    createAlumni(input: AlumniInput!): Alumni!
    updateAlumni(id: Int!, input: AlumniInput!): Alumni!
    deleteAlumni(id: Int!): Boolean!
  }

  type Subscription {
    realtime(channel: String!): JSON
  }

  input AlumniInput {
    userId: Int!
    nim: String!
    nama: String!
    jurusan: String!
    angkatan: Int!
    tahunLulus: Int!
  }
`
