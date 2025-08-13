// bot.js
const TelegramBot = require("node-telegram-bot-api");
const admin = require("firebase-admin");
const fs = require("fs");

const TOKEN = "8252256697:AAGJ3iASEPtRe3hJ-1LBtGCYC_1MaD2cbFw";
const ADMIN_CHAT_ID = "1045691567"; // 🔹 Твой ID
const bot = new TelegramBot(TOKEN, { polling: true });

// Инициализация Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require("./serviceAccountKey.json"); // 🔹 JSON ключ из Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Команда старта
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Привет, ${msg.from.first_name}!\n` +
      `Чтобы сделать билет премиум, отправь команду в формате:\n\n` +
      `/premium TicketID`
  );
});

// ✅ Получение команды премиум
bot.onText(/\/premium (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const ticketId = match[1].trim();

  // Проверяем билет
  try {
    const ticketRef = db.collection("tickets").doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return bot.sendMessage(chatId, "❌ Билет с таким ID не найден.");
    }

    const ticket = ticketDoc.data();

    if (ticket.premium) {
      return bot.sendMessage(chatId, "🌟 Этот билет уже премиум.");
    }

    bot.sendMessage(
      chatId,
      `Отправьте фото чека об оплате для билета ID: ${ticketId}`
    );

    // Сохраняем, что пользователь ждет премиум
    await ticketRef.update({ premiumPending: true, premiumUserChat: chatId });
  } catch (error) {
    console.error("Ошибка проверки билета:", error);
    bot.sendMessage(chatId, "❌ Произошла ошибка при проверке билета.");
  }
});

// ✅ Обработка фото чека
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  const photos = msg.photo;
  if (!photos || photos.length === 0) return;

  const fileId = photos[photos.length - 1].file_id;

  // Ищем билет, который в ожидании премиума
  const pendingTickets = await db
    .collection("tickets")
    .where("premiumPending", "==", true)
    .where("premiumUserChat", "==", chatId)
    .get();

  if (pendingTickets.empty) {
    return bot.sendMessage(chatId, "❌ У вас нет билетов в ожидании премиума.");
  }

  // Берём первый билет
  const ticketDoc = pendingTickets.docs[0];
  const ticketId = ticketDoc.id;

  bot.sendMessage(
    chatId,
    "✅ Чек получен, ожидайте подтверждения администратора."
  );

  // Отправка админу с кнопками
  bot.sendPhoto(ADMIN_CHAT_ID, fileId, {
    caption: `Запрос на премиум\nTicketID: ${ticketId}\nОт пользователя @${
      msg.from.username || msg.from.first_name
    }`,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "✅ Подтвердить",
            callback_data: `approve_${encodeURIComponent(ticketId)}_${chatId}`,
          },
          {
            text: "❌ Отклонить",
            callback_data: `reject_${chatId}`,
          },
        ],
      ],
    },
  });
});

// ✅ Обработка кнопок администратора
bot.on("callback_query", async (query) => {
  const data = query.data;

  try {
    if (data.startsWith("approve_")) {
      const parts = data.split("_");
      const ticketId = decodeURIComponent(parts[1]);
      const userChatId = parts[2];

      await db.collection("tickets").doc(ticketId).update({
        premium: true,
        premiumPending: false,
      });

      bot.sendMessage(userChatId, "🌟 Ваш билет переведен в премиум!");
      bot.sendMessage(query.message.chat.id, "✅ Премиум подтвержден.");
    }

    if (data.startsWith("reject_")) {
      const userChatId = data.split("_")[1];
      bot.sendMessage(userChatId, "❌ Ваш билет не прошел проверку.");
      bot.sendMessage(query.message.chat.id, "Билет отклонён.");
    }
  } catch (error) {
    console.error("Ошибка обработки callback:", error);
  }
});
