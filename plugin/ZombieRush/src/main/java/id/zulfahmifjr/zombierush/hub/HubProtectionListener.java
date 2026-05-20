package id.zulfahmifjr.zombierush.hub;

import id.zulfahmifjr.zombierush.ZombieRushPlugin;
import id.zulfahmifjr.zombierush.listener.PlacementManager;
import id.zulfahmifjr.zombierush.util.Msg;
import org.bukkit.GameMode;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.event.entity.FoodLevelChangeEvent;
import org.bukkit.event.weather.WeatherChangeEvent;

public class HubProtectionListener implements Listener {
    private final ZombieRushPlugin plugin;
    private final HubManager hubManager;
    private final PlacementManager placementManager;

    public HubProtectionListener(ZombieRushPlugin plugin, HubManager hubManager, PlacementManager placementManager) {
        this.plugin = plugin;
        this.hubManager = hubManager;
        this.placementManager = placementManager;
    }

    @EventHandler
    public void onBreak(BlockBreakEvent event) {
        if (!hubManager.isProtectionEnabled("block-break", true))
            return;
        Player player = event.getPlayer();
        if (!hubManager.isHubWorld(player.getWorld()))
            return;
        if (player.getGameMode() == GameMode.CREATIVE)
            return;
        if (placementManager != null && placementManager.has(player.getUniqueId()))
            return;

        event.setCancelled(true);
        Msg.warn(player, plugin.getConfig(), "Anda tidak dapat menghancurkan blok di area lobby.");
    }

    @EventHandler
    public void onPlace(BlockPlaceEvent event) {
        if (!hubManager.isProtectionEnabled("block-place", true))
            return;
        Player player = event.getPlayer();
        if (!hubManager.isHubWorld(player.getWorld()))
            return;
        if (player.getGameMode() == GameMode.CREATIVE)
            return;

        event.setCancelled(true);
        Msg.warn(player, plugin.getConfig(), "Anda tidak dapat menempatkan blok di area lobby.");
    }

    @EventHandler
    public void onWeatherChange(WeatherChangeEvent event) {
        if (!hubManager.isLockWeatherEnabled())
            return;
        if (!hubManager.isHubWorld(event.getWorld()))
            return;
        if (!event.toWeatherState())
            return;

        event.setCancelled(true);
    }

    @EventHandler
    public void onPvP(EntityDamageByEntityEvent event) {
        if (!hubManager.isProtectionEnabled("pvp", true))
            return;
        if (!(event.getDamager() instanceof Player damager))
            return;
        if (!(event.getEntity() instanceof Player target))
            return;
        if (!hubManager.isHubWorld(damager.getWorld()) && !hubManager.isHubWorld(target.getWorld()))
            return;

        event.setCancelled(true);
        Msg.warn(damager, plugin.getConfig(), "PvP tidak diizinkan di area lobby.");
    }

    @EventHandler
    public void onPlayerDamage(EntityDamageEvent event) {
        if (!hubManager.isProtectionEnabled("damage", true))
            return;
        if (!(event.getEntity() instanceof Player player))
            return;
        if (!hubManager.isHubWorld(player.getWorld()))
            return;

        event.setCancelled(true);
    }

    @EventHandler
    public void onFoodChange(FoodLevelChangeEvent event) {
        if (!hubManager.isProtectionEnabled("hunger", true))
            return;
        if (!(event.getEntity() instanceof Player player))
            return;
        if (!hubManager.isHubWorld(player.getWorld()))
            return;

        event.setCancelled(true);
        event.setFoodLevel(20);
        player.setSaturation(20f);
    }
}
