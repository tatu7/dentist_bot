const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

// User states
const userStates = new Map();

// States
const STATES = {
  WAITING_FOR_NAME: 'waiting_for_name',
  WAITING_FOR_PHONE: 'waiting_for_phone',
  WAITING_FOR_RATING: 'waiting_for_rating',
  WAITING_FOR_FEEDBACK: 'waiting_for_feedback'
};

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  userStates.set(userId, {
    state: STATES.WAITING_FOR_NAME,
    data: {}
  });

  bot.sendMessage(chatId, 'Assalomu alaykum! Tezroq bog\'lanish uchun iltimos, to\'liq ism va familiyangizni kiriting:');
});

// Handle text messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (!userStates.has(userId)) return;

  const userState = userStates.get(userId);

  switch (userState.state) {
    case STATES.WAITING_FOR_NAME:
      if (text && text !== '/start') {
        userState.data.fullName = text;
        userState.state = STATES.WAITING_FOR_PHONE;
        userStates.set(userId, userState);

        bot.sendMessage(chatId, 'Iltimos, telefon raqamingizni kiriting:');
      }
      break;

    case STATES.WAITING_FOR_PHONE:
      if (text && text !== '/start') {
        userState.data.phone = text;
        userState.state = STATES.WAITING_FOR_RATING;
        userStates.set(userId, userState);

        const ratingKeyboard = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Yaxshi 👍', callback_data: 'rating_good' },
                { text: 'Yomon 👎', callback_data: 'rating_bad' }
              ]
            ]
          }
        };

        bot.sendMessage(chatId, 'Qanday taassurot qoldirdik?', ratingKeyboard);
      }
      break;

    case STATES.WAITING_FOR_FEEDBACK:
      if (text && text !== '/start') {
        userState.data.feedback = text;
        userStates.set(userId, userState);

        // Send thank you message
        bot.sendMessage(chatId, 'Fikringiz uchun rahmat! Tez orada siz bilan bog\'lanamiz.');

        // Send data to group
        sendToGroup(userState.data, msg.from);

        // Clear user state
        userStates.delete(userId);
      }
      break;
  }
});

// Handle callback queries (rating buttons)
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (!userStates.has(userId)) return;

  const userState = userStates.get(userId);

  if (userState.state === STATES.WAITING_FOR_RATING) {
    if (data === 'rating_good' || data === 'rating_bad') {
      userState.data.rating = data === 'rating_good' ? 'Yaxshi' : 'Yomon';
      userState.state = STATES.WAITING_FOR_FEEDBACK;
      userStates.set(userId, userState);

      bot.answerCallbackQuery(callbackQuery.id);
      bot.sendMessage(chatId, 'Iltimos, fikringizni kiriting:');
    }
  }
});

// Function to send data to group
function sendToGroup(userData, user) {
  const message = `
🆕 Yangi fikr

👤 Foydalanuvchi: ${userData.fullName}
📱 Telefon: ${userData.phone}
⭐️ Reyting: ${userData.rating}
💬 Fikr: ${userData.feedback}
🆔 User ID: ${user.id}
👤 Username: @${user.username || 'Yo\'q'}
  `;

  bot.sendMessage(config.GROUP_ID, message);
}

console.log('Bot ishga tushdi...'); 