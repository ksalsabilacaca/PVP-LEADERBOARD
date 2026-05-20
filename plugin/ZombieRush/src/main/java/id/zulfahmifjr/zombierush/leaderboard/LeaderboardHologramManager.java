package id.zulfahmifjr.zombierush.leaderboard;

import id.zulfahmifjr.zombierush.ZombieRushPlugin;
import id.zulfahmifjr.zombierush.util.LocationUtil;
import net.kyori.adventure.text.Component;
import org.bukkit.ChatColor;
import org.bukkit.Color;
import org.bukkit.Location;
import org.bukkit.World;
import org.bukkit.entity.Display;
import org.bukkit.entity.Entity;
import org.bukkit.entity.TextDisplay;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.scheduler.BukkitTask;

import java.util.List;

public class LeaderboardHologramManager {
    private final ZombieRushPlugin plugin;
    private TextDisplay display;
    private BukkitTask updateTask;

    public LeaderboardHologramManager(ZombieRushPlugin plugin) {
        this.plugin = plugin;
    }

    public void spawnFromConfig() {
        if (!plugin.getConfig().getBoolean("leaderboard.enabled", false)) return;
        Location location = LocationUtil.load(plugin.getConfig(), "leaderboard", false);
        if (location == null) {
            plugin.getLogger().warning("Lokasi leaderboard tidak valid. Silakan atur ulang dengan /zr leaderboard set.");
            return;
        }
        spawn(location);
    }

    public void spawn(Location location) {
        remove();
        World world = location.getWorld();
        if (world == null) return;
        display = world.spawn(location, TextDisplay.class, text -> {
            text.setBillboard(Display.Billboard.CENTER);
            text.setShadowed(true);
            text.setSeeThrough(false);
            text.setDefaultBackground(false);
            text.setBackgroundColor(Color.fromARGB(180, 25, 0, 0));
            text.setLineWidth(260);
            text.setViewRange(32);
            text.getPersistentDataContainer().set(plugin.getLeaderboardDisplayKey(), PersistentDataType.STRING, "true");
            text.text(Component.text(buildText()));
        });
        startTask();
    }

    public void startTask() {
        if (updateTask != null) updateTask.cancel();
        int interval = Math.max(1, plugin.getConfig().getInt("leaderboard.update-interval-seconds", 5));
        updateTask = plugin.getServer().getScheduler().runTaskTimer(plugin, this::updateNow, interval * 20L, interval * 20L);
    }

    public void updateNow() {
        if (display != null && !display.isDead()) {
            display.text(Component.text(buildText()));
        }
    }

    private String buildText() {
        List<LeaderboardEntry> entries = plugin.getLeaderboardService().topBest(10);
        StringBuilder builder = new StringBuilder();
        builder.append(ChatColor.RED).append(ChatColor.BOLD).append("TOP 10 ZOMBIE RUSH").append("\n");
        builder.append(ChatColor.GRAY).append("Leaderboard: Best Score").append("\n\n");

        if (entries.isEmpty()) {
            builder.append(ChatColor.YELLOW).append("Belum ada data skor.").append("\n");
            builder.append(ChatColor.GRAY).append("Mainkan satu sesi untuk masuk ranking.");
            return builder.toString();
        }

        int rank = 1;
        for (LeaderboardEntry entry : entries) {
            ChatColor color = rank == 1 ? ChatColor.GOLD : rank == 2 ? ChatColor.WHITE : rank == 3 ? ChatColor.YELLOW : ChatColor.GRAY;
            builder.append(color)
                    .append(rank)
                    .append(". ")
                    .append(entry.username())
                    .append(ChatColor.DARK_GRAY)
                    .append(" - ")
                    .append(ChatColor.GREEN)
                    .append(entry.score())
                    .append("\n");
            rank++;
        }
        builder.append("\n").append(ChatColor.DARK_GRAY).append(plugin.getLeaderboardService().isRedisConnected() ? "Redis aktif" : "Fallback lokal");
        return builder.toString();
    }

    public void remove() {
        if (updateTask != null) {
            updateTask.cancel();
            updateTask = null;
        }
        if (display != null && !display.isDead()) display.remove();
        display = null;
        for (World world : plugin.getServer().getWorlds()) {
            for (Entity entity : world.getEntities()) {
                if (entity.getPersistentDataContainer().has(plugin.getLeaderboardDisplayKey(), PersistentDataType.STRING)) {
                    entity.remove();
                }
            }
        }
    }
}
