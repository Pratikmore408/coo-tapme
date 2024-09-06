import TelegramBot from "node-telegram-bot-api";
import { resolvers } from "./resolvers.js";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

export const setupTelegramBot = () => {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id.toString();
    // console.log(msg.chat.id.toString());
    // console.log(msg.chat.first_name, msg.chat.last_name, msg.chat.username);

    const telegramData = {
      id: chatId,
      first_name: msg.chat.first_name,
      last_name: msg.chat.last_name || "",
      username: msg.chat.username || "",
      // photo_url: "", // You may need to fetch or handle this if it's required
      // auth_date: "", // Add actual date if needed
      // hash: "", // Add hash if available for verification
    };

    try {
      // Authenticate the Telegram user
      const user = await resolvers.Mutation.authenticateTelegramUser(null, {
        telegramData,
      });

      console.log(user);

      // URL to the React application with userId query parameter
      const reactAppUrl = `http://127.0.0.1:3000?userId=${chatId}`;

      // Send a message with a URL that automatically opens
      bot.sendMessage(
        chatId,
        `Welcome ${user.first_name}! You have ${user.coins} coins. Tap the button below to start earning more coins.`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Start Tapping",
                  url: reactAppUrl,
                },
              ],
            ],
          },
        }
      );
    } catch (error) {
      bot.sendMessage(chatId, `Error: ${error.message}`);
    }
  });

  console.log("Telegram Bot is running");
};
