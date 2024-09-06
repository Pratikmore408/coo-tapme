export const typeDefs = `
  type Query {
    getUser(user_id: String!): User
  }

  type Mutation {
    createUser(user_id: String!): User
    incrementCoins(user_id: String!): User
    authenticateTelegramUser(telegramData: TelegramAuthInput!): User
  }

  input TelegramAuthInput {
    id: String!
    first_name: String
    last_name: String
    username: String
    photo_url: String
    auth_date: String
    hash: String!
  }

  type User {
    id: ID!
    user_id: String!
    coins: Int!
  }
`;
