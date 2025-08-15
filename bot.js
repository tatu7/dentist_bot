const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const http = require('http');

const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

// Simple HTTP server for Render.com port binding
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});

// User states
const userStates = new Map();

// States
const STATES = {
  WAITING_FOR_NAME: 'waiting_for_name',
  WAITING_FOR_PHONE: 'waiting_for_phone',
  MAIN_MENU: 'main_menu',
  FEEDBACK: 'feedback',
  STAFF_INFO: 'staff_info',
  CORRUPTION_REPORT: 'corruption_report',
  WAITING_FOR_FEEDBACK_COMMENT: 'waiting_for_feedback_comment',
  WAITING_FOR_CORRUPTION_DETAILS: 'waiting_for_corruption_details'
};

// Main menu keyboard
const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      ['1️⃣ Manzil'],
      ['2️⃣ Fikir bildirish'],
      ['3️⃣ Navbatchilar haqida ma\'lumot'],
      ['4️⃣ Korrupsiya to\'g\'risida ma\'lumot berish']
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

// Back to main menu button
const backToMainKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🔙 Asosiyga qaytish', callback_data: 'back_to_main' }]
    ]
  }
};

// Feedback keyboard
const feedbackKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '👍 Yaxshi', callback_data: 'feedback_good' },
        { text: '👎 Yomon', callback_data: 'feedback_bad' }
      ]
    ]
  }
};

// Staff selection keyboard
const staffKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '👨‍⚕️ Vrachlar', callback_data: 'doctors' },
        { text: '👩‍⚕️ Hamshiralar', callback_data: 'nurses' }
      ]
    ]
  }
};

// Corruption staff selection keyboard
const corruptionStaffKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '👨‍⚕️ Vrach', callback_data: 'corruption_doctor' },
        { text: '👩‍⚕️ Hamshira', callback_data: 'corruption_nurse' }
      ],
      [
        { text: '👷 Boshqa hodim', callback_data: 'corruption_other' }
      ]
    ]
  }
};

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  userStates.set(userId, {
    state: STATES.WAITING_FOR_NAME,
    data: {}
  });

  bot.sendMessage(chatId, 'Assalomu alaykum! Iltimos, to\'liq ism va familiyangizni kiriting:');
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

        const phoneKeyboard = {
          reply_markup: {
            keyboard: [
              [{ text: '📱 Telefon raqamni yuborish', request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        };

        bot.sendMessage(chatId, 'Iltimos, telefon raqamingizni yuboring:', phoneKeyboard);
      }
      break;

    case STATES.WAITING_FOR_PHONE:
      if (msg.contact) {
        userState.data.phone = msg.contact.phone_number;
        userState.state = STATES.MAIN_MENU;
        userStates.set(userId, userState);

        bot.sendMessage(chatId,
          'Rahmat! Endi quyidagi yonalishlardan birini tanlang:',
          mainMenuKeyboard
        );
      } else if (text && text !== '/start') {
        bot.sendMessage(chatId, 'Iltimos, "📱 Telefon raqamni yuborish" tugmasini bosing');
      }
      break;

    case STATES.MAIN_MENU:
      handleMainMenu(chatId, userId, text, userState);
      break;

    case STATES.WAITING_FOR_FEEDBACK_COMMENT:
      if (text && text !== '/start') {
        userState.data.feedbackComment = text;
        userStates.set(userId, userState);

        // Send feedback to group
        sendFeedback(userState.data, msg.from);

        // Send thank you message
        bot.sendMessage(chatId, 'Fikringiz uchun rahmat!', backToMainKeyboard);

        // Clear user state and return to main menu
        userState.state = STATES.MAIN_MENU;
        userState.data = {};
        userStates.set(userId, userState);
      }
      break;

    case STATES.WAITING_FOR_CORRUPTION_DETAILS:
      if (text && text !== '/start') {
        userState.data.corruptionDetails = text;
        userStates.set(userId, userState);

        // Send corruption report to group
        sendCorruptionReport(userState.data, msg.from);

        // Send completion message
        bot.sendMessage(chatId, 'Ma\'lumot uchun rahmat! Tez orada tekshirib chiqamiz.', backToMainKeyboard);

        // Clear user state and return to main menu
        userState.state = STATES.MAIN_MENU;
        userState.data = {};
        userStates.set(userId, userState);
      }
      break;
  }
});

// Handle callback queries
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (!userStates.has(userId)) return;

  const userState = userStates.get(userId);

  switch (data) {
    case 'back_to_main':
      bot.answerCallbackQuery(callbackQuery.id);
      bot.sendMessage(chatId, 'Asosiy menyuga qaytdingiz:', mainMenuKeyboard);
      break;

    case 'doctors':
      bot.answerCallbackQuery(callbackQuery.id);

      // Send staff info to group
      if (userStates.has(userId)) {
        const userState = userStates.get(userId);
        sendStaffInfo(userState.data, { id: userId, username: callbackQuery.from.username }, 'Vrachlar');
      }

      bot.sendMessage(chatId,
        '👨‍⚕️ Vrachlar\n\nVrachlarni bosganda alohida rasm ko\'rinishidagi ma\'lumot chiqadi.\n\nBu bo\'lim ham shu bilan tugaydi.',
        backToMainKeyboard
      );
      break;

    case 'nurses':
      bot.answerCallbackQuery(callbackQuery.id);

      // Send staff info to group
      if (userStates.has(userId)) {
        const userState = userStates.get(userId);
        sendStaffInfo(userState.data, { id: userId, username: callbackQuery.from.username }, 'Hamshiralar');
      }

      bot.sendMessage(chatId,
        '👩‍⚕️ Hamshiralar\n\nHamshiralarni bosganda rasm ko\'rinishdagi rasm alohida.\n\nBu bo\'lim ham shu bilan tugaydi.',
        backToMainKeyboard
      );
      break;

    case 'feedback_good':
      userState.data.rating = 'Yaxshi';
      userState.state = STATES.WAITING_FOR_FEEDBACK_COMMENT;
      userStates.set(userId, userState);

      bot.answerCallbackQuery(callbackQuery.id);
      bot.sendMessage(chatId, 'Fikrni yozing va Enter bosing:');
      break;

    case 'feedback_bad':
      userState.data.rating = 'Yomon';
      userState.state = STATES.WAITING_FOR_FEEDBACK_COMMENT;
      userStates.set(userId, userState);

      bot.answerCallbackQuery(callbackQuery.id);
      bot.sendMessage(chatId, 'Fikrni yozing va Enter bosing:');
      break;

    case 'corruption_doctor':
    case 'corruption_nurse':
    case 'corruption_other':
      userState.data.corruptionType = data;
      userState.state = STATES.WAITING_FOR_CORRUPTION_DETAILS;
      userStates.set(userId, userState);

      bot.answerCallbackQuery(callbackQuery.id);
      bot.sendMessage(chatId, 'Hodim haqida ma\'lumot va korrupsiya turi haqida ma\'lumot bering:');
      break;
  }
});

// Handle main menu selections
function handleMainMenu(chatId, userId, text, userState) {
  switch (text) {
    case '1️⃣ Manzil':
      // Send location info to group
      sendLocationInfo(userState.data, { id: userId, username: 'user' });

      const locationMessage =
        '📍 Manzil:\n' +
        'Buvayda tuman, Kelajak ko\'chasi 103 uy\n\n' +
        '🗺 Lokatsiyasi:\n' +
        'https://maps.google.com/maps?q=40.566802,71.143584&ll=40.566802,71.143584&z=16';

      bot.sendMessage(chatId, locationMessage, backToMainKeyboard);
      break;

    case '2️⃣ Fikir bildirish':
      bot.sendMessage(chatId, 'Qanday taassurot qoldirdik?', feedbackKeyboard);
      break;

    case '3️⃣ Navbatchilar haqida ma\'lumot':
      bot.sendMessage(chatId, 'Navbatchilar haqida ma\'lumot:', staffKeyboard);
      break;

    case '4️⃣ Korrupsiya to\'g\'risida ma\'lumot berish':
      const corruptionMessage =
        '🚨 Korrupsiya haqida ma\'lumot berish\n\n' +
        'Xodimlar haqida ma\'lumot olish uchun birinchi menyudan "3️⃣ Navbatchilar haqida ma\'lumot" tugmasini bosing.\n\n' +
        'Korrupsiya haqida ma\'lumot berish uchun quyidagilardan birini tanlang:';

      bot.sendMessage(chatId, corruptionMessage);

      setTimeout(() => {
        bot.sendMessage(chatId, 'Korrupsiya turini tanlang:', corruptionStaffKeyboard);
      }, 1000);
      break;
  }
}

// Function to send feedback to group
function sendFeedback(userData, user) {
  const message = `
💬 YANGI FIKR

👤 Foydalanuvchi: ${userData.fullName}
📱 Telefon: ${userData.phone}
⭐️ Reyting: ${userData.rating}
📝 Fikr: ${userData.feedbackComment}
🆔 User ID: ${user.id}
👤 Username: @${user.username || 'Yo\'q'}
  `;

  bot.sendMessage(config.GROUP_ID, message);
}

// Function to send corruption report to group
function sendCorruptionReport(userData, user) {
  const corruptionTypeText = {
    'corruption_doctor': 'Vrach',
    'corruption_nurse': 'Hamshira',
    'corruption_other': 'Boshqa hodim'
  };

  const message = `
🚨 KORRUPSIYA HISOBOTI

👤 Foydalanuvchi: ${userData.fullName}
📱 Telefon: ${userData.phone}
🏥 Hodim turi: ${corruptionTypeText[userData.corruptionType]}
📝 Tafsilotlar: ${userData.corruptionDetails}
🆔 User ID: ${user.id}
👤 Username: @${user.username || 'Yo\'q'}
  `;

  bot.sendMessage(config.GROUP_ID, message);
}

// Function to send location info to group
function sendLocationInfo(userData, user) {
  const message = `
📍 MANZIL KO\'RILGAN

👤 Foydalanuvchi: ${userData.fullName}
📱 Telefon: ${userData.phone}
🆔 User ID: ${user.id}
👤 Username: @${user.username || 'Yo\'q'}
  `;

  bot.sendMessage(config.GROUP_ID, message);
}

// Function to send staff info to group
function sendStaffInfo(userData, user, staffType) {
  const message = `
👥 NAVBATCHILAR MA\'LUMOTI KO\'RILGAN

👤 Foydalanuvchi: ${userData.fullName}
📱 Telefon: ${userData.phone}
🏥 Ko\'rilgan ma\'lumot: ${staffType}
🆔 User ID: ${user.id}
👤 Username: @${user.username || 'Yo\'q'}
  `;

  bot.sendMessage(config.GROUP_ID, message);
}

console.log('Bot ishga tushdi...'); 