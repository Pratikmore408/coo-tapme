import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Updated hash generation to include the secret
const verifyTelegramUser = (query) => {
  const { id, first_name, last_name, username, photo_url, auth_date, hash } =
    query;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const secret = crypto.createHash("sha256").update(botToken).digest("hex");

  const dataCheckString = [
    `id=${id}`,
    `first_name=${first_name}`,
    `last_name=${last_name}`,
    `username=${username}`,
    // `photo_url=${photo_url}`,
    // `auth_date=${auth_date}`,
  ].join("\n");

  // Include the secret in the hash generation
  const generatedHash = crypto
    .createHash("sha256")
    .update(secret + "\n" + dataCheckString)
    .digest("hex");

  console.log("Received Hash:", hash);
  console.log("Generated Hash:", generatedHash);

  return generatedHash === hash;
};

export const resolvers = {
  Query: {
    getUser: async (_, { userId }) => {
      // First, try to fetch the user
      let { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      // If error or no user found, create a new user
      if (error || !data) {
        console.log("User not found, creating a new user...");

        // Create a new user with default values
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            user_id: userId,
            first_name: "",
            last_name: "",
            username: "",
            coins: 0,
          })
          .single();

        if (createError) {
          throw new Error(`Error creating new user: ${createError.message}`);
        }

        return newUser; // Return newly created user
      }

      return data; // Return existing user data
    },
  },

  Mutation: {
    incrementCoins: async (_, { userId }) => {
      // Fetch the current coin count
      const { data, error } = await supabase
        .from("users")
        .select("coins")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw new Error("Failed to fetch user data");
      }

      // Increment the coin count
      const newCoins = data.coins + 1;

      // Update the user's coin count
      const { data: updatedData, error: updateError } = await supabase
        .from("users")
        .update({ coins: newCoins })
        .eq("user_id", userId)
        .single();

      if (updateError) {
        throw new Error("Failed to increment coins");
      }

      return updatedData;
    },

    authenticateTelegramUser: async (_, { telegramData }) => {
      console.log("Received Telegram Data:", telegramData);

      const { id, first_name, last_name, username } = telegramData;

      const { data: upsertData, error: upsertError } = await supabase
        .from("users")
        .upsert(
          { user_id: id, first_name, last_name, username, coins: 0 },
          { onConflict: ["user_id"] }
        );

      if (upsertError) {
        throw new Error(`Supabase Upsert Error: ${upsertError.message}`);
      }

      console.log("Upsert Data:", upsertData);

      // Immediately fetch the updated data
      const { data: fetchedData, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", id)
        .single();

      if (fetchError) {
        throw new Error(`Supabase Fetch Error: ${fetchError.message}`);
      }

      console.log("Fetched Data:", fetchedData);
      return fetchedData;
    },
  },
};
