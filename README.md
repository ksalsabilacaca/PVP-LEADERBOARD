# Group 3 - SBD 01:
1. Jesaya Hamonangan Gaudensius Malau (2406409845)
2. Naziehan Labieb (2406487102)
3. Salsabila Maharani Mumtaz (2406348156)
4. Syifa Aulia Azhim (2406413445)
5. Zulfahmi Fajri (2406345425)

# PVP Leaderboard

Platform leaderboard multi-game yang menggabungkan backend API, dua frontend web, dan plugin Minecraft. Data ZombieRush disimpan di Redis oleh plugin dan dibaca backend. Data OtherGame disimpan di MongoDB oleh backend. Frontend mengonsumsi API dan SSE untuk update realtime.

## Ringkasan

- Backend Express: REST API + SSE
- ZombieRush (Minecraft): plugin Purpur/Paper menulis leaderboard ke Redis
- OtherGame (RPS Web): frontend Next.js membaca API
- ZombieRush UI: frontend Vite React membaca API

## Fitur Utama

- Leaderboard ZombieRush (best dan total score)
- Leaderboard OtherGame (RPS) dengan update realtime via SSE
- Endpoint player detail untuk ZombieRush
- Simulasi match untuk frontend UI (opsional)

## Struktur Project

```
PVP-LEADERBOARD/
├── backend/               # REST API + SSE
├── frontend/              # Vite React UI (ZombieRush)
├── othergame-frontend/    # Next.js UI (OtherGame RPS)
└── plugin/ZombieRush/     # Minecraft plugin (Redis writer)
```

## Prasyarat

- Node.js 18+ dan npm
- MongoDB (untuk OtherGame)
- Redis (untuk ZombieRush)
- Java 21+ dan Gradle (untuk build plugin)

## Quick Start (Local)

1) Backend

```bash
cd backend
npm install
npm run dev
```

2) Frontend ZombieRush

```bash
cd frontend
npm install
npm run dev
```

3) OtherGame Frontend (RPS)

```bash
cd othergame-frontend
npm install
npm run dev
```

4) Plugin ZombieRush

Ikuti petunjuk di README plugin: plugin/ZombieRush/README.md

## Environment Configuration

Backend (folder backend/):

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

Frontend ZombieRush (folder frontend/):

```env
VITE_API_BASE_URL=http://localhost:3000
```

OtherGame Frontend (folder othergame-frontend/):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

## API Reference

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

## Ports Default

- Backend: 3000
- Vite (ZombieRush UI): 5173
- Next.js (OtherGame UI): 3001
