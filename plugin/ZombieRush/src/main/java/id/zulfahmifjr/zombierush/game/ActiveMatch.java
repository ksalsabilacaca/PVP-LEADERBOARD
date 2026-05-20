package id.zulfahmifjr.zombierush.game;

import id.zulfahmifjr.zombierush.arena.Arena;
import org.bukkit.entity.Zombie;
import org.bukkit.scheduler.BukkitTask;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class ActiveMatch {
    private final UUID playerId;
    private final String username;
    private final Arena arena;
    private final PlayerSnapshot snapshot;
    private final Instant startedAt;
    private int remainingSeconds;
    private int elapsedSeconds;
    private int score;
    private int kills;
    private boolean running;
    private BukkitTask timerTask;
    private BukkitTask spawnTask;
    private final Set<UUID> zombieIds = new HashSet<>();

    public ActiveMatch(UUID playerId, String username, Arena arena, PlayerSnapshot snapshot, int durationSeconds) {
        this.playerId = playerId;
        this.username = username;
        this.arena = arena;
        this.snapshot = snapshot;
        this.startedAt = Instant.now();
        this.remainingSeconds = durationSeconds;
        this.running = false;
    }

    public UUID playerId() { return playerId; }
    public String username() { return username; }
    public Arena arena() { return arena; }
    public PlayerSnapshot snapshot() { return snapshot; }
    public Instant startedAt() { return startedAt; }
    public int remainingSeconds() { return remainingSeconds; }
    public void remainingSeconds(int remainingSeconds) { this.remainingSeconds = remainingSeconds; }
    public int elapsedSeconds() { return elapsedSeconds; }
    public void elapsedSeconds(int elapsedSeconds) { this.elapsedSeconds = elapsedSeconds; }
    public int score() { return score; }
    public void addScore(int amount) { this.score += amount; }
    public int kills() { return kills; }
    public void addKill() { this.kills++; }
    public boolean running() { return running; }
    public void running(boolean running) { this.running = running; }
    public BukkitTask timerTask() { return timerTask; }
    public void timerTask(BukkitTask timerTask) { this.timerTask = timerTask; }
    public BukkitTask spawnTask() { return spawnTask; }
    public void spawnTask(BukkitTask spawnTask) { this.spawnTask = spawnTask; }
    public Set<UUID> zombieIds() { return zombieIds; }
    public void addZombie(Zombie zombie) { this.zombieIds.add(zombie.getUniqueId()); }
}
