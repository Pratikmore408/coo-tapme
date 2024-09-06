// backend/src/index.js
import dotenv from "dotenv";
import express from "express";
import { createYoga, createSchema } from "graphql-yoga";
import { createServer } from "http";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import { setupTelegramBot } from "./telegramBot.js";

dotenv.config();

const app = express();

// Create the GraphQL schema
const schema = createSchema({
  typeDefs,
  resolvers,
});

// Create a Yoga instance with the schema
const yoga = createYoga({
  schema,
  cors: {
    origin: "http://127.0.0.1:3000", // Add your frontend's URL
    credentials: true,
  },
});

// Apply Yoga middleware to the Express app
app.use("/graphql", yoga);

// Start the Telegram bot
setupTelegramBot();

const port = process.env.PORT || 4000;

// Create an HTTP server
const server = createServer(app);

server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}/graphql`)
);

server.on("error", (err) => {
  console.error("Server Error:", err);
});
