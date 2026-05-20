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

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class HubProtectionListener implements Listener {
    private final ZombieRushPlugin plugin;
    private final HubManager hubManager;
    private final PlacementManager placementManager;
    private static final long MESSAGE_COOLDOWN_MS = 2000L;
    private final Map<UUID, Long> breakMessageCooldown = new HashMap<>();
    private final Map<UUID, Long> placeMessageCooldown = new HashMap<>();

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
        if (placementManager != null && placementManager.has(player.getUniqueId()))
            return;

        if (player.getGameMode() == GameMode.CREATIVE || player.hasPermission("zombierush.admin")) {
            if (shouldSend(breakMessageCooldown, player.getUniqueId())) {
                Msg.info(player, plugin.getConfig(),
                        "Mode kreatif terdeteksi. Anda dapat menghancurkan blok di lobby sebagai admin.");
            }
            return;
        }

        event.setCancelled(true);
        if (shouldSend(breakMessageCooldown, player.getUniqueId())) {
            Msg.warn(player, plugin.getConfig(), "Anda tidak dapat menghancurkan blok di area lobby.");
        }
    }

    @EventHandler
    public void onPlace(BlockPlaceEvent event) {
        if (!hubManager.isProtectionEnabled("block-place", true))
            return;
        Player player = event.getPlayer();
        if (!hubManager.isHubWorld(player.getWorld()))
            return;
        if (placementManager != null && placementManager.has(player.getUniqueId()))
            return;

        if (player.getGameMode() == GameMode.CREATIVE || player.hasPermission("zombierush.admin")) {
            if (shouldSend(placeMessageCooldown, player.getUniqueId())) {
                Msg.info(player, plugin.getConfig(),
                        "Mode kreatif terdeteksi. Anda dapat menempatkan blok di lobby sebagai admin.");
            }
            return;
        }

        event.setCancelled(true);
        if (shouldSend(placeMessageCooldown, player.getUniqueId())) {
            Msg.warn(player, plugin.getConfig(), "Anda tidak dapat menempatkan blok di area lobby.");
        }
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

    private boolean shouldSend(Map<UUID, Long> cooldowns, UUID uuid) {
        long now = System.currentTimeMillis();
        Long last = cooldowns.get(uuid);
        if (last != null && now - last < MESSAGE_COOLDOWN_MS) {
            return false;
        }
        cooldowns.put(uuid, now);
        return true;
    }
}
