export const typeDefs = `
  scalar JSON

  type User {
    id: Int!
    username: String
    email: String!
    role: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type MonitoringMetrics {
    totalRequests: Int!
    averageResponseTime: Float!
    slowestRequest: Float!
    fastestRequest: Float!
    errorCount: Int!
    errorRate: String!
    requestsPerSecond: String!
  }

  type TimelinePoint {
    time: String!
    count: Int!
    avgDuration: Float!
  }

  type GraphQLRequest {
    method: String!
    duration: Float!
    status: Int!
    query: String
    operationName: String
    error: String
    timestamp: String!
    performanceLevel: String
    isError: Boolean
    ipAddress: String
    userAgent: String
    browser: String
    os: String
    device: String
    country: String
    city: String
  }

  type Query {
    me: User
    monitoringMetrics: MonitoringMetrics!
    requestTimeline: [TimelinePoint!]!
    recentRequests(limit: Int = 50): [GraphQLRequest!]!
    errorLog(limit: Int = 50): [GraphQLRequest!]!
  }

  type Mutation {
    ping: Boolean!
  }
`
