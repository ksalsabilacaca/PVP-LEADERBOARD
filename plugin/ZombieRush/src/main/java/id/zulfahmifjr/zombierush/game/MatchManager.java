package id.zulfahmifjr.zombierush.game;

import id.zulfahmifjr.zombierush.ZombieRushPlugin;
import id.zulfahmifjr.zombierush.arena.Arena;
import id.zulfahmifjr.zombierush.arena.ArenaManager;
import id.zulfahmifjr.zombierush.leaderboard.RecordOutcome;
import id.zulfahmifjr.zombierush.util.LocationUtil;
import id.zulfahmifjr.zombierush.util.Msg;
import org.bukkit.*;
import org.bukkit.attribute.Attribute;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;
import org.bukkit.entity.Zombie;
import org.bukkit.inventory.ItemStack;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.potion.PotionEffect;
import org.bukkit.scheduler.BukkitTask;

import java.time.Instant;
import java.util.*;

public class MatchManager {
    private final ZombieRushPlugin plugin;
    private final ArenaManager arenaManager;
    private final Map<UUID, ActiveMatch> activeMatches = new HashMap<>();
    private final Queue<UUID> queue = new ArrayDeque<>();
    private final Random random = new Random();

    public MatchManager(ZombieRushPlugin plugin, ArenaManager arenaManager) {
        this.plugin = plugin;
        this.arenaManager = arenaManager;
    }

    public boolean isInMatch(UUID uuid) {
        return activeMatches.containsKey(uuid);
    }

    public boolean isQueued(UUID uuid) {
        return queue.contains(uuid);
    }

    public ActiveMatch getMatch(UUID uuid) {
        return activeMatches.get(uuid);
    }

    public Collection<ActiveMatch> activeMatches() {
        return Collections.unmodifiableCollection(activeMatches.values());
    }

    public void requestStart(Player player) {
        if (isInMatch(player.getUniqueId())) {
            Msg.warn(player, plugin.getConfig(), "Anda sudah berada di dalam sesi Zombie Rush.");
            return;
        }
        if (isQueued(player.getUniqueId())) {
            Msg.warn(player, plugin.getConfig(), "Anda sudah berada di dalam antrean. Posisi antrean Anda: "
                    + queuePosition(player.getUniqueId()) + ".");
            return;
        }

        Optional<Arena> available = arenaManager.findAvailableArena();
        if (available.isEmpty()) {
            queue.add(player.getUniqueId());
            Msg.warn(player, plugin.getConfig(), "Seluruh arena sedang digunakan. Anda masuk antrean pada posisi ke-"
                    + queuePosition(player.getUniqueId()) + ".");
            return;
        }

        prepareMatch(player, available.get());
    }

    private int queuePosition(UUID uuid) {
        int i = 1;
        for (UUID queued : queue) {
            if (queued.equals(uuid))
                return i;
            i++;
        }
        return -1;
    }

    private void prepareMatch(Player player, Arena arena) {
        int duration = plugin.getConfig().getInt("settings.match-duration-seconds", 60);
        PlayerSnapshot snapshot = new PlayerSnapshot(player);
        ActiveMatch match = new ActiveMatch(player.getUniqueId(), player.getName(), arena, snapshot, duration);
        activeMatches.put(player.getUniqueId(), match);
        arenaManager.markInUse(arena, player.getUniqueId());

        setupPlayerForMatch(player, arena);
        int countdown = plugin.getConfig().getInt("settings.countdown-seconds", 5);
        Msg.info(player, plugin.getConfig(), "Sesi Zombie Rush akan dimulai. Bersiaplah di Arena " + arena.id() + ".");
        startCountdown(player, match, countdown);
    }

    private void setupPlayerForMatch(Player player, Arena arena) {
        for (PotionEffect effect : player.getActivePotionEffects()) {
            player.removePotionEffect(effect.getType());
        }
        player.setGameMode(GameMode.SURVIVAL);
        if (plugin.getConfig().getBoolean("settings.clear-player-inventory-during-match", true)) {
            player.getInventory().clear();
            player.getInventory().setArmorContents(null);
            player.getInventory().setItemInOffHand(new ItemStack(Material.AIR));
        }
        ItemStack sword = new ItemStack(Material.DIAMOND_SWORD);
        player.getInventory().setItem(0, sword);
        player.getInventory().setHeldItemSlot(0);
        player.getInventory().addItem(new ItemStack(Material.COOKED_BEEF, 8));
        player.getInventory().setItemInOffHand(new ItemStack(Material.SHIELD));
        player.setFoodLevel(20);
        player.setSaturation(20f);
        double maxHealth = player.getAttribute(Attribute.GENERIC_MAX_HEALTH) == null ? 20.0D
                : player.getAttribute(Attribute.GENERIC_MAX_HEALTH).getValue();
        player.setHealth(maxHealth);
        player.teleport(arena.playerSpawn());
    }

    private void startCountdown(Player player, ActiveMatch match, int countdown) {
        final int[] remaining = { Math.max(1, countdown) };
        BukkitTask task = Bukkit.getScheduler().runTaskTimer(plugin, () -> {
            if (!player.isOnline() || !activeMatches.containsKey(player.getUniqueId())) {
                return;
            }
            if (remaining[0] <= 0) {
                startRunningMatch(player, match);
                return;
            }
            player.sendTitle(ChatColor.RED + "Zombie Rush",
                    ChatColor.YELLOW + "Dimulai dalam " + remaining[0] + " detik", 0, 20, 0);
            player.playSound(player.getLocation(), Sound.BLOCK_NOTE_BLOCK_PLING, 0.8f, 1.5f);
            remaining[0]--;
        }, 0L, 20L);

        Bukkit.getScheduler().runTaskLater(plugin, task::cancel, (countdown + 2L) * 20L);
    }

    private void startRunningMatch(Player player, ActiveMatch match) {
        if (!activeMatches.containsKey(player.getUniqueId()) || match.running())
            return;
        match.running(true);
        Msg.success(player, plugin.getConfig(),
                "Sesi dimulai. Bertahan selama 60 detik dan kalahkan zombie sebanyak mungkin.");
        player.sendTitle(ChatColor.GREEN + "MULAI!", ChatColor.GRAY + "Bunuh zombie sebanyak mungkin.", 0, 30, 10);
        spawnWave(match);

        BukkitTask timerTask = Bukkit.getScheduler().runTaskTimer(plugin, () -> tickMatch(player, match), 20L, 20L);
        match.timerTask(timerTask);

        int spawnInterval = Math.max(1, plugin.getConfig().getInt("settings.spawn-interval-seconds", 4));
        BukkitTask spawnTask = Bukkit.getScheduler().runTaskTimer(plugin, () -> {
            if (activeMatches.containsKey(player.getUniqueId()) && match.running()) {
                spawnWave(match);
            }
        }, spawnInterval * 20L, spawnInterval * 20L);
        match.spawnTask(spawnTask);
    }

    private void tickMatch(Player player, ActiveMatch match) {
        if (!player.isOnline()) {
            finishMatch(player, EndReason.QUIT);
            return;
        }
        if (!match.running())
            return;
        match.remainingSeconds(match.remainingSeconds() - 1);
        match.elapsedSeconds(match.elapsedSeconds() + 1);

        player.setLevel(Math.max(0, match.remainingSeconds()));
        player.setExp(Math.max(0f, Math.min(1f,
                match.remainingSeconds() / (float) plugin.getConfig().getInt("settings.match-duration-seconds", 60))));
        player.spigot().sendMessage(net.md_5.bungee.api.ChatMessageType.ACTION_BAR,
                new net.md_5.bungee.api.chat.TextComponent(ChatColor.YELLOW + "Waktu: " + match.remainingSeconds() + "s"
                        + ChatColor.GRAY + " | " + ChatColor.RED + "Kill: " + match.kills() + ChatColor.GRAY + " | "
                        + ChatColor.GREEN + "Skor: " + match.score()));

        if (match.remainingSeconds() <= 0) {
            match.addScore(plugin.getConfig().getInt("settings.survival-bonus", 100));
            finishMatch(player, EndReason.TIME_UP);
        }
    }

    private void spawnWave(ActiveMatch match) {
        Player player = Bukkit.getPlayer(match.playerId());
        if (player == null || !player.isOnline())
            return;
        Arena arena = match.arena();
        World world = arena.center().getWorld();
        if (world == null)
            return;

        long activeZombieCount = match.zombieIds().stream()
                .map(Bukkit::getEntity)
                .filter(Objects::nonNull)
                .filter(entity -> !entity.isDead())
                .count();
        int maxActive = plugin.getConfig().getInt("settings.max-active-zombies", 12);
        if (activeZombieCount >= maxActive)
            return;

        int amount = Math.min(3 + (match.elapsedSeconds() / 15), maxActive - (int) activeZombieCount);
        List<Location> spawns = arena.zombieSpawns();
        for (int i = 0; i < amount; i++) {
            Location spawn = spawns.get(random.nextInt(spawns.size()));
            Zombie zombie = world.spawn(spawn, Zombie.class, z -> {
                z.setRemoveWhenFarAway(false);
                z.setPersistent(false);
                z.setTarget(player);
                z.setCustomName(ChatColor.RED + "Zombie Rush");
                z.setCustomNameVisible(false);
                double zombieHealth = Math.max(1.0, plugin.getConfig().getDouble("settings.zombie-health", 6.0));
                if (z.getAttribute(Attribute.GENERIC_MAX_HEALTH) != null) {
                    z.getAttribute(Attribute.GENERIC_MAX_HEALTH).setBaseValue(zombieHealth);
                }
                z.setHealth(Math.min(zombieHealth, z.getHealth()));
                z.getPersistentDataContainer().set(plugin.getArenaZombieKey(), PersistentDataType.STRING,
                        String.valueOf(arena.id()));
                z.getPersistentDataContainer().set(plugin.getMatchPlayerKey(), PersistentDataType.STRING,
                        match.playerId().toString());
            });
            match.addZombie(zombie);
        }
    }

    public void handleZombieKill(Player player, Zombie zombie) {
        ActiveMatch match = activeMatches.get(player.getUniqueId());
        if (match == null || !match.running())
            return;
        if (!plugin.isArenaZombie(zombie))
            return;

        String arenaId = zombie.getPersistentDataContainer().get(plugin.getArenaZombieKey(), PersistentDataType.STRING);
        if (arenaId == null || !arenaId.equals(String.valueOf(match.arena().id())))
            return;

        match.addKill();
        int scorePerKill = plugin.getConfig().getInt("settings.score-per-kill", 10);
        int scorePerKillBaby = plugin.getConfig().getInt("settings.score-per-kill-baby", 15);
        int killScore = zombie.isBaby() ? scorePerKillBaby : scorePerKill;
        match.addScore(killScore);
        player.playSound(player.getLocation(), Sound.ENTITY_EXPERIENCE_ORB_PICKUP, 0.6f, 1.8f);
        player.spigot().sendMessage(net.md_5.bungee.api.ChatMessageType.ACTION_BAR,
                new net.md_5.bungee.api.chat.TextComponent(ChatColor.GREEN + "+" + killScore + " skor"
                        + ChatColor.GRAY + " | Kill: " + match.kills() + " | Total: " + match.score()));
    }

    public void handleZombieHit(Player player, Zombie zombie) {
        ActiveMatch match = activeMatches.get(player.getUniqueId());
        if (match == null || !match.running())
            return;
        if (!plugin.isArenaZombie(zombie))
            return;

        String arenaId = zombie.getPersistentDataContainer().get(plugin.getArenaZombieKey(), PersistentDataType.STRING);
        if (arenaId == null || !arenaId.equals(String.valueOf(match.arena().id())))
            return;

        String matchOwner = zombie.getPersistentDataContainer().get(plugin.getMatchPlayerKey(),
                PersistentDataType.STRING);
        if (matchOwner != null && !matchOwner.equals(match.playerId().toString()))
            return;

        int scorePerHit = plugin.getConfig().getInt("settings.score-per-hit", 1);
        match.addScore(scorePerHit);
    }

    public void handleFatalDamage(Player player) {
        if (!activeMatches.containsKey(player.getUniqueId()))
            return;
        finishMatch(player, EndReason.DEATH);
    }

    public void finishMatch(Player player, EndReason reason) {
        ActiveMatch match = activeMatches.remove(player.getUniqueId());
        if (match == null)
            return;
        cancelTasks(match);
        match.running(false);

        int duration = Math.max(0, match.elapsedSeconds());
        MatchResult result = new MatchResult(
                match.playerId(),
                match.username(),
                Math.max(0, match.score()),
                match.kills(),
                duration,
                reason,
                Instant.now());

        arenaManager.release(match.arena());

        if (player != null && player.isOnline()) {
            boolean restoreInventory = plugin.getConfig().getBoolean("settings.restore-player-inventory-after-match",
                    true);
            match.snapshot().restore(player, restoreInventory);
            Location lobby = plugin.getLobbyLocation();
            if (lobby != null) {
                player.teleport(lobby);
            } else {
                player.teleport(match.snapshot().location());
            }
        }

        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            RecordOutcome outcome = plugin.getLeaderboardService().record(result);
            Bukkit.getScheduler().runTask(plugin, () -> {
                plugin.getLeaderboardHologramManager().updateNow();
                if (player != null && player.isOnline()) {
                    sendResultMessage(player, result, outcome);
                }
                startNextQueuedPlayer();
            });
        });
    }

    private void sendResultMessage(Player player, MatchResult result, RecordOutcome outcome) {
        player.sendMessage(" ");
        Msg.info(player, plugin.getConfig(), "Sesi Zombie Rush selesai.");
        Msg.info(player, plugin.getConfig(), "Alasan selesai: &f" + result.endReason().displayName());
        Msg.info(player, plugin.getConfig(), "Kill: &f" + result.kills() + " &7| Skor: &f" + result.score()
                + " &7| Durasi: &f" + result.durationSeconds() + " detik");
        if (outcome.success()) {
            if (outcome.redisUsed() && plugin.getConfig().getBoolean("settings.show-redis-timing-to-player", true)) {
                Msg.success(player, plugin.getConfig(),
                        String.format("Leaderboard Redis diperbarui dalam %.3f ms.", outcome.elapsedMillis()));
            } else {
                Msg.success(player, plugin.getConfig(), "Leaderboard berhasil diperbarui.");
            }
        } else {
            Msg.error(player, plugin.getConfig(), outcome.message());
        }
        player.sendMessage(" ");
    }

    private void startNextQueuedPlayer() {
        while (!queue.isEmpty()) {
            UUID next = queue.poll();
            Player player = Bukkit.getPlayer(next);
            if (player == null || !player.isOnline())
                continue;
            if (isInMatch(next))
                continue;
            Optional<Arena> available = arenaManager.findAvailableArena();
            if (available.isEmpty()) {
                queue.add(next);
                return;
            }
            Msg.info(player, plugin.getConfig(), "Giliran Anda telah tiba. Sesi akan dimulai sekarang.");
            prepareMatch(player, available.get());
            return;
        }
    }

    public void removeFromQueue(UUID uuid) {
        queue.remove(uuid);
    }

    public void shutdown() {
        List<UUID> players = new ArrayList<>(activeMatches.keySet());
        for (UUID uuid : players) {
            Player player = Bukkit.getPlayer(uuid);
            if (player != null) {
                finishMatch(player, EndReason.PLUGIN_DISABLE);
            } else {
                ActiveMatch match = activeMatches.remove(uuid);
                if (match != null) {
                    cancelTasks(match);
                    arenaManager.release(match.arena());
                }
            }
        }
        queue.clear();
    }

    private void cancelTasks(ActiveMatch match) {
        if (match.timerTask() != null)
            match.timerTask().cancel();
        if (match.spawnTask() != null)
            match.spawnTask().cancel();
    }
}
