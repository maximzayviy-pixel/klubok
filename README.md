# Twilio P2P SuperApp (PWA + Twilio + Supabase + BLE + WS)

## Что внутри
- PWA (Workbox): оффлайн-кеш, установка.
- JWT-авторизация, юзеры в Supabase Postgres.
- Профили + аватар (Supabase Storage, загрузка через /api/avatar-upload).
- Twilio звонки: user↔user и на PSTN (+E.164), запись включена.
- CDR в БД, таблица истории.
- Bluetooth-чат (демо) через Web Bluetooth (требуется BLE-периферия).
- Realtime (presence/typing/ringing) — отдельный server на Fly.io (Socket.IO).

## .env пример
Скопируйте `.env.example` значения в Vercel → Project → Environment Variables.

## Деплой
```bash
npm i -g vercel
vercel login
vercel
```

### Twilio Console → TwiML App
- Voice URL: `https://<your-app>.vercel.app/api/voice` (POST)
- Status Callback: `https://<your-app>.vercel.app/api/call-events` (POST)

### Инициализация БД
```bash
curl -XPOST https://<your-app>.vercel.app/api/admin-init -H "x-admin-token: $ADMIN_TOKEN"
```

### Fly.io Realtime
```bash
cd realtime-server
fly launch --no-deploy
fly deploy
```

### Загрузка аватаров (Supabase)
- Создайте public bucket (например `avatars`) в Supabase Storage.
- Добавьте `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` в переменные окружения.
- UI: выберите файл → он кодируется в base64 и отправляется на `/api/avatar-upload` → сервер кладёт в Storage и возвращает public URL → профиль сохраняется.

### Ограничения BLE
- Браузерная PWA выступает только как **central**; для «пара-браузеров» по BLE нужен BLE-периферийный сервер (ESP32/нативный app).
- Отправка ограничена ~20 байт за запись (ограничение BLE).
