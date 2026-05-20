# ZombieRush

Plugin Purpur/Paper 1.21.1 untuk mode solo match-based Zombie Rush.

## Prasyarat

- Java 21+
- Server Purpur/Paper 1.21.1
- Redis (opsional, untuk leaderboard realtime)

## Konsep

- Player masuk dari lobby dengan memukul/klik kanan Zombie NPC.
- Plugin membuat world `world_zombie_rush` otomatis.
- Terdapat 5 arena otomatis:
  - Arena 1: x=0
  - Arena 2: x=200
  - Arena 3: x=400
  - Arena 4: x=600
  - Arena 5: x=800
- Setiap arena dipakai oleh 1 player solo match.
- Jika semua arena penuh, player masuk antrean.
- Durasi match default 60 detik.
- Skor utama leaderboard adalah Best Score.
- Redis dipakai untuk leaderboard, dengan fallback `localdata.yml` jika Redis belum aktif.

## Build

```powershell
cd C:\Dev\MC-Java\ZombieRush\ZombieRush
gradle clean build
```

Hasil jar:

```text
build\libs\ZombieRush-1.0.0.jar
```

Copy jar tersebut ke folder `plugins` server Purpur, lalu restart server.

## Command

```text
/zr help
/zr start
/zr status
/zr setupworld
/zr setupworld rebuild
/zr npc set
/zr npc remove
/zr npc info
/zr leaderboard set
/zr leaderboard remove
/zr leaderboard info
/zr lobby set
/zr lobby info
/zr arena info
/zr arena rebuild <id|all>
/zr redis
/zr reload
/zr reset <player>
```

Permission admin:

```text
zombierush.admin
```

## Setup pertama

1. Jalankan `/zr setupworld`.
2. Berdiri di lokasi lobby selesai match, lalu jalankan `/zr lobby set`.
3. Jalankan `/zr npc set`, lalu klik atau break blok tempat Zombie NPC akan berdiri.
4. Jalankan `/zr leaderboard set`, lalu klik atau break blok dasar floating leaderboard.
5. Player dapat memukul/klik kanan NPC untuk mulai.

## Redis

Atur Redis di `plugins/ZombieRush/config.yml`:

```yaml
redis:
  enabled: true
  host: "127.0.0.1"
  port: 6379
  password: ""
  database: 0
```

Jika Redis tidak tersedia, plugin tetap berjalan memakai `localdata.yml`.

## Integrasi Backend

- Plugin menulis data leaderboard ke Redis.
- Backend membaca Redis untuk endpoint ZombieRush.
- Pastikan konfigurasi Redis di plugin dan backend menunjuk ke server yang sama.
