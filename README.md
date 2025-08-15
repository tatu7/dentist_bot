# Buvayda Tuman Tibbiyot Birlashmasi Tug'ruqxona Boti

Bu bot Buvayda tuman tibbiyot birlashmasi tug'ruqxona bo'limi uchun yaratilgan.

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

### 🏠 Asosiy menyu

- **📍 Manzil** - Tug'ruqxona manzili va Google Maps lokatsiyasi
- **👥 Navbatchilar haqida ma'lumot** - Vrachlar va hamshiralar haqida ma'lumot
- **💬 Fikir bildirish** - Xizmat sifatiga fikr va reyting berish
- **🚨 Korrupsiya to'g'risida ma'lumot berish** - Korrupsiya haqida hisobot berish

### 📍 Manzil

- Buvayda tuman, Kelajak ko'chasi 103 uy
- Google Maps lokatsiyasi bilan

### 👥 Navbatchilar haqida ma'lumot

- Vrachlar haqida ma'lumot
- Hamshiralar haqida ma'lumot
- Alohida rasm ko'rinishida ma'lumot

### 💬 Fikir bildirish

- Yaxshi/Yomon reyting berish
- Izoh qoldirish
- Fikrlar guruhga yuboriladi

### 🚨 Korrupsiya hisoboti

- Vrach, hamshira yoki boshqa hodim tanlash
- Hodim ismini kiritish
- Korrupsiya tafsilotlarini yozish
- Hisobotlar guruhga yuboriladi

## Render.com da deploy qilish

1. GitHub repository ni Render.com ga ulang
2. Service Type: "Web Service" tanlang
3. Environment Variables:
   - `PORT` = `$PORT`
   - `BOT_TOKEN` = sizning bot token
   - `GROUP_ID` = guruh ID
4. Build Command: `npm install`
5. Start Command: `npm start`
