package id.zulfahmifjr.zombierush.hub;

import id.zulfahmifjr.zombierush.ZombieRushPlugin;
import org.bukkit.Bukkit;
import org.bukkit.GameRule;
import org.bukkit.World;

public class HubManager {
    private final ZombieRushPlugin plugin;

    public HubManager(ZombieRushPlugin plugin) {
        this.plugin = plugin;
    }

    public void setupHubWorld() {
        World hub = getHubWorld();
        if (hub == null) {
            plugin.getLogger().warning("World Hub tidak ditemukan. Fitur lobby akan aktif setelah world Hub tersedia.");
            return;
        }
        applyWorldSettings(hub);
        plugin.getLogger().info("World Hub berhasil disiapkan untuk lobby ZombieRush.");
    }

    public void applyWorldSettings(World hub) {
        if (hub == null)
            return;
        if (isLockTimeEnabled()) {
            hub.setGameRule(GameRule.DO_DAYLIGHT_CYCLE, false);
            hub.setTime(getHubTime());
        }
        if (isLockWeatherEnabled()) {
            hub.setGameRule(GameRule.DO_WEATHER_CYCLE, false);
            hub.setStorm(false);
            hub.setThundering(false);
        }
    }

    public World getHubWorld() {
        String name = getHubWorldName();
        if (name == null || name.isBlank())
            return null;
        return Bukkit.getWorld(name);
    }

    public String getHubWorldName() {
        return plugin.getConfig().getString("hub.world", "Hub");
    }

    public boolean isHubWorld(World world) {
        if (world == null)
            return false;
        String name = getHubWorldName();
        return name != null && world.getName().equalsIgnoreCase(name);
    }

    public boolean isTeleportOnJoinEnabled() {
        return plugin.getConfig().getBoolean("hub.teleport-on-join", true);
    }

    public boolean isLockTimeEnabled() {
        return plugin.getConfig().getBoolean("hub.lock-time", true);
    }

    public boolean isLockWeatherEnabled() {
        return plugin.getConfig().getBoolean("hub.lock-weather", true);
    }

    public long getHubTime() {
        return plugin.getConfig().getLong("hub.time", 6000L);
    }

    public boolean isProtectionEnabled(String key, boolean defaultValue) {
        return plugin.getConfig().getBoolean("hub.protection." + key, defaultValue);
    }

    public boolean isJoinTitleEnabled() {
        return plugin.getConfig().getBoolean("hub.join-title.enabled", true);
    }

    public String getJoinTitle() {
        return plugin.getConfig().getString("hub.join-title.title", "&bSelamat Datang di ZombieRush!");
    }

    public String getJoinSubtitle() {
        return plugin.getConfig().getString("hub.join-title.subtitle", "&eServer Mini Project SBD Kelompok 3");
    }

    public int getTitleFadeIn() {
        return plugin.getConfig().getInt("hub.join-title.fade-in", 20);
    }

    public int getTitleStay() {
        return plugin.getConfig().getInt("hub.join-title.stay", 100);
    }

    public int getTitleFadeOut() {
        return plugin.getConfig().getInt("hub.join-title.fade-out", 20);
    }
}
