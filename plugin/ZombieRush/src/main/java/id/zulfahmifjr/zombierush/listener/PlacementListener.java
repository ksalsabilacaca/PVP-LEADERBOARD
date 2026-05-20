package id.zulfahmifjr.zombierush.listener;

import id.zulfahmifjr.zombierush.ZombieRushPlugin;
import id.zulfahmifjr.zombierush.util.LocationUtil;
import id.zulfahmifjr.zombierush.util.Msg;
import org.bukkit.Location;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.player.PlayerInteractEvent;

public class PlacementListener implements Listener {
    private final ZombieRushPlugin plugin;
    private final PlacementManager placementManager;

    public PlacementListener(ZombieRushPlugin plugin, PlacementManager placementManager) {
        this.plugin = plugin;
        this.placementManager = placementManager;
    }

    @EventHandler
    public void onInteract(PlayerInteractEvent event) {
        if (event.getAction() != Action.LEFT_CLICK_BLOCK && event.getAction() != Action.RIGHT_CLICK_BLOCK)
            return;
        if (event.getClickedBlock() == null)
            return;
        if (!placementManager.has(event.getPlayer().getUniqueId()))
            return;
        event.setCancelled(true);
        handlePlacement(event.getPlayer(), event.getClickedBlock());
    }

    @EventHandler
    public void onBreak(BlockBreakEvent event) {
        if (!placementManager.has(event.getPlayer().getUniqueId()))
            return;
        event.setCancelled(true);
        handlePlacement(event.getPlayer(), event.getBlock());
    }

    private void handlePlacement(Player player, Block block) {
        PlacementMode mode = placementManager.get(player.getUniqueId());
        if (mode == null)
            return;

        if (!player.hasPermission("zombierush.admin")) {
            placementManager.remove(player.getUniqueId());
            Msg.error(player, plugin.getConfig(), "Anda tidak memiliki izin untuk menyelesaikan pengaturan ini.");
            return;
        }

        Location base = block.getLocation().add(0.5, 1.0, 0.5);
        base.setYaw(player.getLocation().getYaw() + 180f);
        base.setPitch(0f);

        switch (mode) {
            case NPC -> {
                plugin.getConfig().set("npc.enabled", true);
                LocationUtil.save(plugin.getConfig(), "npc", base, true);
                plugin.saveConfig();
                plugin.getJoinNpcManager().spawn(base);
                Msg.success(player, plugin.getConfig(), "Lokasi NPC Join Game berhasil disimpan dan NPC telah dibuat.");
                Msg.info(player, plugin.getConfig(),
                        "Player dapat memukul atau klik kanan NPC untuk memulai Zombie Rush.");
            }
            case LEADERBOARD -> {
                Location loc = block.getLocation().add(0.5, 2.2, 0.5);
                plugin.getConfig().set("leaderboard.enabled", true);
                LocationUtil.save(plugin.getConfig(), "leaderboard", loc, false);
                plugin.saveConfig();
                plugin.getLeaderboardHologramManager().spawn(loc);
                Msg.success(player, plugin.getConfig(), "Lokasi floating leaderboard berhasil disimpan.");
            }
            case LOBBY -> {
                Location lobby = player.getLocation().clone();
                plugin.getConfig().set("lobby.enabled", true);
                LocationUtil.save(plugin.getConfig(), "lobby", lobby, true);
                plugin.saveConfig();
                Msg.success(player, plugin.getConfig(), "Lokasi lobby berhasil disimpan.");
            }
        }

        placementManager.remove(player.getUniqueId());
    }
}
