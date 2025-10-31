# MyGraphQL - Monitoring & Alumni Management System

A full-stack Next.js application for managing monitoring tasks and alumni data with GraphQL API, JWT authentication, and real-time updates.

## Features

- 🔐 JWT-based Authentication with httpOnly cookies
- 📊 Monitoring System with performance metrics
- 👥 Alumni & Mahasiswa Management with CRUD operations
- 📈 Real-time Analytics and Activity Logging
- 🚀 GraphQL API with Subscriptions support
- 💾 PostgreSQL (Prisma ORM) + MongoDB (Mongoose)
- 🎨 Modern UI with Tailwind CSS v4

## Tech Stack

- **Frontend/API**: Next.js 14 + TypeScript
- **Database**: PostgreSQL (Prisma) + MongoDB (Mongoose)
- **GraphQL**: GraphQL Yoga with Subscriptions
- **Authentication**: JWT with httpOnly cookies
- **Styling**: Tailwind CSS v4
- **Runtime**: Node.js

## Environment Variables

\`\`\`env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/mygraphql_db"

# MongoDB
MONGODB_URI="mongodb://localhost:27017/mygraphql"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
\`\`\`

## Setup & Installation

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Setup Databases

**PostgreSQL:**
\`\`\`bash
# Create database
createdb mygraphql_db

# Run migrations
npm run migrate
\`\`\`

**MongoDB:**
\`\`\`bash
# MongoDB should be running locally or via Docker
# mongod --dbpath /path/to/db
\`\`\`

### 3. Seed Database
\`\`\`bash
npm run seed
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

**Demo Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

## API Endpoints

### GraphQL
- `POST /api/graphql` - GraphQL endpoint

### Authentication
- `POST /api/auth/login` - Set auth cookie
- `POST /api/auth/logout` - Clear auth cookie

## Available Scripts

\`\`\`bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Type checking
npm run typecheck

# Database migrations
npm run migrate

# Seed data
npm run seed
\`\`\`

## Project Structure

\`\`\`
.
├── pages/
│   ├── index.tsx           # Login page
│   ├── dashboard.tsx       # Dashboard
│   ├── mahasiswa.tsx       # Mahasiswa CRUD
│   ├── alumni.tsx          # Alumni CRUD
│   ├── api/
│   │   ├── graphql.ts      # GraphQL endpoint
│   │   └── auth/
│   │       ├── login.ts
│   │       └── logout.ts
├── components/
│   ├── layout.tsx          # Main layout with sidebar
│   ├── dashboard/          # Dashboard components
│   ├── mahasiswa/          # Mahasiswa components
│   └── alumni/             # Alumni components
├── lib/
│   ├── auth.ts             # Auth utilities
│   ├── db.ts               # Prisma client
│   ├── mongodb.ts          # MongoDB connection
│   ├── graphql-schema.ts   # GraphQL type definitions
│   └── resolvers.ts        # GraphQL resolvers
├── models/
│   ├── activityLog.ts      # MongoDB ActivityLog
│   ├── analytics.ts        # MongoDB Analytics
│   └── realtimeUpdate.ts   # MongoDB RealtimeUpdate
├── prisma/
│   └── schema.prisma       # Prisma schema
└── middleware.ts           # Authentication middleware
\`\`\`

## GraphQL Schema

### Queries
- `me` - Get current user
- `mahasiswa(id)` - Get mahasiswa by ID
- `alumni(id)` - Get alumni by ID
- `searchMahasiswa(query, limit)` - Search mahasiswa
- `getMonitoringHistory(limit)` - Get monitoring logs
- `analyticsDaily(rangeDays)` - Get analytics data

### Mutations
- `login(email, password)` - User login
- `logout` - User logout
- `runCheck(provider, url)` - Run monitoring check
- `saveConfig(provider, url)` - Save config
- `createAlumni(input)` - Create alumni
- `updateAlumni(id, input)` - Update alumni
- `deleteAlumni(id)` - Delete alumni

## Security

- Passwords are hashed with bcrypt
- JWT tokens stored in httpOnly cookies
- CORS and CSRF protection enabled
- Middleware validates all protected routes
- Row-level security concepts applied

## Future Enhancements

- [ ] GraphQL Subscriptions for real-time updates
- [ ] WebSocket support for live monitoring
- [ ] Redis caching layer
- [ ] Advanced analytics dashboard
- [ ] File upload for documents
- [ ] Email notifications
- [ ] Two-factor authentication

## License

MIT
