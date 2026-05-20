# Frontend (ZombieRush UI)

Vite + React UI untuk menampilkan leaderboard ZombieRush dari backend API.

## Prasyarat

- Node.js 18+
- Backend API sudah berjalan

## Setup

```bash
npm install
```

Jalankan dev server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Environment Variables

Buat file .env (opsional) di folder frontend/.

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Data Flow

- UI mengambil leaderboard ZombieRush dari endpoint backend:
	- GET /api/zombierush/leaderboard/best
	- GET /api/zombierush/player/:uuid
- Data disesuaikan di src/services/api.js.

## Catatan

- Port default Vite: 5173.
- Pastikan backend mengizinkan CORS untuk dev.
