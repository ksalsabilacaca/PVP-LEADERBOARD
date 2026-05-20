package id.zulfahmifjr.zombierush.leaderboard;

import id.zulfahmifjr.zombierush.game.MatchResult;
import id.zulfahmifjr.zombierush.storage.LocalDataStore;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.plugin.java.JavaPlugin;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class RedisLeaderboardService implements LeaderboardService {
    private final JavaPlugin plugin;
    private final LocalDataStore localDataStore;
    private JedisPool pool;
    private boolean redisEnabled;
    private boolean redisConnected;
    private String prefix;

    public RedisLeaderboardService(JavaPlugin plugin, LocalDataStore localDataStore) {
        this.plugin = plugin;
        this.localDataStore = localDataStore;
    }

    public void connect() {
        close();
        FileConfiguration config = plugin.getConfig();
        redisEnabled = config.getBoolean("redis.enabled", true);
        redisConnected = false;
        prefix = config.getString("redis.key-prefix", "zombierush");

        if (!redisEnabled) {
            plugin.getLogger().info("Redis dinonaktifkan melalui config.yml. Leaderboard memakai localdata.yml.");
            return;
        }

        String host = config.getString("redis.host", "127.0.0.1");
        int port = config.getInt("redis.port", 6379);
        int timeout = config.getInt("redis.timeout-ms", 2000);
        int database = config.getInt("redis.database", 0);
        String password = config.getString("redis.password", "");

        try {
            JedisPoolConfig poolConfig = new JedisPoolConfig();
            poolConfig.setMaxTotal(8);
            poolConfig.setMaxIdle(4);
            poolConfig.setMinIdle(0);

            String redisPassword = password == null || password.isBlank() ? null : password;
            pool = new JedisPool(poolConfig, host, port, timeout, redisPassword, database);

            try (Jedis jedis = pool.getResource()) {
                String pong = jedis.ping();
                redisConnected = "PONG".equalsIgnoreCase(pong);
            }

            if (redisConnected) {
                plugin.getLogger().info("Redis terhubung: " + host + ":" + port + " database " + database);
            } else {
                plugin.getLogger().warning("Redis tidak memberikan respons PONG. Leaderboard akan memakai localdata.yml.");
            }
        } catch (Exception e) {
            redisConnected = false;
            plugin.getLogger().warning("Gagal terhubung ke Redis: " + e.getMessage());
            plugin.getLogger().warning("Leaderboard tetap berjalan menggunakan localdata.yml sebagai fallback.");
        }
    }

    public void close() {
        if (pool != null) {
            try {
                pool.close();
            } catch (Exception ignored) {
            }
            pool = null;
        }
        redisConnected = false;
    }

    @Override
    public RecordOutcome record(MatchResult result) {
        long start = System.nanoTime();
        boolean newBest = false;
        try {
            localDataStore.record(result);

            if (redisEnabled && redisConnected && pool != null) {
                try (Jedis jedis = pool.getResource()) {
                    String member = result.playerId().toString();
                    Double currentBest = jedis.zscore(bestKey(), member);
                    newBest = currentBest == null || result.score() > currentBest;

                    if (newBest) {
                        jedis.zadd(bestKey(), result.score(), member);
                    }
                    jedis.zincrby(totalKey(), result.score(), member);

                    Map<String, String> values = new HashMap<>();
                    values.put("username", result.username());
                    values.put("lastScore", String.valueOf(result.score()));
                    values.put("lastKills", String.valueOf(result.kills()));
                    values.put("lastDurationSeconds", String.valueOf(result.durationSeconds()));
                    values.put("lastEndReason", result.endReason().name());
                    values.put("lastPlayedAt", result.playedAt().toString());
                    if (newBest) values.put("bestScore", String.valueOf(result.score()));
                    jedis.hset(playerKey(member), values);
                }
                return new RecordOutcome(true, true, newBest, System.nanoTime() - start, "Leaderboard Redis berhasil diperbarui.");
            }

            return new RecordOutcome(true, false, false, System.nanoTime() - start, "Leaderboard lokal berhasil diperbarui.");
        } catch (Exception e) {
            plugin.getLogger().warning("Gagal memperbarui leaderboard: " + e.getMessage());
            return new RecordOutcome(false, false, false, System.nanoTime() - start, "Gagal memperbarui leaderboard: " + e.getMessage());
        }
    }

    @Override
    public List<LeaderboardEntry> topBest(int limit) {
        if (redisEnabled && redisConnected && pool != null) {
            try (Jedis jedis = pool.getResource()) {
                List<String> members = jedis.zrevrange(bestKey(), 0, Math.max(0, limit - 1));
                List<LeaderboardEntry> entries = new ArrayList<>();
                for (String member : members) {
                    Double score = jedis.zscore(bestKey(), member);
                    String username = jedis.hget(playerKey(member), "username");
                    if (username == null || username.isBlank()) {
                        username = member.substring(0, Math.min(8, member.length()));
                    }
                    entries.add(new LeaderboardEntry(member, username, score == null ? 0 : score.intValue()));
                }
                return entries;
            } catch (Exception e) {
                redisConnected = false;
                plugin.getLogger().warning("Gagal mengambil leaderboard dari Redis. Menggunakan data lokal. Penyebab: " + e.getMessage());
            }
        }
        return localDataStore.topBest(limit);
    }

    @Override
    public void reset(UUID uuid) {
        localDataStore.reset(uuid);
        if (redisEnabled && redisConnected && pool != null) {
            try (Jedis jedis = pool.getResource()) {
                String member = uuid.toString();
                jedis.zrem(bestKey(), member);
                jedis.zrem(totalKey(), member);
                jedis.del(playerKey(member));
            } catch (Exception e) {
                plugin.getLogger().warning("Gagal reset data Redis untuk " + uuid + ": " + e.getMessage());
            }
        }
    }

    @Override
    public boolean isRedisEnabled() {
        return redisEnabled;
    }

    @Override
    public boolean isRedisConnected() {
        return redisConnected;
    }

    @Override
    public String statusText() {
        if (!redisEnabled) return "Redis dinonaktifkan. Fallback: localdata.yml";
        if (redisConnected) return "Redis terhubung dan aktif.";
        return "Redis belum terhubung. Fallback: localdata.yml";
    }

    private String bestKey() {
        return prefix + ":leaderboard:best";
    }

    private String totalKey() {
        return prefix + ":leaderboard:total";
    }

    private String playerKey(String uuid) {
        return prefix + ":player:" + uuid;
    }
}
