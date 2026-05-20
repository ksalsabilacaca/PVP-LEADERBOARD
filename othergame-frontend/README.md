# OtherGame Frontend (RPS Arena)

Next.js UI untuk game RPS (Rock Paper Scissors) dengan leaderboard terhubung ke backend API.

## Prasyarat

- Node.js 18+
- Backend API sudah berjalan

## Setup

```bash
npm install
```

Jalankan dev server (port 3001):

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Start production:

```bash
npm run start
```

## Environment Variables

Buat file .env.local (opsional) di folder othergame-frontend/.

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

## Data Flow

- GET /api/othergame/scores untuk leaderboard
- POST /api/othergame/scores untuk submit skor
- SSE GET /api/scores/live untuk update realtime

## Catatan

- Jika backend tidak aktif, UI akan menampilkan error koneksi.
