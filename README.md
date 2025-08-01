# Telegram Feedback Bot

Bu bot foydalanuvchilardan fikr yig'ish uchun yaratilgan.

## O'rnatish

1. Dasturlarni o'rnating:

```bash
npm install
```

2. `.env` faylini yarating va quyidagi ma'lumotlarni kiriting:

```
BOT_TOKEN=your_bot_token_here
GROUP_ID=your_group_id_here
```

3. Botni ishga tushiring:

```bash
npm start
```

## Bot tokenini olish

1. Telegram'da @BotFather ga yozing
2. `/newbot` buyrug'ini yuboring
3. Bot nomini va username'ini kiriting
4. Sizga berilgan token'ni `.env` faylida `BOT_TOKEN` ga yozing

## Guruh ID'sini olish

1. Botni guruhga qo'shing
2. Guruhda biror xabar yuboring
3. `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates` ga o'ting
4. `chat.id` ni toping va `.env` faylida `GROUP_ID` ga yozing

## Bot funksiyalari

1. `/start` - Botni ishga tushirish
2. Foydalanuvchi to'liq ism va familiyasini kiritadi
3. Telefon raqamini kiritadi
4. Reyting beradi (Yaxshi/Yomon)
5. Fikrini yozadi
6. Barcha ma'lumotlar guruhga yuboriladi
