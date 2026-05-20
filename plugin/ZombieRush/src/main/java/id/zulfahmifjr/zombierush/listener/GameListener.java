package id.zulfahmifjr.zombierush.listener;

import id.zulfahmifjr.zombierush.ZombieRushPlugin;
import id.zulfahmifjr.zombierush.game.ActiveMatch;
import id.zulfahmifjr.zombierush.game.EndReason;
import id.zulfahmifjr.zombierush.util.Msg;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;
import org.bukkit.entity.Zombie;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.event.entity.EntityDeathEvent;
import org.bukkit.event.entity.EntityTargetEvent;
import org.bukkit.event.player.PlayerDropItemEvent;
import org.bukkit.event.player.PlayerInteractEntityEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.persistence.PersistentDataType;

public class GameListener implements Listener {
    private final ZombieRushPlugin plugin;

    public GameListener(ZombieRushPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onInteractNpc(PlayerInteractEntityEvent event) {
        Entity entity = event.getRightClicked();
        if (!plugin.getJoinNpcManager().isJoinNpc(entity))
            return;
        event.setCancelled(true);
        plugin.getMatchManager().requestStart(event.getPlayer());
    }

    @EventHandler
    public void onDamageNpc(EntityDamageByEntityEvent event) {
        if (!plugin.getJoinNpcManager().isJoinNpc(event.getEntity()))
            return;
        event.setCancelled(true);
        if (event.getDamager() instanceof Player player) {
            plugin.getMatchManager().requestStart(player);
        }
    }

    @EventHandler
    public void onNpcTarget(EntityTargetEvent event) {
        if (plugin.getJoinNpcManager().isJoinNpc(event.getEntity())) {
            event.setCancelled(true);
            event.setTarget(null);
        }
    }

    @EventHandler
    public void onEntityDamage(EntityDamageEvent event) {
        if (event.getEntity() instanceof Player player && plugin.getMatchManager().isInMatch(player.getUniqueId())) {
            if (event.getFinalDamage() >= player.getHealth()) {
                event.setCancelled(true);
                plugin.getMatchManager().handleFatalDamage(player);
            }
        }
        if (plugin.getJoinNpcManager().isJoinNpc(event.getEntity())) {
            event.setCancelled(true);
        }
    }

    @EventHandler
    public void onZombieDeath(EntityDeathEvent event) {
        if (!(event.getEntity() instanceof Zombie zombie))
            return;
        if (!plugin.isArenaZombie(zombie))
            return;
        event.getDrops().clear();
        event.setDroppedExp(0);
        Player killer = zombie.getKiller();
        if (killer != null) {
            plugin.getMatchManager().handleZombieKill(killer, zombie);
        }
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();
        event.setQuitMessage(Msg.color("&eSampai jumpa, &f" + player.getName()
                + "&e. Terima kasih sudah bermain di ZombieRush."));
        plugin.getMatchManager().removeFromQueue(player.getUniqueId());
        if (plugin.getMatchManager().isInMatch(player.getUniqueId())) {
            plugin.getMatchManager().finishMatch(player, EndReason.QUIT);
        }
    }

    @EventHandler
    public void onBreak(BlockBreakEvent event) {
        if (plugin.getMatchManager().isInMatch(event.getPlayer().getUniqueId())) {
            event.setCancelled(true);
            Msg.warn(event.getPlayer(), plugin.getConfig(),
                    "Anda tidak dapat menghancurkan blok selama sesi Zombie Rush.");
        }
    }

    @EventHandler
    public void onPlace(BlockPlaceEvent event) {
        if (plugin.getMatchManager().isInMatch(event.getPlayer().getUniqueId())) {
            event.setCancelled(true);
            Msg.warn(event.getPlayer(), plugin.getConfig(), "Anda tidak dapat menaruh blok selama sesi Zombie Rush.");
        }
    }

    @EventHandler
    public void onDrop(PlayerDropItemEvent event) {
        if (plugin.getMatchManager().isInMatch(event.getPlayer().getUniqueId())) {
            event.setCancelled(true);
            Msg.warn(event.getPlayer(), plugin.getConfig(), "Anda tidak dapat membuang item selama sesi Zombie Rush.");
        }
    }

    public boolean belongsToMatch(Zombie zombie, ActiveMatch match) {
        String arenaId = zombie.getPersistentDataContainer().get(plugin.getArenaZombieKey(), PersistentDataType.STRING);
        return arenaId != null && arenaId.equals(String.valueOf(match.arena().id()));
    }
}
