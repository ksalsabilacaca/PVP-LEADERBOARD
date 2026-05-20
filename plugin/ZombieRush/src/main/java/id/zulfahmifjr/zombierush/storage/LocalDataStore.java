package id.zulfahmifjr.zombierush.storage;

import id.zulfahmifjr.zombierush.game.MatchResult;
import id.zulfahmifjr.zombierush.leaderboard.LeaderboardEntry;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public class LocalDataStore {
    private final JavaPlugin plugin;
    private final File file;
    private FileConfiguration data;

    public LocalDataStore(JavaPlugin plugin) {
        this.plugin = plugin;
        this.file = new File(plugin.getDataFolder(), "localdata.yml");
    }

    public void load() {
        if (!plugin.getDataFolder().exists()) {
            plugin.getDataFolder().mkdirs();
        }
        if (!file.exists()) {
            try {
                file.createNewFile();
            } catch (IOException e) {
                plugin.getLogger().warning("Gagal membuat localdata.yml: " + e.getMessage());
            }
        }
        data = YamlConfiguration.loadConfiguration(file);
    }

    public void save() {
        try {
            data.save(file);
        } catch (IOException e) {
            plugin.getLogger().warning("Gagal menyimpan localdata.yml: " + e.getMessage());
        }
    }

    public synchronized void record(MatchResult result) {
        String path = "players." + result.playerId();
        int currentBest = data.getInt(path + ".bestScore", 0);
        int currentTotal = data.getInt(path + ".totalScore", 0);
        int currentKills = data.getInt(path + ".totalKills", 0);
        int currentMatches = data.getInt(path + ".matches", 0);

        data.set(path + ".username", result.username());
        if (result.score() > currentBest) {
            data.set(path + ".bestScore", result.score());
        }
        data.set(path + ".totalScore", currentTotal + result.score());
        data.set(path + ".totalKills", currentKills + result.kills());
        data.set(path + ".matches", currentMatches + 1);
        data.set(path + ".lastScore", result.score());
        data.set(path + ".lastEndReason", result.endReason().name());
        data.set(path + ".lastPlayedAt", result.playedAt().toString());
        save();
    }

    public synchronized List<LeaderboardEntry> topBest(int limit) {
        List<LeaderboardEntry> entries = new ArrayList<>();
        ConfigurationSection players = data.getConfigurationSection("players");
        if (players == null) return entries;

        for (String key : players.getKeys(false)) {
            String username = players.getString(key + ".username", key.substring(0, Math.min(8, key.length())));
            int score = players.getInt(key + ".bestScore", 0);
            entries.add(new LeaderboardEntry(key, username, score));
        }

        entries.sort(Comparator.comparingInt(LeaderboardEntry::score).reversed()
                .thenComparing(LeaderboardEntry::username));
        return entries.stream().limit(limit).toList();
    }

    public synchronized void reset(UUID uuid) {
        data.set("players." + uuid, null);
        save();
    }
}
