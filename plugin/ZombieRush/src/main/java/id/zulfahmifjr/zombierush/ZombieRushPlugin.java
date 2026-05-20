package id.zulfahmifjr.zombierush;

import id.zulfahmifjr.zombierush.arena.ArenaManager;
import id.zulfahmifjr.zombierush.command.ZombieRushCommand;
import id.zulfahmifjr.zombierush.game.MatchManager;
import id.zulfahmifjr.zombierush.leaderboard.LeaderboardHologramManager;
import id.zulfahmifjr.zombierush.leaderboard.LeaderboardService;
import id.zulfahmifjr.zombierush.leaderboard.RedisLeaderboardService;
import id.zulfahmifjr.zombierush.listener.GameListener;
import id.zulfahmifjr.zombierush.listener.PlacementListener;
import id.zulfahmifjr.zombierush.listener.PlacementManager;
import id.zulfahmifjr.zombierush.npc.JoinNpcManager;
import id.zulfahmifjr.zombierush.storage.LocalDataStore;
import id.zulfahmifjr.zombierush.util.LocationUtil;
import org.bukkit.Location;
import org.bukkit.NamespacedKey;
import org.bukkit.command.PluginCommand;
import org.bukkit.entity.Entity;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.plugin.java.JavaPlugin;

public class ZombieRushPlugin extends JavaPlugin {
    private NamespacedKey joinNpcKey;
    private NamespacedKey joinNpcHologramKey;
    private NamespacedKey leaderboardDisplayKey;
    private NamespacedKey arenaZombieKey;
    private NamespacedKey matchPlayerKey;

    private LocalDataStore localDataStore;
    private RedisLeaderboardService leaderboardService;
    private ArenaManager arenaManager;
    private MatchManager matchManager;
    private JoinNpcManager joinNpcManager;
    private LeaderboardHologramManager leaderboardHologramManager;
    private PlacementManager placementManager;

    @Override
    public void onEnable() {
        saveDefaultConfig();

        joinNpcKey = new NamespacedKey(this, "join_npc");
        joinNpcHologramKey = new NamespacedKey(this, "join_npc_hologram");
        leaderboardDisplayKey = new NamespacedKey(this, "leaderboard_display");
        arenaZombieKey = new NamespacedKey(this, "arena_zombie");
        matchPlayerKey = new NamespacedKey(this, "match_player");

        localDataStore = new LocalDataStore(this);
        localDataStore.load();

        leaderboardService = new RedisLeaderboardService(this, localDataStore);
        leaderboardService.connect();

        arenaManager = new ArenaManager(this);
        matchManager = new MatchManager(this, arenaManager);
        joinNpcManager = new JoinNpcManager(this);
        leaderboardHologramManager = new LeaderboardHologramManager(this);
        placementManager = new PlacementManager();

        getServer().getPluginManager().registerEvents(new PlacementListener(this, placementManager), this);
        getServer().getPluginManager().registerEvents(new GameListener(this), this);

        ZombieRushCommand commandHandler = new ZombieRushCommand(this, placementManager);
        PluginCommand command = getCommand("zombierush");
        if (command != null) {
            command.setExecutor(commandHandler);
            command.setTabCompleter(commandHandler);
        } else {
            getLogger().warning("Command zombierush tidak ditemukan di plugin.yml.");
        }

        getServer().getScheduler().runTaskLater(this, () -> {
            if (getConfig().getBoolean("settings.auto-setup-world-on-enable", true)) {
                boolean build = getConfig().getBoolean("settings.auto-build-arenas-on-enable", true);
                arenaManager.setupWorldAndArenas(build);
            }
            joinNpcManager.spawnFromConfig();
            leaderboardHologramManager.spawnFromConfig();
        }, 40L);

        getLogger().info("ZombieRush berhasil diaktifkan.");
    }

    @Override
    public void onDisable() {
        if (matchManager != null) {
            matchManager.shutdown();
        }
        if (joinNpcManager != null) {
            joinNpcManager.remove();
        }
        if (leaderboardHologramManager != null) {
            leaderboardHologramManager.remove();
        }
        if (leaderboardService != null) {
            leaderboardService.close();
        }
        getLogger().info("ZombieRush telah dinonaktifkan.");
    }

    public boolean isArenaZombie(Entity entity) {
        return entity != null && entity.getPersistentDataContainer().has(arenaZombieKey, PersistentDataType.STRING);
    }

    public Location getNpcLocation() {
        return LocationUtil.load(getConfig(), "npc", true);
    }

    public Location getLeaderboardLocation() {
        return LocationUtil.load(getConfig(), "leaderboard", false);
    }

    public Location getLobbyLocation() {
        if (!getConfig().getBoolean("lobby.enabled", false)) return null;
        return LocationUtil.load(getConfig(), "lobby", true);
    }

    public NamespacedKey getJoinNpcKey() { return joinNpcKey; }
    public NamespacedKey getJoinNpcHologramKey() { return joinNpcHologramKey; }
    public NamespacedKey getLeaderboardDisplayKey() { return leaderboardDisplayKey; }
    public NamespacedKey getArenaZombieKey() { return arenaZombieKey; }
    public NamespacedKey getMatchPlayerKey() { return matchPlayerKey; }

    public ArenaManager getArenaManager() { return arenaManager; }
    public MatchManager getMatchManager() { return matchManager; }
    public JoinNpcManager getJoinNpcManager() { return joinNpcManager; }
    public LeaderboardHologramManager getLeaderboardHologramManager() { return leaderboardHologramManager; }
    public LeaderboardService getLeaderboardService() { return leaderboardService; }
    public RedisLeaderboardService getLeaderboardRedisService() { return leaderboardService; }
}
