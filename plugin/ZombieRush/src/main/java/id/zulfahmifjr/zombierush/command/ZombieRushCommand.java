package id.zulfahmifjr.zombierush.command;

import id.zulfahmifjr.zombierush.ZombieRushPlugin;
import id.zulfahmifjr.zombierush.arena.Arena;
import id.zulfahmifjr.zombierush.listener.PlacementManager;
import id.zulfahmifjr.zombierush.listener.PlacementMode;
import id.zulfahmifjr.zombierush.util.LocationUtil;
import id.zulfahmifjr.zombierush.util.Msg;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ZombieRushCommand implements CommandExecutor, TabCompleter {
    private final ZombieRushPlugin plugin;
    private final PlacementManager placementManager;

    public ZombieRushCommand(ZombieRushPlugin plugin, PlacementManager placementManager) {
        this.plugin = plugin;
        this.placementManager = placementManager;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0 || args[0].equalsIgnoreCase("help")) {
            sendHelp(sender);
            return true;
        }

        String sub = args[0].toLowerCase(Locale.ROOT);

        switch (sub) {
            case "start" -> {
                if (!(sender instanceof Player player)) {
                    Msg.error(sender, plugin.getConfig(), "Perintah ini hanya dapat digunakan oleh player.");
                    return true;
                }
                plugin.getMatchManager().requestStart(player);
                return true;
            }
            case "status" -> {
                Msg.info(sender, plugin.getConfig(), "Status Redis: &f" + plugin.getLeaderboardService().statusText());
                Msg.info(sender, plugin.getConfig(),
                        "Arena aktif: &f" + plugin.getMatchManager().activeMatches().size());
                return true;
            }
            case "setupworld" -> {
                if (!checkAdmin(sender))
                    return true;
                boolean rebuild = args.length > 1 && args[1].equalsIgnoreCase("rebuild");
                Msg.info(sender, plugin.getConfig(),
                        rebuild ? "Membangun ulang world dan seluruh arena..." : "Membuat atau memuat world arena...");
                plugin.getArenaManager().setupWorldAndArenas(rebuild);
                Msg.success(sender, plugin.getConfig(),
                        "World arena siap digunakan. Total arena: " + plugin.getArenaManager().arenas().size() + ".");
                return true;
            }
            case "arena" -> {
                if (!checkAdmin(sender))
                    return true;
                handleArena(sender, args);
                return true;
            }
            case "npc" -> {
                if (!checkAdmin(sender))
                    return true;
                handleNpc(sender, args);
                return true;
            }
            case "leaderboard", "lead" -> {
                if (!checkAdmin(sender))
                    return true;
                handleLeaderboard(sender, args);
                return true;
            }
            case "lobby" -> {
                if (!checkAdmin(sender))
                    return true;
                handleLobby(sender, args);
                return true;
            }
            case "reload" -> {
                if (!checkAdmin(sender))
                    return true;
                plugin.reloadConfig();
                plugin.getLeaderboardRedisService().connect();
                plugin.getJoinNpcManager().spawnFromConfig();
                plugin.getLeaderboardHologramManager().spawnFromConfig();
                plugin.getHubManager().setupHubWorld();
                Msg.success(sender, plugin.getConfig(), "Konfigurasi ZombieRush berhasil dimuat ulang.");
                return true;
            }
            case "redis" -> {
                if (!checkAdmin(sender))
                    return true;
                Msg.info(sender, plugin.getConfig(), "Status Redis: &f" + plugin.getLeaderboardService().statusText());
                return true;
            }
            case "reset" -> {
                if (!checkAdmin(sender))
                    return true;
                if (args.length < 2) {
                    Msg.error(sender, plugin.getConfig(), "Format salah. Gunakan: /zr reset <player>");
                    return true;
                }
                Player target = Bukkit.getPlayerExact(args[1]);
                if (target == null) {
                    Msg.error(sender, plugin.getConfig(), "Player tidak ditemukan atau sedang offline.");
                    return true;
                }
                plugin.getLeaderboardService().reset(target.getUniqueId());
                plugin.getLeaderboardHologramManager().updateNow();
                Msg.success(sender, plugin.getConfig(),
                        "Data leaderboard milik " + target.getName() + " berhasil direset.");
                return true;
            }
            default -> {
                Msg.error(sender, plugin.getConfig(),
                        "Sub-command tidak dikenal. Gunakan /zr help untuk melihat bantuan.");
                return true;
            }
        }
    }

    private void sendHelp(CommandSender sender) {
        sender.sendMessage(" ");
        Msg.info(sender, plugin.getConfig(), "&f/zr start &7- Memulai sesi Zombie Rush.");
        Msg.info(sender, plugin.getConfig(), "&f/zr status &7- Melihat status singkat game.");
        if (sender.hasPermission("zombierush.admin")) {
            Msg.info(sender, plugin.getConfig(), "&f/zr setupworld &7- Membuat world dan 5 arena otomatis.");
            Msg.info(sender, plugin.getConfig(), "&f/zr setupworld rebuild &7- Membangun ulang seluruh arena.");
            Msg.info(sender, plugin.getConfig(), "&f/zr npc set/remove/info &7- Mengatur Zombie NPC Join Game.");
            Msg.info(sender, plugin.getConfig(),
                    "&f/zr leaderboard set/remove/info &7- Mengatur floating leaderboard.");
            Msg.info(sender, plugin.getConfig(), "&f/zr lobby set/info &7- Mengatur lokasi lobby selesai match.");
            Msg.info(sender, plugin.getConfig(),
                    "&f/zr arena info/rebuild <id> &7- Melihat atau membangun ulang arena.");
            Msg.info(sender, plugin.getConfig(), "&f/zr reload &7- Memuat ulang konfigurasi.");
        }
        sender.sendMessage(" ");
    }

    private boolean checkAdmin(CommandSender sender) {
        if (!sender.hasPermission("zombierush.admin")) {
            Msg.error(sender, plugin.getConfig(), "Anda tidak memiliki izin untuk menggunakan perintah ini.");
            return false;
        }
        return true;
    }

    private void handleNpc(CommandSender sender, String[] args) {
        if (args.length < 2) {
            Msg.error(sender, plugin.getConfig(),
                    "Format salah. Gunakan: /zr npc set, /zr npc remove, atau /zr npc info.");
            return;
        }
        String action = args[1].toLowerCase(Locale.ROOT);
        switch (action) {
            case "set" -> {
                if (!(sender instanceof Player player)) {
                    Msg.error(sender, plugin.getConfig(), "Perintah ini hanya dapat digunakan oleh player.");
                    return;
                }
                placementManager.set(player.getUniqueId(), PlacementMode.NPC);
                Msg.info(player, plugin.getConfig(),
                        "Mode pengaturan NPC aktif. Silakan klik atau hancurkan blok tempat NPC akan berdiri.");
            }
            case "remove" -> {
                plugin.getConfig().set("npc.enabled", false);
                plugin.saveConfig();
                plugin.getJoinNpcManager().remove();
                Msg.success(sender, plugin.getConfig(), "NPC Join Game berhasil dihapus.");
            }
            case "info" -> Msg.info(sender, plugin.getConfig(),
                    "Lokasi NPC: &f" + LocationUtil.shortString(plugin.getNpcLocation()));
            case "cancel" -> {
                if (sender instanceof Player player)
                    placementManager.remove(player.getUniqueId());
                Msg.success(sender, plugin.getConfig(), "Mode pengaturan NPC dibatalkan.");
            }
            default -> Msg.error(sender, plugin.getConfig(),
                    "Aksi NPC tidak dikenal. Gunakan set, remove, info, atau cancel.");
        }
    }

    private void handleLeaderboard(CommandSender sender, String[] args) {
        if (args.length < 2) {
            Msg.error(sender, plugin.getConfig(), "Format salah. Gunakan: /zr leaderboard set, remove, atau info.");
            return;
        }
        String action = args[1].toLowerCase(Locale.ROOT);
        switch (action) {
            case "set" -> {
                if (!(sender instanceof Player player)) {
                    Msg.error(sender, plugin.getConfig(), "Perintah ini hanya dapat digunakan oleh player.");
                    return;
                }
                placementManager.set(player.getUniqueId(), PlacementMode.LEADERBOARD);
                Msg.info(player, plugin.getConfig(),
                        "Mode pengaturan leaderboard aktif. Silakan klik atau hancurkan blok dasar floating leaderboard.");
            }
            case "remove" -> {
                plugin.getConfig().set("leaderboard.enabled", false);
                plugin.saveConfig();
                plugin.getLeaderboardHologramManager().remove();
                Msg.success(sender, plugin.getConfig(), "Floating leaderboard berhasil dihapus.");
            }
            case "info" -> Msg.info(sender, plugin.getConfig(),
                    "Lokasi leaderboard: &f" + LocationUtil.shortString(plugin.getLeaderboardLocation()));
            case "cancel" -> {
                if (sender instanceof Player player)
                    placementManager.remove(player.getUniqueId());
                Msg.success(sender, plugin.getConfig(), "Mode pengaturan leaderboard dibatalkan.");
            }
            default -> Msg.error(sender, plugin.getConfig(),
                    "Aksi leaderboard tidak dikenal. Gunakan set, remove, info, atau cancel.");
        }
    }

    private void handleLobby(CommandSender sender, String[] args) {
        if (args.length < 2) {
            Msg.error(sender, plugin.getConfig(), "Format salah. Gunakan: /zr lobby set atau /zr lobby info.");
            return;
        }
        String action = args[1].toLowerCase(Locale.ROOT);
        switch (action) {
            case "set" -> {
                if (!(sender instanceof Player player)) {
                    Msg.error(sender, plugin.getConfig(), "Perintah ini hanya dapat digunakan oleh player.");
                    return;
                }
                plugin.getConfig().set("lobby.enabled", true);
                LocationUtil.save(plugin.getConfig(), "lobby", player.getLocation(), true);
                plugin.saveConfig();
                Msg.success(player, plugin.getConfig(), "Lokasi lobby berhasil disimpan di posisi Anda saat ini.");
            }
            case "info" -> Msg.info(sender, plugin.getConfig(),
                    "Lokasi lobby: &f" + LocationUtil.shortString(plugin.getLobbyLocation()));
            default -> Msg.error(sender, plugin.getConfig(), "Aksi lobby tidak dikenal. Gunakan set atau info.");
        }
    }

    private void handleArena(CommandSender sender, String[] args) {
        if (args.length < 2 || args[1].equalsIgnoreCase("info")) {
            if (plugin.getArenaManager().arenas().isEmpty()) {
                Msg.warn(sender, plugin.getConfig(), "Arena belum tersedia. Jalankan /zr setupworld terlebih dahulu.");
                return;
            }
            for (Arena arena : plugin.getArenaManager().arenas()) {
                Msg.info(sender, plugin.getConfig(), "Arena " + arena.id() + ": &f" + arena.status().name()
                        + " &7| Center: &f" + LocationUtil.shortString(arena.center()));
            }
            return;
        }

        if (args[1].equalsIgnoreCase("rebuild")) {
            if (args.length < 3) {
                Msg.error(sender, plugin.getConfig(), "Format salah. Gunakan: /zr arena rebuild <id|all>");
                return;
            }
            if (args[2].equalsIgnoreCase("all")) {
                plugin.getArenaManager().setupWorldAndArenas(true);
                Msg.success(sender, plugin.getConfig(), "Seluruh arena berhasil dibangun ulang.");
                return;
            }
            try {
                int id = Integer.parseInt(args[2]);
                plugin.getArenaManager().rebuildArena(id);
                Msg.success(sender, plugin.getConfig(), "Arena " + id + " berhasil dibangun ulang.");
            } catch (NumberFormatException e) {
                Msg.error(sender, plugin.getConfig(), "ID arena harus berupa angka atau 'all'.");
            }
            return;
        }
        Msg.error(sender, plugin.getConfig(), "Aksi arena tidak dikenal. Gunakan info atau rebuild.");
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        List<String> values = new ArrayList<>();
        if (args.length == 1) {
            values.addAll(List.of("help", "start", "status"));
            if (sender.hasPermission("zombierush.admin")) {
                values.addAll(
                        List.of("setupworld", "arena", "npc", "leaderboard", "lobby", "redis", "reload", "reset"));
            }
            return filter(values, args[0]);
        }
        if (args.length == 2 && sender.hasPermission("zombierush.admin")) {
            switch (args[0].toLowerCase(Locale.ROOT)) {
                case "npc", "leaderboard" -> values.addAll(List.of("set", "remove", "info", "cancel"));
                case "lobby" -> values.addAll(List.of("set", "info"));
                case "arena" -> values.addAll(List.of("info", "rebuild"));
                case "setupworld" -> values.add("rebuild");
                case "reset" -> Bukkit.getOnlinePlayers().forEach(p -> values.add(p.getName()));
            }
            return filter(values, args[1]);
        }
        if (args.length == 3 && args[0].equalsIgnoreCase("arena") && args[1].equalsIgnoreCase("rebuild")) {
            values.add("all");
            for (int i = 1; i <= plugin.getConfig().getInt("world.arena-count", 5); i++)
                values.add(String.valueOf(i));
            return filter(values, args[2]);
        }
        return values;
    }

    private List<String> filter(List<String> input, String prefix) {
        String lower = prefix.toLowerCase(Locale.ROOT);
        return input.stream().filter(s -> s.toLowerCase(Locale.ROOT).startsWith(lower)).toList();
    }
}
