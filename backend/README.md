# Backend API

Express backend untuk leaderboard multi-game. Menyediakan REST API dan realtime update via SSE. Menggunakan MongoDB untuk OtherGame dan Redis untuk ZombieRush.

## Prasyarat

- Node.js 18+
- MongoDB
- Redis

## Setup

```bash
npm install
```

Jalankan dev server:

```bash
npm run dev
```

Jalankan production:

```bash
npm start
```

## Environment Variables

Buat file .env (opsional) di folder backend/.

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/pvp-leaderboard

# Pilih salah satu: REDIS_URL atau konfigurasi host/port
REDIS_URL=redis://:password@127.0.0.1:6379/0
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Endpoint

ZombieRush:

- POST /api/zombierush/match-result
- GET /api/zombierush/leaderboard/best?limit=50
- GET /api/zombierush/leaderboard/total?limit=50
- GET /api/zombierush/player/:uuid

OtherGame:

- GET /api/othergame/scores
- POST /api/othergame/scores

Realtime (SSE):

- GET /api/scores/live

## Notes

- SSE dipakai oleh frontend untuk update leaderboard secara realtime.
- Backend tetap bisa berjalan walau MongoDB down, tetapi endpoint OtherGame akan gagal.
